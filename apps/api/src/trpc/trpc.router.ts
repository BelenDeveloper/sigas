import { healthRouter } from "./routers/health.router.js";
import { router } from "./trpc.service.js";
import { companiesRouter } from "../companies/companies.router.js";
import { usersRouter } from "../users/users.router.js";

export const appRouter = router({
  health: healthRouter,
  users: usersRouter,
  companies: companiesRouter,
});

export type AppRouter = typeof appRouter;
