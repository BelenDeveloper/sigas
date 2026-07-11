import { healthRouter } from "./routers/health.router.js";
import { router } from "./trpc.service.js";
import { usersRouter } from "../users/users.router.js";

export const appRouter = router({
  health: healthRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
