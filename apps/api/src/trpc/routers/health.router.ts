import { HealthService } from "../../health/health.service.js";
import { procedure, router } from "../trpc.service.js";

const healthService = new HealthService();

export const healthRouter = router({
  check: procedure.query(async () => {
    const isDatabaseConnected = await healthService.checkDatabaseConnection();
    return { status: "ok" as const, database: isDatabaseConnected ? "connected" : "disconnected" };
  }),
});
