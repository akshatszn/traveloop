import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { app } from "./app.js";

const server = app.listen(env.PORT, () => {
  console.log(`Traveloop API listening on http://localhost:${env.PORT}`);
});

const shutdown = async (signal: string) => {
  console.log(`${signal} received, closing Traveloop API`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
