import { int, sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { link } from "node:fs";

export const scootersTable = sqliteTable("scooters", {
  id: text("id").primaryKey(),
  brand: text().notNull(),
  model: text().notNull(),
  image_url: text(),
  manual: text(),
  link: text(),

  weight: real().notNull(),
  dimension: text({ mode: "json" })
    .$type<[number, number, number]>()
    .default([0, 0, 0]),
  dimension_folded: text({ mode: "json" })
    .$type<[number, number, number]>()
    .default([0, 0, 0]),
  foldable: int({ mode: "boolean" }).default(true),

  battery_capacity: int().notNull(),
  max_payload: int().notNull(),
  climbing_angle: int(),
  modes: text({ mode: "json" }).$type<string[]>().default([]),
  ranges: text({ mode: "json" }).$type<number[]>().default([]),
  speeds: text({ mode: "json" }).$type<number[]>().default([]),
  power_max: int().notNull(),
  power_nominal: int().notNull(),
  wheel_drive_type: text({ enum: ["front", "rear"] }),

  ip_body: text(),
  ip_battery: text(),

  front_brake: text({
    enum: [
      "none",
      "drum",
      "mechanical_disc",
      "hydraulic_disc",
      "electronic",
      "drum+electronic",
      "disc+electronic",
    ],
  }).notNull(),
  rear_brake: text({
    enum: [
      "none",
      "drum",
      "mechanical_disc",
      "hydraulic_disc",
      "electronic",
      "drum+electronic",
      "disc+electronic",
    ],
  }).notNull(),

  tire_size: int().notNull(),
  tire_type: text({
    enum: ["solid", "pneumatic", "tubeless", "tubeless_with_jelly", "other"],
  }).notNull(),

  suspension: text({ enum: ["none", "front", "rear", "front_rear"] }).notNull(),

  price_max: int(),
  price_min: int(),

  description: text(),

  source: text().unique(),
  pros: text({ mode: "json" }).$type<string[]>().default([]),
  cons: text({ mode: "json" }).$type<string[]>().default([]),
  warnings: text({ mode: "json" }).$type<string[]>().default([]),
  users: text({ mode: "json" }).$type<string[]>().default([]),
});
