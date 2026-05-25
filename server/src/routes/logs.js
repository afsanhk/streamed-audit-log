/**
 * Log routes
 *
 * GET  /api/logs          — paginated historical entries (newest first)
 * GET  /api/logs/live     — SSE stream; pushes new entries as they arrive
 *
 * YOUR TASKS (frontend):
 *  1. Fetch the first page on mount and render with TanStack Virtual.
 *  2. Implement "load more" (infinite scroll or a button) using cursor pagination.
 *  3. Open the /api/logs/live SSE stream and prepend new entries to the list.
 *  4. If the user is scrolled down, show a "N new entries" toast instead of
 *     jumping the scroll position.
 *  5. Clicking a row should expand it to show the `meta` field.
 *
 * STRETCH:
 *  - Add status filter (?status=error) to the paginated endpoint.
 *  - Add agent filter (?agentId=agent-alpha).
 *  - Persist expanded row IDs in URL search params.
 */

import { logStore, makeEntry } from "../data/store.js";

// SSE clients waiting for live pushes
const liveClients = new Set();

// Push a new entry every 2 seconds to simulate live agent activity
setInterval(() => {
  const entry = makeEntry();
  logStore.unshift(entry); // prepend so index 0 stays newest

  // Broadcast to all connected SSE clients
  const frame = `event: entry\ndata: ${JSON.stringify(entry)}\n\n`;
  for (const res of liveClients) {
    res.write(frame);
  }
}, 2_000);

// ── Route plugin ──────────────────────────────────────────────────────────────
export default async function logRoutes(fastify) {

  /**
   * GET /api/logs
   *
   * Query params:
   *   cursor  — the `id` of the last entry you received (for pagination)
   *   limit   — number of entries to return (default 50, max 200)
   *   status  — filter by status: "ok" | "warning" | "error"
   *   agentId — filter by agent ID
   *
   * Response:
   * {
   *   entries:    LogEntry[]
   *   nextCursor: string | null   — pass as `cursor` in the next request
   *   total:      number          — total entries (unfiltered)
   * }
   */
  fastify.get("/logs", async (request, reply) => {
    const limit     = Math.min(Number(request.query.limit  ?? 50), 200);
    const cursor    = request.query.cursor  ?? null;
    const statusFilter  = request.query.status  ?? null;
    const agentFilter   = request.query.agentId ?? null;

    // Apply filters
    let filtered = logStore;
    if (statusFilter) filtered = filtered.filter((e) => e.status === statusFilter);
    if (agentFilter)  filtered = filtered.filter((e) => e.agentId === agentFilter);

    // Cursor-based pagination
    let startIndex = 0;
    if (cursor) {
      const idx = filtered.findIndex((e) => e.id === cursor);
      startIndex = idx === -1 ? 0 : idx + 1;
    }

    const entries = filtered.slice(startIndex, startIndex + limit);
    const nextCursor = entries.length === limit
      ? entries[entries.length - 1].id
      : null;

    return { entries, nextCursor, total: logStore.length };
  });

  /**
   * GET /api/logs/live
   *
   * SSE stream. Pushes new log entries as they are created.
   *
   * Event types:
   *   entry  — { LogEntry }      a new log entry just arrived
   *   ping   — { ts: number }    keepalive every 15 s
   */
  fastify.get("/logs/live", async (request, reply) => {
    reply.raw.writeHead(200, {
      "Content-Type":      "text/event-stream",
      "Cache-Control":     "no-cache",
      "Connection":        "keep-alive",
      "X-Accel-Buffering": "no",
    });

    // Register this client
    liveClients.add(reply.raw);

    // Keepalive ping every 15 s
    const ping = setInterval(() => {
      reply.raw.write(`event: ping\ndata: ${JSON.stringify({ ts: Date.now() })}\n\n`);
    }, 15_000);

    // Clean up when client disconnects
    request.raw.on("close", () => {
      clearInterval(ping);
      liveClients.delete(reply.raw);
    });

    // Hold the connection open — Fastify must not send a response
    await new Promise(() => {});
  });
}
