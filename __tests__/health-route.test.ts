/**
 * __tests__/health-route.test.ts
 * /api/health: which data source is serving and why, without revealing credentials.
 */

type Body = Record<string, unknown> & { database: Record<string, unknown> };

const request = (query = '', ip = `ip-${Math.random()}`) =>
  new Request(`http://localhost/api/health${query}`, { headers: { 'x-forwarded-for': ip } });

async function freshRoute() {
  jest.resetModules(); // data.ts caches the loaded dataset per process
  return import('@/app/api/health/route');
}

afterEach(() => {
  delete process.env.DATABASE_URL;
  delete process.env.DATABASE_CA_CERT;
});

describe('/api/health without a database', () => {
  it('reports the JSON snapshot and a clean "not configured" database', async () => {
    const { GET } = await freshRoute();
    const res = await GET(request());
    const body = (await res.json()) as Body;
    expect(res.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.dataSource).toBe('json-snapshot');
    expect(body.database).toEqual({ configured: false, status: 'not_configured' });
    expect(body.mpCount).toBeGreaterThan(0);
    expect(typeof body.snapshotSha256).toBe('string');
  });

  it('the deep check says "not reachable: null" rather than pretending', async () => {
    const { GET } = await freshRoute();
    const body = (await (await GET(request('?deep=1'))).json()) as Body;
    expect(body.database).toEqual({ configured: false, status: 'not_configured', reachable: null });
  });

  it('rate-limits the deep check per IP', async () => {
    const { GET } = await freshRoute();
    const statuses: number[] = [];
    for (let i = 0; i < 12; i += 1) statuses.push((await GET(request('?deep=1', 'same-ip'))).status);
    expect(statuses.slice(0, 10).every((s) => s === 200)).toBe(true);
    expect(statuses[11]).toBe(429);
    // The plain check is never limited.
    expect((await GET(request('', 'same-ip'))).status).toBe(200);
  });
});

describe('/api/health with a database that cannot be reached', () => {
  it('stays up on the JSON snapshot and says it is degraded', async () => {
    // Port 1 refuses connections immediately.
    process.env.DATABASE_URL = 'postgresql://user:secret-pass@127.0.0.1:1/yugabyte';
    const { GET } = await freshRoute();
    const res = await GET(request('?deep=1'));
    const body = (await res.json()) as Body;
    expect(res.status).toBe(200);
    expect(body.status).toBe('degraded');
    expect(body.dataSource).toBe('json-snapshot (database unreachable)');
    expect(body.database.configured).toBe(true);
    expect(body.database.status).toBe('unreachable');
    expect(body.database.reachable).toBe(false);
    expect(typeof body.database.latencyMs).toBe('number');
    expect(body.mpCount).toBeGreaterThan(0); // the site still has data
  });

  it('never exposes the connection string, user, password or host', async () => {
    process.env.DATABASE_URL = 'postgresql://user:secret-pass@127.0.0.1:1/yugabyte';
    const { GET } = await freshRoute();
    const text = JSON.stringify(await (await GET(request('?deep=1'))).json());
    expect(text).not.toMatch(/secret-pass|127\.0\.0\.1|postgresql:|user:/);
  });
});
