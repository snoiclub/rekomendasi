import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/data/schema.ts",
  dbCredentials: {
    url: process.env.DB_FILE_NAME!,
  },
});
