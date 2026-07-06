import { HealthService } from "../../health/health.service.js";
import { publicProcedure, router } from "../trpc.js";

export const healthRouter = router({
  check: publicProcedure.query(async ({ ctx }) => {
    const healthService = ctx.app.get(HealthService);
    const isDatabaseConnected = await healthService.checkDatabaseConnection();
    return { status: "ok" as const, database: isDatabaseConnected ? "connected" : "disconnected" };
  }),
});
