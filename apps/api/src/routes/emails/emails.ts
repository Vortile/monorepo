import { Hono } from "hono";
import { Resend } from "resend";
import { env } from "../../config/env";

const emailsRoute = new Hono();

const getResend = () => new Resend(env.RESEND_API_KEY);

emailsRoute.get("/", async (c) => {
  const parsedLimit = Number(c.req.query("limit"));
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(Math.floor(parsedLimit), 1), 50)
    : 10;

  try {
    const resend = getResend();
    const { data, error } = await resend.get("/emails");

    if (error) {
      return c.json({ error }, 500);
    }

    const items = Array.isArray(
      (data as { data?: unknown[] } | undefined)?.data
    )
      ? ((data as { data?: unknown[] }).data as unknown[])
      : Array.isArray(data)
      ? (data as unknown[])
      : [];

    return c.json({ data: items.slice(0, limit) });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

emailsRoute.post("/send", async (c) => {
  try {
    const { to, subject, message } = await c.req.json();

    if (!to || !subject || !message) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM || "onboarding@resend.dev",
      to: [to],
      subject,
      html: `<p>${message}</p>`,
    });

    if (error) {
      return c.json({ error }, 500);
    }

    return c.json(data);
  } catch (error) {
    console.error("Error sending email:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export default emailsRoute;
