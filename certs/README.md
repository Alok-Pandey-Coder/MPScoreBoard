# certs/

`root.crt` is the **public CA certificate chain** of the YugabyteDB Aeon cluster. It lets the
app and the loader verify that they are talking to the real database (`sslmode=verify-full`).

- It is **not a secret** (it holds no private key), so it is committed. The database
  **password** is the secret and lives only in `.env` / the host's environment variables.
- It lives here, at the project root, and **not in `public/`**: everything in `public/` is
  served to the internet, and nothing in the browser needs this file.
- Locally: `DATABASE_URL=postgresql://…?sslmode=verify-full&sslrootcert=certs/root.crt`.
- On Vercel (no files): put the text of `root.crt` in the `DATABASE_CA_CERT` environment
  variable. See `docs/deploy.md`.
