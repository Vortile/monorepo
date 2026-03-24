import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { env } from "./config/env";
import wabaRoute from "./routes/waba/waba";
import wabaOnboardingRoute from "./routes/waba/waba-onboarding.route";
import partnerAppsRoute from "./routes/waba/partner-apps.route";
import emailsRoute from "./routes/emails/emails";
import merchantsRoute from "./routes/merchants/merchants";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: env.ADMIN_ORIGIN ?? "http://localhost:3001",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

// Routes
app.get("/api/health", (c) => c.json({ status: "ok" }));
app.route("/api/waba", wabaRoute);
app.route("/api/waba/onboarding", wabaOnboardingRoute);
app.route("/api/waba/partner-apps", partnerAppsRoute);
app.route("/api/emails", emailsRoute);
app.route("/api/merchants", merchantsRoute);

const port = env.PORT;
console.log(`Server running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
