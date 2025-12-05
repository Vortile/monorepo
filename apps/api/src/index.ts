import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { env } from "./config/env";
import wabaRoute from "./routes/waba/waba";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "http://localhost:3001",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);

// Routes
app.get("/api/health", (c) => c.json({ status: "ok" }));
app.route("/api/waba", wabaRoute);

const port = env.PORT;
console.log(`Server running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
