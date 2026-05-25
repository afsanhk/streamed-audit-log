import Fastify from "fastify";
import cors from "@fastify/cors";
import logRoutes from "./routes/logs.js";

const fastify = Fastify({ logger: true });

// ── Plugins ───────────────────────────────────────────────────────────────────
await fastify.register(cors, {
  origin: "http://localhost:5173",
  methods: ["GET"],
});

// ── Routes ────────────────────────────────────────────────────────────────────
await fastify.register(logRoutes, { prefix: "/api" });

// ── Start ─────────────────────────────────────────────────────────────────────
try {
  await fastify.listen({ port: 3002, host: "0.0.0.0" });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
