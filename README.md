# Skytech CRM Frontend

Production CRM frontend built from the supplied design PDF with Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS, shadcn/ui primitives, Zustand, TanStack Query, React Hook Form/Zod, Recharts, Axios, and Sonner.

The frontend is integrated with the live Railway API. Browser requests use a same-origin `/api/*` rewrite so local development and Vercel do not depend on the backend's CORS allowlist.

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer
- A valid Skytech CRM user account and access to its six-digit OTP destination

## Local setup

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Create your local environment file:

   ```powershell
   Copy-Item .env.example .env.local
   ```

3. Confirm `.env.local` contains:

   ```env
   NEXT_PUBLIC_API_URL=/api/v1
   SKYTECH_API_ORIGIN=https://skytech-crm-backend-production.up.railway.app
   NEXT_PUBLIC_ENABLE_DEMO_AUTH=false
   ```

4. Start the app:

   ```powershell
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000), sign in with a backend account, then enter the six-digit OTP sent by the API.

## Development-only access

To review all frontend screens without a backend user, set this only in `.env.local`:

```env
NEXT_PUBLIC_ENABLE_DEMO_AUTH=true
```

Restart `npm run dev`, open `/login`, and select **Enter demo workspace**. The shortcut is compiled out of the visible UI unless the flag is exactly `true`. Never enable it in Vercel Preview or Production.

## Validation

Run the complete local quality gate before pushing:

```powershell
npm run typecheck
npm run lint
npm run build
```

## Vercel deployment

1. Push the repository and all commits to GitHub, GitLab, or Bitbucket.
2. In Vercel, choose **Add New → Project**, import the repository, and select **Next.js** as the framework preset.
3. If the Git repository contains both backend and frontend folders, set **Root Directory** to `skytech-crm-frontend`. If the frontend is the repository root, leave Root Directory empty.
4. Keep the standard commands: Install `npm install`, Build `npm run build`, and Output Directory automatic.
5. Add these variables to both **Preview** and **Production**:

   ```env
   NEXT_PUBLIC_API_URL=/api/v1
   SKYTECH_API_ORIGIN=https://skytech-crm-backend-production.up.railway.app
   NEXT_PUBLIC_ENABLE_DEMO_AUTH=false
   ```

6. Click **Deploy**. After it succeeds, open the deployment URL and verify login, OTP, dashboard loading, and logout.
7. If you change any environment variable later, redeploy; Vercel does not apply changed variables to an existing deployment.

The Next.js rewrite means no Railway CORS change is required for this frontend. Keep `SKYTECH_API_ORIGIN` server-only (without the `NEXT_PUBLIC_` prefix) and do not append `/api/v1`; the rewrite adds `/api/*` itself.

## Architecture

- `src/app` — App Router pages, route layouts, and the Next.js proxy guard
- `src/components/ui` — shadcn/ui-compatible primitives
- `src/components` — feature components grouped by CRM domain
- `src/services` — typed Axios mappings for backend routes
- `src/hooks` — TanStack Query hooks, mutations, cache invalidation, and permissions
- `src/store` — Zustand authentication, sidebar, and notification state
- `src/types` — backend-aligned API and domain contracts
- `public/assets` — supplied design assets

The API client converts Spring's snake_case JSON to camelCase frontend models and converts request bodies back to snake_case. Access and refresh tokens are persisted locally, the access token is mirrored to a secure same-site route cookie, 401 responses perform one concurrency-safe refresh attempt, and failed refreshes clear the session. Mutations provide success or actionable error toasts, destructive UI actions require confirmation, and async screens include loading and empty/error states.
