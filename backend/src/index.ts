import "dotenv/config";
import { createServer } from "http";
import net from "net";
import { createApp } from "./app.js";
import { ENV, validateEnv } from "./config.js";
import { registerOAuthRoutes } from "../../server/_core/oauth.js";
import { registerStorageProxy } from "../../server/_core/storageProxy.js";
import { registerPaymentCallbackRoutes } from "../../server/paymentCallbacks.js";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.listen(port, () => s.close(() => resolve(true)));
    s.on("error", () => resolve(false));
  });
}

async function findAvailablePort(start: number): Promise<number> {
  for (let p = start; p < start + 20; p++) if (await isPortAvailable(p)) return p;
  throw new Error("No available port");
}

async function startServer() {
  validateEnv();
  const app = createApp();
  const server = createServer(app);

  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerPaymentCallbackRoutes(app);

  const port = await findAvailablePort(ENV.port);
  if (port !== ENV.port) console.log(`Port ${ENV.port} busy, using ${port}`);

  server.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}/`);
    console.log(`  tRPC:  /api/trpc`);
    console.log(`  Health: /api/health`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
