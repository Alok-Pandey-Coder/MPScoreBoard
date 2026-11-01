/**
 * __tests__/db-config.test.ts
 * How the app turns DATABASE_URL / DATABASE_CA_CERT into a verified TLS
 * connection (lib/db.ts buildPoolConfig). No database is contacted.
 */

import { Client } from 'pg';
import { buildPoolConfig } from '@/lib/db';

const PEM = '-----BEGIN CERTIFICATE-----\nMIIBfakeFAKEfake\n-----END CERTIFICATE-----';
// password is p@ss:w/rd# , percent-encoded
const BASE = 'postgresql://admin:p%40ss%3Aw%2Frd%23@host.example.com:5433/yugabyte';

type Tls = { ca?: string; rejectUnauthorized?: boolean };
const tlsOf = (config: NonNullable<ReturnType<typeof buildPoolConfig>>) =>
  (new Client(config) as unknown as { connectionParameters: { ssl: Tls | false | undefined } }).connectionParameters.ssl;

describe('buildPoolConfig', () => {
  it('is null when no database is configured', () => {
    expect(buildPoolConfig({})).toBeNull();
    expect(buildPoolConfig({ DATABASE_URL: '' })).toBeNull();
    expect(buildPoolConfig({ DATABASE_URL: '   ' })).toBeNull();
    // A certificate alone does not configure a database.
    expect(buildPoolConfig({ DATABASE_CA_CERT: PEM })).toBeNull();
  });

  it('passes a plain URL through untouched; a local certificate path stays in the URL', () => {
    const url = `${BASE}?sslmode=verify-full&sslrootcert=certs/root.crt`;
    const config = buildPoolConfig({ DATABASE_URL: url })!;
    expect(config.connectionString).toBe(url);
    expect(config.ssl).toBeUndefined();
    expect(config.max).toBe(3);
    expect(config.connectionTimeoutMillis).toBe(5_000);
  });

  it('uses the certificate text, always verifying the server, and drops URL TLS parameters', () => {
    const config = buildPoolConfig({
      DATABASE_URL: `${BASE}?ssl=true&sslmode=verify-full&sslrootcert=C:/x/root.crt&application_name=mera`,
      DATABASE_CA_CERT: PEM,
    })!;
    expect(config.ssl).toEqual({ ca: PEM, rejectUnauthorized: true });
    expect(config.connectionString).not.toMatch(/ssl/i);
    expect(config.connectionString).toContain('application_name=mera');
  });

  it('keeps special characters in the password intact', () => {
    const config = buildPoolConfig({ DATABASE_URL: `${BASE}?sslmode=verify-full`, DATABASE_CA_CERT: PEM })!;
    const url = new URL(config.connectionString!);
    expect(decodeURIComponent(url.password)).toBe('p@ss:w/rd#');
    expect(url.username).toBe('admin');
    expect(url.hostname).toBe('host.example.com');
    expect(url.port).toBe('5433');
    expect(url.pathname).toBe('/yugabyte');
  });

  it('accepts the certificate pasted on one line with backslash-n sequences', () => {
    const oneLine = PEM.replace(/\n/g, '\\n');
    expect(oneLine).not.toContain('\n');
    expect(buildPoolConfig({ DATABASE_URL: BASE, DATABASE_CA_CERT: oneLine })!.ssl).toEqual({ ca: PEM, rejectUnauthorized: true });
  });

  it('is what the pg driver will really use: the explicit CA, verification on, password decoded', () => {
    const config = buildPoolConfig({ DATABASE_URL: `${BASE}?sslmode=verify-full`, DATABASE_CA_CERT: PEM })!;
    const tls = tlsOf(config) as Tls;
    expect(tls.ca).toBe(PEM);
    expect(tls.rejectUnauthorized).toBe(true);
    const client = new Client(config);
    expect(client.password).toBe('p@ss:w/rd#');
    expect(client.host).toBe('host.example.com');
  });
});
