# MPScoreBoard — Mera MP, Mera Report Card

A neutral, source-backed report card for Lok Sabha MPs. Every figure links to its public
source and date. See `PRD.md` for the product, `data.md` for the data, and `logs.md` for history.

## Running locally

```bash
npm ci
npm run dev        # http://localhost:3000
```

That is all you need. **No database or Docker is required.** By default the site reads the
reviewed JSON snapshot in `data/processed/mps.json`.

### Optional: YugabyteDB

The site can read the same approved snapshot from YugabyteDB (PostgreSQL-compatible) instead:

```bash
docker compose up -d yugabyte                     # local YugabyteDB on port 5433
pip install -r requirements.txt
export DATABASE_URL=postgresql://yugabyte:yugabyte@localhost:5433/yugabyte
python scripts/load_db.py --schema                # load the approved snapshot
npm run dev
```

| `DATABASE_URL` | What the site uses |
|---|---|
| not set (default) | JSON snapshot (`data/processed/mps.json`) |
| set, database running | YugabyteDB (latest loaded snapshot) |
| set, database not reachable | JSON snapshot, with a warning in the server log |

`/api/health` shows which source is in use (`dataSource`). Both sources hold the same approved
data; `__tests__/db-parity.test.ts` checks they match field for field.

## Data

```bash
npm run data:build     # rebuild the snapshot from cached source captures (no network)
npm run data:refresh   # fetch sources politely, rebuild, check against official records, report
npm run test:data      # pipeline tests
```

Details: `scripts/README.md` and `data.md`.

## Checks

```bash
npm run typecheck && npm run lint && npm test && npm run build
```
