import { useRef, useState, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useLiveLogs } from "../hooks/useLiveLogs.js";
import "./AuditLog.css";

/**
 * AuditLog
 * ────────
 * YOUR TASK: wire useLiveLogs + TanStack Virtual and build the UI.
 *
 * Required behaviour:
 *   1. Render all entries in a virtualized list (only visible rows in the DOM)
 *   2. Each row shows: status dot, action, agentId, and a formatted timestamp
 *   3. Clicking a row expands it to show the full `meta` field
 *   4. Clicking the expanded row collapses it
 *   5. When newCount > 0 AND user is scrolled down, show a toast:
 *      "↑ N new entries" — clicking it scrolls back to the top and clears the count
 *   6. When the user scrolls near the bottom, call loadMore()
 *
 * HINTS:
 *   - Use a `parentRef` on the scroll container and pass it to useVirtualizer
 *   - estimateSize should return a base row height (e.g. 48) — expanded rows will
 *     be taller, so use `measureElement` or bump estimateSize when a row is expanded
 *   - Track expanded row IDs in a Set via useState:
 *       const [expandedIds, setExpandedIds] = useState(new Set())
 *   - For the "near bottom" trigger: in the virtualizer's scroll handler (or a
 *     useEffect watching virtualItems), check if the last virtual item is visible
 *   - isAtTop: scrollTop of the parentRef < some threshold (e.g. 200px)
 *     Pass this into useLiveLogs so it knows whether to increment newCount
 *
 * STRETCH:
 *   - Add a status filter bar (All / OK / Warning / Error)
 *   - Colour-code row left border by status
 *   - Show a loading spinner at the bottom while hasMore && isLoading
 */

export function AuditLog() {
  const parentRef = useRef(null);
  const [expandedIds, setExpandedIds] = useState(new Set());

  const { entries, isLoading, hasMore, loadMore, newCount, clearNewCount } =
    useLiveLogs();

  // ── Virtualizer ───────────────────────────────────────────────────────────
  // TODO: set up useVirtualizer with:
  //   count: entries.length
  //   getScrollElement: () => parentRef.current
  //   estimateSize: () => 48
  //   overscan: 8
  const rowVirtualizer = useVirtualizer({
    count: entries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 8,
  });

  // ── Scroll to top ─────────────────────────────────────────────────────────
  const scrollToTop = useCallback(() => {
    // TODO: scroll parentRef.current to top, then clearNewCount()
  }, [clearNewCount]);

  // ── Toggle row expansion ──────────────────────────────────────────────────
  const toggleRow = useCallback((id) => {
    // TODO: add id to expandedIds if not present, remove if present
  }, []);

  return (
    <div className="audit-log">

      <div className="audit-log-header">
        <h1>Audit Log</h1>
        {/* TODO: entry count badge — e.g. "50,012 entries" */}
      </div>

      {/* New entries toast */}
      {/* TODO: show only when newCount > 0 */}
      <div className="new-entries-toast" style={{ display: "none" }}>
        ↑ {newCount} new {newCount === 1 ? "entry" : "entries"}
      </div>

      {/* Virtualised scroll container */}
      <div className="audit-log-scroll" ref={parentRef}>

        {isLoading && entries.length === 0 && (
          <div className="loading">Loading entries...</div>
        )}

        {/* Total size container — required by TanStack Virtual */}
        <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>

          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const entry = entries[virtualRow.index];
            if (!entry) return null;
            const isExpanded = expandedIds.has(entry.id);

            return (
              <div
                key={entry.id}
                className={`log-row ${entry.status} ${isExpanded ? "expanded" : ""}`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                onClick={() => toggleRow(entry.id)}
              >
                {/* TODO: status dot */}
                {/* TODO: action label */}
                {/* TODO: agentId */}
                {/* TODO: formatted timestamp */}
                {/* TODO: expanded meta panel (only when isExpanded) */}
              </div>
            );
          })}

        </div>

        {/* Load more trigger — sits at the bottom of the list */}
        {hasMore && (
          <div className="load-more-trigger">
            {/* TODO: call loadMore() when this element scrolls into view
                Simplest approach: add an onScroll handler to the parent container
                and check if scrollTop + clientHeight >= scrollHeight - threshold */}
          </div>
        )}

      </div>
    </div>
  );
}
