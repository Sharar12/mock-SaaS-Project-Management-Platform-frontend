# OrbitFlow Frontend

Next.js 15 App Router frontend using React 19, TypeScript, Tailwind CSS, and Lucide icons.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Configuration

- `NEXT_PUBLIC_API_MODE=mock` selects the current local mock adapter.
- `NEXT_PUBLIC_API_URL` is the planned Laravel API base URL.

The current adapter intentionally uses the mock backend until Laravel endpoints are implemented. The only file that imports from `src/mock-backend/` is `src/services/apiService.ts`.

## Data reset

Mock data is stored in browser `localStorage` (`orbitflow_mock_db_v1`). Use Settings → Reset Demo Data to restore the sample workspace data.
