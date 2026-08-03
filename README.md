# Skytech CRM Frontend

Production-oriented frontend for Skytech CRM, built from the supplied Figma PDF with Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS, shadcn/ui primitives, Zustand, TanStack Query, React Hook Form/Zod, Recharts, and Axios.

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer
- Skytech CRM API running locally or reachable over HTTP

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template:

   ```bash
   copy .env.example .env.local
   ```

3. Set the backend URL in `.env.local`:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
   ```

   To review the frontend without a running backend, opt into the development-only login shortcut:

   ```env
   NEXT_PUBLIC_ENABLE_DEMO_AUTH=true
   ```

   Restart the dev server, open `/login`, and choose **Enter demo workspace**. Keep this flag disabled in shared and production environments.

4. Start the development server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000). The API base URL is intentionally configurable and must include `/api/v1`.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
```

The application uses strict TypeScript and the production build performs the final route and type validation.

## Architecture

- `src/app` — App Router pages and shared layouts
- `src/components/ui` — shadcn/ui-compatible primitives
- `src/components` — product features grouped by domain
- `src/services` — typed Axios route mappings
- `src/hooks` — TanStack Query data hooks and permissions
- `src/store` — Zustand auth, sidebar, and notification state
- `src/types` — backend-aligned domain contracts
- `public/assets` — original assets supplied with the design

Authentication tokens are persisted in local storage, mirrored to a same-site route cookie for proxy route guards, refreshed on 401 responses, and cleared on failed refresh. The mock-shaped UI data in `src/lib/mock-data.ts` keeps every designed screen reviewable while the service/query layer remains ready for the backend.
