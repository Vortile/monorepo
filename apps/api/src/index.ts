import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { env } from "./config/env";
import wabaRoute from "./routes/waba/waba";
import emailsRoute from "./routes/emails/emails";

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
app.route("/api/emails", emailsRoute);

const port = env.PORT;
console.log(`Server running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
