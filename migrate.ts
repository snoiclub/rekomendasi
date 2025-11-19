import { readdirSync, readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import * as v from "valibot";
import { db } from "./src/db.ts";
import { scootersTable } from "./src/data/schema.ts";

const dataDir = "./src/data/type/";

const fileNames = readdirSync(dataDir).filter((file) => file.match(/\.json$/));

const ScooterSchema = v.pipe(
  v.object({
    id: v.string(),
    name: v.string(),
    brand: v.string(),
    price_min_juta: v.nullish(v.number()),
    price_max_juta: v.nullish(v.number()),
    battery_capacity_wh: v.nullish(v.number()),
    motor_power_nominal_w: v.nullish(v.number()),
    motor_power_max_w: v.nullish(v.number()),
    max_speed_kmh: v.nullish(v.number()),
    max_range_km: v.nullish(v.number()),
    max_payload_kg: v.nullish(v.number()),
    unit_weight_kg: v.nullish(v.number()),
    foldable: v.boolean(),
    front_brake: v.union([
      v.literal("none"),
      v.literal("drum"),
      v.literal("mechanical_disc"),
      v.literal("hydraulic_disc"),
      v.literal("electronic"),
      v.literal("drum+electronic"),
      v.literal("disc+electronic"),
    ]),
    rear_brake: v.union([
      v.literal("none"),
      v.literal("drum"),
      v.literal("mechanical_disc"),
      v.literal("hydraulic_disc"),
      v.literal("electronic"),
      v.literal("drum+electronic"),
      v.literal("disc+electronic"),
    ]),
    tire_size_inch: v.nullish(v.number()),
    tire_type: v.union([
      v.literal("solid"),
      v.literal("pneumatic"),
      v.literal("tubeless"),
      v.literal("tubeless_with_jelly"),
      v.literal("other"),
    ]),
    suspension: v.union([
      v.literal("none"),
      v.literal("front"),
      v.literal("rear"),
      v.literal("front_rear"),
    ]),
    ip_body: v.nullish(v.string()),
    ip_battery: v.nullish(v.string()),
    dimensions_open_mm: v.nullish(v.string()),
    dimensions_folded_mm: v.nullish(v.string()),
    official_service: v.boolean(),
    image_url: v.nullish(v.string()),
    description: v.string(),
    pros: v.array(v.string()),
    cons: v.array(v.string()),
    warnings: v.nullish(v.array(v.string())),
    source: v.string(),
  }),
  v.transform(
    ({
      battery_capacity_wh,
      name,
      motor_power_max_w,
      motor_power_nominal_w,
      image_url,
      price_max_juta,
      price_min_juta,
      unit_weight_kg,
      max_payload_kg,
      max_speed_kmh,
      max_range_km,
      tire_size_inch,
      ...scooter
    }) => {
      return {
        ...scooter,
        model: name,
        manual: image_url
          ?.replace(/images/, "manual")
          .replace(/\.jpg|\.png/, ".pdf"),
        image_url,
        battery_capacity: battery_capacity_wh ?? 0,
        max_payload: max_payload_kg ?? 0,
        power_max: motor_power_max_w ?? 0,
        power_nominal: motor_power_nominal_w ?? 0,
        price_max: price_max_juta,
        price_min: price_min_juta,
        weight: unit_weight_kg ?? 0,
        tire_size: Math.ceil((tire_size_inch ?? 0) * 25.4),
      };
    }
  )
);

const data = fileNames.map((fileName: string) => {
  const json = JSON.parse(readFileSync(dataDir + fileName, "utf8").toString());

  return {
    ...json,
    id: randomUUID(),
    source: fileName,
  };
});

const scooters = v.parse(v.array(ScooterSchema), data);

await db.insert(scootersTable).values(scooters);
