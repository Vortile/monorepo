import { Hono } from "hono";
import { Resend } from "resend";
import { env } from "../../config/env";

const emailsRoute = new Hono();

const getResend = () => new Resend(env.RESEND_API_KEY);

type ResendEmail = Record<string, unknown>;

const normalizeList = (data: unknown): ResendEmail[] =>
  Array.isArray((data as { data?: unknown[] } | undefined)?.data)
    ? ((data as { data?: unknown[] }).data as ResendEmail[])
    : Array.isArray(data)
    ? (data as ResendEmail[])
    : [];

const fetchEmailsByDirection = async (
  direction: "received" | "sent",
  limit: number
) => {
  const resend = getResend();
  const { data, error } = await resend.get(
    `/emails?direction=${direction}&limit=${limit}`
  );
  if (error) {
    throw error;
  }
  return normalizeList(data);
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
      const aDate = Date.parse(String(a.created_at ?? a.createdAt ?? 0));
      const bDate = Date.parse(String(b.created_at ?? b.createdAt ?? 0));
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

emailsRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) {
    return c.json({ error: "Missing id" }, 400);
  }

  try {
    const resend = getResend();
    const { data, error } = await resend.get(`/emails/${id}`);

    if (error) {
      return c.json({ error }, 500);
    }

    return c.json({ data });
  } catch (error) {
    console.error("Error fetching email details:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export default emailsRoute;
