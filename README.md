# Problem 02 — Virtualized Audit Log

## Goal
Build a scrollable list of 50,000 log entries that only renders what's visible,
prepends live entries without disrupting scroll position, and lets users expand
rows to see detail.

## Getting started

```bash
cd server
npm install
npm run dev     # starts on http://localhost:3002
```

Then scaffold your frontend:
```bash
cd ..
npm create vite@latest client -- --template react
cd client && npm install @tanstack/react-virtual
```

---

## Endpoints

### `GET /api/logs` — Paginated history

| Param     | Type   | Default | Description                          |
|-----------|--------|---------|--------------------------------------|
| `limit`   | number | 50      | Entries per page (max 200)           |
| `cursor`  | string | —       | Last `id` received (for next page)   |
| `status`  | string | —       | Filter: `ok` / `warning` / `error`   |
| `agentId` | string | —       | Filter by agent ID                   |

**Response**
```json
{
  "entries": [ ...LogEntry ],
  "nextCursor": "log-49800" | null,
  "total": 50012
}
```

### `GET /api/logs/live` — SSE live feed

Pushes new entries every ~2 seconds as they arrive.

| Event   | Payload           | When                        |
|---------|-------------------|-----------------------------|
| `entry` | `{ ...LogEntry }` | New log entry created       |
| `ping`  | `{ ts: number }`  | Keepalive every 15 seconds  |

---

## Log entry shape

```ts
type LogEntry = {
  id:        string;
  action:    string;   // e.g. "tool_call", "llm_inference"
  agentId:   string;   // e.g. "agent-alpha"
  status:    "ok" | "warning" | "error";
  meta:      string;   // detail shown in expanded row
  timestamp: number;   // Unix ms
}
```

---

## Your tasks
1. Fetch the first page on mount, render with `@tanstack/react-virtual`
2. Implement cursor-based infinite scroll (load more as user approaches bottom)
3. Open `/api/logs/live` with `EventSource` and prepend new entries
4. If the user is **scrolled down**, show a `"N new entries ↑"` toast — do **not** jump scroll position
5. Clicking a row expands it to show `meta` — clicking again collapses it

## Stretch goals
- Add a status filter bar (`All` / `OK` / `Warning` / `Error`)
- Add an agent filter dropdown
- Colour-code rows by status
- Persist expanded row IDs and active filters in URL search params
- Move `EventSource` logic into a `useLiveLogs()` hook
