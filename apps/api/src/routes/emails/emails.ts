import { Hono } from "hono";
import { Resend } from "resend";
import { env } from "../../config/env";

const emailsRoute = new Hono();

const getResend = () => new Resend(env.RESEND_API_KEY);

const fetchEmailsByDirection = async (
  direction: "received" | "sent",
  limit: number
) => {
  const resend = getResend();

  if (direction === "received") {
    const { data, error } = await resend.emails.receiving.list({ limit });
    if (error) {
      throw error;
    }
    const items = data?.data || [];
    return items.map((item) => ({ ...item, object: "email", direction }));
  }

  // Sent emails
  const { data, error } = await resend.emails.list();
  if (error) {
    throw error;
  }
  const items = data?.data || [];
  return items.map((item) => ({ ...item, object: "email", direction }));
};

emailsRoute.get("/", async (c) => {
  const parsedLimit = Number(c.req.query("limit"));
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(Math.floor(parsedLimit), 1), 50)
    : 10;

  const direction = c.req.query("direction");
  const wantsAll = !direction || direction === "all";
  const directions: Array<"received" | "sent"> = wantsAll
    ? ["received", "sent"]
    : direction === "sent"
    ? ["sent"]
    : ["received"];

  try {
    const results = await Promise.all(
      directions.map((dir) => fetchEmailsByDirection(dir, limit))
    );
    const items = results.flat();

    const sorted = items.sort((a, b) => {
      const aDate = Date.parse(String(a.created_at ?? a.created_at ?? 0));
      const bDate = Date.parse(String(b.created_at ?? b.created_at ?? 0));
      return bDate - aDate;
    });

    return c.json({ data: sorted.slice(0, limit) });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

emailsRoute.post("/send", async (c) => {
  try {
    const { to, subject, message, from } = await c.req.json();

    const fromAddress =
      typeof from === "string" && from.trim()
        ? from.trim()
        : env.EMAIL_FROM || "onboarding@resend.dev";

    if (!to || !subject || !message) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject,
      text: message,
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

emailsRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) {
    return c.json({ error: "Missing id" }, 400);
  }

  try {
    const resend = getResend();

    // Try to fetch as sent email first
    const { data: sentData, error: sentError } = await resend.emails.get(id);
    if (!sentError && sentData) {
      return c.json({ data: { ...sentData, direction: "sent" } });
    }

    // If not found, try to fetch as received email
    const { data: receivedData, error: receivedError } =
      await resend.emails.receiving.get(id);
    if (!receivedError && receivedData) {
      return c.json({ data: { ...receivedData, direction: "received" } });
    }

    // If both fail, return error
    return c.json({ error: sentError || receivedError }, 404);
  } catch (error) {
    console.error("Error fetching email details:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export default emailsRoute;
