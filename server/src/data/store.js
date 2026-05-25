/**
 * In-memory log store.
 *
 * Seeded with 50,000 historical entries on startup.
 * New entries are appended by the live-push interval (see index.js).
 *
 * Shape of a log entry:
 * {
 *   id:        string   — unique entry ID
 *   action:    string   — what the agent did
 *   agentId:   string   — which agent produced this entry
 *   status:    "ok" | "warning" | "error"
 *   meta:      string   — arbitrary detail string (shown in expanded row)
 *   timestamp: number   — Unix ms
 * }
 */

const ACTIONS = [
  "tool_call",
  "llm_inference",
  "memory_read",
  "memory_write",
  "human_review_requested",
  "policy_check",
  "output_formatted",
  "context_truncated",
  "retry_attempted",
  "session_started",
];

const AGENTS = ["agent-alpha", "agent-beta", "agent-gamma", "agent-delta"];

const STATUS_WEIGHTS = [
  // [status, weight]
  ["ok",      80],
  ["warning", 15],
  ["error",    5],
];

function weightedStatus() {
  const roll = Math.random() * 100;
  let cumulative = 0;
  for (const [status, weight] of STATUS_WEIGHTS) {
    cumulative += weight;
    if (roll < cumulative) return status;
  }
  return "ok";
}

let counter = 50_000;

export function makeEntry(overrides = {}) {
  const id = `log-${++counter}`;
  const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  const agentId = AGENTS[Math.floor(Math.random() * AGENTS.length)];
  const status = weightedStatus();

  return {
    id,
    action,
    agentId,
    status,
    meta: `${agentId} executed ${action} — exit code ${status === "error" ? 1 : 0}`,
    timestamp: Date.now(),
    ...overrides,
  };
}

// ── Seed 50k historical entries (oldest first) ────────────────────────────────
// Entries are stored newest-first in the array so index 0 is always the latest.
const ONE_HOUR_MS = 60 * 60 * 1_000;

export const logStore = Array.from({ length: 50_000 }, (_, i) => {
  const id = `log-${50_000 - i}`;
  const action = ACTIONS[i % ACTIONS.length];
  const agentId = AGENTS[i % AGENTS.length];
  const status = i % 20 === 0 ? "error" : i % 7 === 0 ? "warning" : "ok";
  return {
    id,
    action,
    agentId,
    status,
    meta: `${agentId} executed ${action} — seeded entry #${50_000 - i}`,
    timestamp: Date.now() - (i * (ONE_HOUR_MS / 50_000)),
  };
});
