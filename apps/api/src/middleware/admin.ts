import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";

export const adminMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.split(" ")[1];
  const jwtSecret = process.env.ADMIN_AUTH_JWT_SECRET;

  if (!token || !jwtSecret) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const payload = await verify(token, jwtSecret);
    if (payload.role !== "admin") {
      return c.json({ error: "Forbidden" }, 403);
    }
    c.set("jwtPayload", payload);
    await next();
  } catch (error) {
    console.error(error);
    return c.json({ error: "Invalid token" }, 401);
  }
});
