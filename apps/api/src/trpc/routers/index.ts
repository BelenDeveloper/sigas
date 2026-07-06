import { router } from "../trpc.js";
import { healthRouter } from "./health.router.js";

export const appRouter = router({
  health: healthRouter,
});

export type AppRouter = typeof appRouter;
