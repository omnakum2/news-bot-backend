// ─── Main.ts ────────────────────────────────────────────────────────────────
// Bootstrap entry point — creates HTTP server and registers routes.

import "dotenv/config";
import http from "node:http";
import { handleBotRequest } from "./BotService";

const PORT = process.env.PORT || 3000;

/**
 * Bootstrap function — initializes and starts the HTTP server.
 */
async function bootstrap(): Promise<void> {
  const server = http.createServer(async (req, res) => {
    // CORS headers (for browser testing)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Content-Type", "application/json");

    // Handle OPTIONS preflight
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || "/", `http://localhost:${PORT}`);
    const pathname = url.pathname;

    // ─── Route: GET /api/botservice ──────────────────────────────────────
    if (pathname === "/api/botservice" && req.method === "GET") {
      try {
        const email = url.searchParams.get("email") || undefined;
        const result = await handleBotRequest(email);

        const statusCode = result.success ? 200 : 400;
        res.writeHead(statusCode);
        res.end(JSON.stringify(result, null, 2));
      } catch (error: unknown) {
        console.error("❌ Bot service error:", error);

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";

        res.writeHead(500);
        res.end(
          JSON.stringify(
            {
              success: false,
              message: `Internal server error: ${errorMessage}`,
              greeting: "",
              summary: null,
              sentTo: "",
            },
            null,
            2
          )
        );
      }
      return;
    }

    // ─── Route: GET / (Health check) ────────────────────────────────────
    if (pathname === "/" && req.method === "GET") {
      res.writeHead(200);
      res.end(
        JSON.stringify({
          status: "ok",
          service: "News Bot",
          version: "1.0.0",
          endpoints: {
            trigger: "GET /api/botservice",
            triggerWithEmail: "GET /api/botservice?email=your@email.com",
          },
        })
      );
      return;
    }

    // ─── 404 ────────────────────────────────────────────────────────────
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not found" }));
  });

  server.listen(PORT, () => {
    console.log("\n╔══════════════════════════════════════════════╗");
    console.log("║         📰 News Bot v1.0.0           ║");
    console.log("╠══════════════════════════════════════════════╣");
    console.log(`║  Server running on http://localhost:${PORT}     ║`);
    console.log("║                                              ║");
    console.log("║  Endpoints:                                  ║");
    console.log("║  GET /                    → Health check     ║");
    console.log("║  GET /api/botservice      → Trigger bot      ║");
    console.log("║  GET /api/botservice?email=... → Custom email║");
    console.log("╚══════════════════════════════════════════════╝\n");
  });
}

// ─── Start the application ──────────────────────────────────────────────────
bootstrap().catch((error) => {
  console.error("❌ Failed to bootstrap application:", error);
  process.exit(1);
});
