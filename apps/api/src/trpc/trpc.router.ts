import { healthRouter } from "./routers/health.router.js";
import { router } from "./trpc.service.js";

export const appRouter = router({
  health: healthRouter,
});

export type AppRouter = typeof appRouter;
