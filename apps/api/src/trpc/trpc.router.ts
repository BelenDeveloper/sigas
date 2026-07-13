import { healthRouter } from "./routers/health.router.js";
import { router } from "./trpc.service.js";
import { cashRouter } from "../cash/cash.router.js";
import { clientsRouter } from "../clients/clients.router.js";
import { companiesRouter } from "../companies/companies.router.js";
import { inventoryRouter } from "../inventory/inventory.router.js";
import { projectsRouter } from "../projects/projects.router.js";
import { purchasesRouter } from "../purchases/purchases.router.js";
import { salesRouter } from "../sales/sales.router.js";
import { suppliersRouter } from "../suppliers/suppliers.router.js";
import { usersRouter } from "../users/users.router.js";

export const appRouter = router({
  health: healthRouter,
  users: usersRouter,
  companies: companiesRouter,
  inventory: inventoryRouter,
  clients: clientsRouter,
  suppliers: suppliersRouter,
  sales: salesRouter,
  purchases: purchasesRouter,
  cash: cashRouter,
  projects: projectsRouter,
});

export type AppRouter = typeof appRouter;
