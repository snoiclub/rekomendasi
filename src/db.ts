import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./data/schema";
import "dotenv/config";

export const db = drizzle({
  schema,
  connection: {
    url: process.env.DB_FILE_NAME!,
  },
});

export async function getScooters() {
  return db.query.scootersTable.findMany();
}

export type Scooter = Scooters extends readonly (infer T)[] ? T : Scooters;
export type Scooters = Awaited<ReturnType<typeof getScooters>>;
