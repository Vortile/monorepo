import { Hono } from "hono";
import { env } from "../../config/env";

const partnerAppsRoute = new Hono();

// GET /api/waba/partner-apps - Fetch all partner apps from Gupshup
partnerAppsRoute.get("/", async (c) => {
  try {
    const url = `${env.GUPSHUP_PARTNER_API_URL}/partner/account/api/partnerApps`;

    console.log(`Fetching partner apps from Gupshup Partner API: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.GUPSHUP_PARTNER_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Gupshup Partner API error: ${response.status} ${response.statusText}`,
        errorText,
      );
      return c.json(
        {
          success: false,
          error: "Failed to fetch partner apps from Gupshup",
          details: errorText,
        },
        502,
      );
    }

    const data = await response.json();

    console.log(
      `Successfully fetched ${data?.apps?.length ?? 0} partner apps`,
    );

    return c.json({
      success: true,
      data: data.apps ?? [],
      total: data.apps?.length ?? 0,
    });
  } catch (error) {
    console.error("Error fetching partner apps:", error);
    return c.json(
      {
        success: false,
        error: "Internal server error while fetching partner apps",
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

// GET /api/waba/partner-apps/:appId/health - Check health of a specific app
partnerAppsRoute.get("/:appId/health", async (c) => {
  try {
    const appId = c.req.param("appId");

    if (!appId) {
      return c.json(
        {
          success: false,
          error: "App ID is required",
        },
        400,
      );
    }

    const url = `${env.GUPSHUP_PARTNER_API_URL}/partner/app/${appId}/health`;

    console.log(`Checking health for app ${appId}: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.GUPSHUP_PARTNER_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Gupshup Partner API health check error: ${response.status} ${response.statusText}`,
        errorText,
      );
      return c.json(
        {
          success: false,
          error: "Failed to check app health",
          details: errorText,
        },
        502,
      );
    }

    const data = await response.json();

    console.log(`Health check for app ${appId}:`, data);

    return c.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error checking app health:", error);
    return c.json(
      {
        success: false,
        error: "Internal server error while checking app health",
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

// GET /api/waba/partner-apps/:appId/profile - Get business profile details
partnerAppsRoute.get("/:appId/profile", async (c) => {
  try {
    const appId = c.req.param("appId");

    if (!appId) {
      return c.json(
        {
          success: false,
          error: "App ID is required",
        },
        400,
      );
    }

    const url = `${env.GUPSHUP_PARTNER_API_URL}/partner/app/${appId}/business/profile/`;

    console.log(`Fetching business profile for app ${appId}: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.GUPSHUP_PARTNER_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Gupshup Partner API profile error: ${response.status} ${response.statusText}`,
        errorText,
      );
      return c.json(
        {
          success: false,
          error: "Failed to fetch business profile",
          details: errorText,
        },
        502,
      );
    }

    const data = await response.json();

    console.log(`Business profile for app ${appId}:`, data);

    return c.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching business profile:", error);
    return c.json(
      {
        success: false,
        error: "Internal server error while fetching business profile",
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

// GET /api/waba/partner-apps/:appId/profile/photo - Get business profile picture
partnerAppsRoute.get("/:appId/profile/photo", async (c) => {
  try {
    const appId = c.req.param("appId");

    if (!appId) {
      return c.json(
        {
          success: false,
          error: "App ID is required",
        },
        400,
      );
    }

    const url = `${env.GUPSHUP_PARTNER_API_URL}/partner/app/${appId}/business/profile/photo`;

    console.log(`Fetching profile photo for app ${appId}: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${env.GUPSHUP_PARTNER_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Gupshup Partner API photo error: ${response.status} ${response.statusText}`,
        errorText,
      );
      return c.json(
        {
          success: false,
          error: "Failed to fetch profile photo",
          details: errorText,
        },
        502,
      );
    }

    // Return the image directly
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return new Response(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error fetching profile photo:", error);
    return c.json(
      {
        success: false,
        error: "Internal server error while fetching profile photo",
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

export default partnerAppsRoute;
