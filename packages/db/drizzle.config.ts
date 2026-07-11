import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DIRECT_DATABASE_URL;
if (!connectionString) {
  throw new Error("DIRECT_DATABASE_URL is not set");
}

export default defineConfig({
  schema: "./schema/**/*.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
