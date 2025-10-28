## Running en-git (local development)

This document describes prerequisites and how to run the project locally (web client, server, and extension).

## Prerequisites

- Node.js 18+ (recommended) and npm (or yarn/pnpm). Many parts assume Node 18 since server runtime uses nodejs18.x.
- Git
- MongoDB (local or MongoDB Atlas) — a connection URI is required in `server/.env` as `MONGODB_URI`.
- (Optional) Accounts / API keys for third-party integrations:
  - GitHub token (GITHUB_TOKEN) to increase API rate limits
  - Google API key (GOOGLE_API_KEY) for generative AI features
  - Cloudinary credentials for avatar/uploads
  - SMTP credentials for outgoing email (nodemailer)
  - Razorpay keys (if payments are used)
  - OAuth client IDs/secrets for Google/GitHub (GOOGLE_CLIENT_ID/SECRET, GITHUB_CLIENT_ID/SECRET)

## Quick start (recommended)

1. Clone the repo and open the workspace

2. Server

```bash
cd server
cp .env.example .env   # create your .env and fill values
npm install
# Start server in dev mode (uses nodemon and dotenv)
npm run dev
```

3. Client (web app)

```bash
cd client
npm install
# Run Vite dev server
npm run dev
```

Vite will typically run on `http://localhost:5173` (the client uses this URL by default). Configure `CLIENT_URL` in the server `.env` to match.

4. Chrome extension (optional)

- The extension code lives in `chrome-extension/`. It includes its own `package.json` (build scripts). To build the extension assets, open that folder and run the build script if applicable.

## Key environment variables (server)

Create `server/.env` (copy `server/.env.example`) and provide the following values:

- `MONGODB_URI` — MongoDB connection string
- `PORT` — server port (default 8000)
- `SERVER_URL` — e.g. `http://localhost:8000`
- `CLIENT_URL` — e.g. `http://localhost:5173`
- `CORS_ORIGIN` — comma-separated origins to allow (optional)
- `GITHUB_TOKEN` — optional GitHub token to reduce rate limiting
- OAuth: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `GOOGLE_API_KEY` — required for the chatbot/generative AI features
- JWT: `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `ACCESS_TOKEN_EXPIRY`, `REFRESH_TOKEN_EXPIRY`
- Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`
- Payments: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (if payments used)

## Notes and troubleshooting

- GITHUB_TOKEN — the GitHub API imposes strict unauthenticated rate limits which cause 403 errors when exceeded. Adding a personal or app token in `GITHUB_TOKEN` lets the server make authenticated requests (see `server/src/controllers/repository.controller.js`) and greatly reduces rate-limit failures.

- MONGODB_URI — this is the connection string the server uses to connect to MongoDB (`server/src/db/index.js`). If it's missing or incorrect the server cannot connect to the database and will exit. Troubleshooting: ensure MongoDB is running, that the hostname/port are reachable, and credentials (if any) are correct.

- SERVER_URL & CLIENT_URL — `SERVER_URL` is used to construct OAuth callback URLs and server-side redirects (see `server/src/utils/passport.js`), while `CLIENT_URL` is used for redirects back to the frontend and to set the default allowed origin for the client. If these are mismatched with the OAuth provider configuration you'll get callback/redirect errors.

- CORS_ORIGIN — used by the server to allow additional origins for CORS (see `server/src/app.js`). Add any development hosts, preview URLs, or local addresses here (comma-separated) to avoid CORS errors from the browser.

- GITHUB_CLIENT_ID & GITHUB_CLIENT_SECRET — required for enabling GitHub OAuth login. Without these your OAuth flow will fail during provider authentication and callbacks.

- GOOGLE_API_KEY (and related Google OAuth vars) — the chatbot/generative AI endpoints call Google Generative AI APIs (`server/src/controllers/chatbot.controller.js` and `server/src/services/ai.service.js`). If this key is missing or quota is exhausted, AI features will return errors.

- ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY — JWT secrets and expiry values are used to sign/verify access and refresh tokens (see `server/src/models/user.model.js`). Use strong, random secrets and sensible expiries to avoid authentication or replay problems.

- CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET — these credentials are required for uploading avatars and other files to Cloudinary (`server/src/utils/cloudinary.js`). Uploads will fail if credentials are absent or incorrect.

- SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL — nodemailer uses these to send emails (password resets, notifications). If mail delivery fails, check network access to the SMTP host, TLS/port settings, and credentials.

- RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET — required if the payments endpoints are used. Missing or incorrect keys will cause payment creation/verification to fail.

- TWILIO_ACCOUNT_SID & TWILIO_AUTH_TOKEN — used for SMS notifications or two-factor features (if enabled). Without them, SMS-related endpoints will error.

- NODE_ENV — controls environment-specific behavior (e.g., cookie secure flags). Setting `NODE_ENV=production` flips certain security behaviors (see cookie settings in `server/src/routes/user.routes.js`).

Tips for debugging missing/invalid env values

- Check server startup logs — many modules print either a success or a clear error when required envs are missing (for example `server/src/utils/passport.js` logs whether OAuth client IDs are present).
- Use the provided `server/.env.example` as a template and copy it to `server/.env` for local development. Never commit `.env` to source control.
- For GitHub rate limits: add a `GITHUB_TOKEN` or use authenticated endpoints and verify the token has the appropriate scopes.
- For OAuth callback issues: ensure the provider (GitHub/Google) has the exact callback URL configured (it must match `SERVER_URL` + `/api/v1/users/auth/<provider>/callback`).
- For email/cloudinary/payment failures: validate credentials and network connectivity to those services (try `curl`/Postman or provider dashboards).
- For MongoDB connectivity: confirm the database is reachable from your machine (or the host where the server runs) and that the `MONGODB_URI` includes correct credentials and replica set parameters if required.

- Recommended Node.js version: 18.x — the server is configured for Node 18 (Vercel runtime is `nodejs18.x`) and some dependencies expect modern Node APIs.

## Running both client and server concurrently

Open two terminals and run the server and client start commands above. Alternatively use a tool like `concurrently` if you want a single terminal to manage both.

## Where to look for code

- Server entry: `server/src/index.js` and `server/src/app.js`
- Client entry: `client/src/main.jsx` (Vite + React)
- Chrome extension: `chrome-extension/` folder

