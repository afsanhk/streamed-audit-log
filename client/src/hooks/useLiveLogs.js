import { useState, useRef, useCallback, useEffect } from "react";

/**
 * useLiveLogs
 * ───────────
 * YOUR TASK: implement this hook to manage paginated history + live SSE entries.
 *
 * It needs to handle two data sources:
 *
 *   1. PAGINATED HISTORY — fetch GET /api/logs on mount, then again when the
 *      user scrolls near the bottom (cursor-based pagination).
 *
 *   2. LIVE SSE FEED — open GET /api/logs/live and prepend new entries as they
 *      arrive. If the user is scrolled down, don't move their position — instead
 *      increment a `newCount` so the toast can show "N new entries".
 *
 * Return shape (don't change — AuditLog depends on it):
 * {
 *   entries:       LogEntry[]    — all entries to render (history + live prepended)
 *   isLoading:     boolean       — true during initial fetch
 *   hasMore:       boolean       — false when nextCursor is null
 *   loadMore:      () => void    — fetch the next page
 *   newCount:      number        — live entries arrived while scrolled down
 *   clearNewCount: () => void    — call when user scrolls back to top
 * }
 *
 * LogEntry shape (matches the server):
 * {
 *   id:        string
 *   action:    string
 *   agentId:   string
 *   status:    "ok" | "warning" | "error"
 *   meta:      string
 *   timestamp: number
 * }
 *
 * HINTS:
 *   - Keep a cursorRef (useRef) so loadMore always has the latest cursor without
 *     stale closure issues
 *   - For live entries: prepend to the entries array with setEntries(prev => [newEntry, ...prev])
 *   - newCount should only increment when isAtTop is false — pass isAtTop in from
 *     AuditLog via a ref, or accept it as a param to the hook
 *   - Close the EventSource in the useEffect cleanup
 *   - The SSE "ping" event can be ignored
 *
 * STRETCH:
 *   - Accept a `filters` param ({ status, agentId }) and append them as query params
 *   - Debounce loadMore so rapid scroll events don't fire multiple fetches
 */

export function useLiveLogs() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [newCount, setNewCount] = useState(0);

  const cursorRef = useRef(null);

  // TODO: fetch initial page on mount (useEffect, empty deps)

  const loadMore = useCallback(async () => {
    // TODO: guard against concurrent fetches (isLoading) and no more pages (!hasMore)

    // TODO: build URL — append cursor if cursorRef.current is set

    // TODO: fetch /api/logs, update entries, cursorRef, hasMore
  }, [isLoading, hasMore]);

  const clearNewCount = useCallback(() => {
    // TODO: reset newCount to 0
  }, []);

  // TODO: open SSE connection to /api/logs/live in a useEffect
  //       prepend "entry" events to entries
  //       ignore "ping" events
  //       close on cleanup

  return { entries, isLoading, hasMore, loadMore, newCount, clearNewCount };
}
