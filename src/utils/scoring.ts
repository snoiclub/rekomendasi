import { Scooters, Scooter } from "@/db";
import { QuizAnswers } from "../data/quiz-questions";

export interface ScoreResult {
  scooter: Scooter;
  score: number;
  reasons: string[];
  warnings: string[];
  matchDetails: {
    battery: number;
    motor: number;
    budget: number;
    features: number;
    size: number;
    usage: number;
  };
}

/**
 * Helper: Get size category dari weight
 */
function getSizeCategory(
  weight: number | null
): "compact" | "standard" | "large" | null {
  if (weight === null) return null;
  if (weight < 15) return "compact";
  if (weight <= 18) return "standard";
  return "large";
}

/**
 * Helper: Check if has suspension
 */
function hasSuspension(suspension: Scooter["suspension"]): boolean {
  return suspension !== "none";
}

/**
 * Helper: Check if has hydraulic brake
 */
function hasHydraulicBrake(
  frontBrake: Scooter["front_brake"],
  rearBrake: Scooter["rear_brake"]
): boolean {
  return frontBrake === "hydraulic_disc" || rearBrake === "hydraulic_disc";
}

/**
 * Helper: Check if has IP rating
 */
function hasIPRating(ipBody: string | null): boolean {
  return ipBody !== null && ipBody !== "";
}

/**
 * Menghitung skor matching antara jawaban quiz dan produk scooter
 */
export function calculateScores(
  answers: QuizAnswers,
  scooters: Scooters
): ScoreResult[] {
  const results: ScoreResult[] = [];

  for (const scooter of scooters) {
    const matchDetails = {
      battery: 0,
      motor: 0,
      budget: 0,
      features: 0,
      size: 0,
      usage: 0,
    };

    const reasons: string[] = [];
    const warnings: string[] = [];

    // 1. Budget matching - skipped karena data harga belum tersedia
    matchDetails.budget = 100;

    // 2. Battery capacity / Range matching
    const dailyDistance = answers.daily_distance as string;
    const requiredRange = getRequiredRange(dailyDistance);

    const range = scooter.ranges?.at(-1) ?? 0;
    const weight = scooter.weight;
    const scooterMaxSpeed = scooter.speeds?.at(-1) ?? 0;
    const tire_size = scooter.tire_size / 2.54;

    if (scooter.ranges === null) {
      warnings.push("Range belum tersedia, pastikan cek spesifikasi resmi");
      matchDetails.battery = 50;
    } else if (range >= requiredRange) {
      matchDetails.battery = 100;
      reasons.push(
        `Range ${range}km mencukupi untuk perjalanan harian ${getDistanceLabel(
          dailyDistance
        )}`
      );
    } else {
      matchDetails.battery = Math.max(0, (range / requiredRange) * 100);
      warnings.push(
        `Range ${range}km mungkin kurang untuk perjalanan ${getDistanceLabel(
          dailyDistance
        )}`
      );
    }

    // 3. Motor power (berat badan + kontur jalan)
    const riderWeight = answers.rider_weight as string;
    const terrain = answers.road_terrain as string;
    const requiredMotorPower = getRequiredMotorPower(riderWeight, terrain);

    const motorPower = scooter.power_nominal || scooter.power_max || null;

    if (motorPower === null) {
      warnings.push(
        "Spesifikasi motor belum tersedia, pastikan cek spesifikasi resmi"
      );
      matchDetails.motor = 50;
    } else if (motorPower >= requiredMotorPower) {
      matchDetails.motor = 100;
      reasons.push(
        `Motor ${motorPower}W cukup untuk ${getWeightLabel(
          riderWeight
        )} di ${getTerrainLabel(terrain)}`
      );
    } else {
      matchDetails.motor = Math.max(0, (motorPower / requiredMotorPower) * 100);
      warnings.push(
        `Motor ${motorPower}W mungkin kurang untuk ${getWeightLabel(
          riderWeight
        )} di ${getTerrainLabel(terrain)}`
      );
    }

    // 4. Size preference (berdasarkan weight)
    const sizePref = answers.size_preference as string;

    const sizeCategory = getSizeCategory(weight);

    if (sizeCategory === null) {
      matchDetails.size = 50;
    } else if (sizePref === "compact" && sizeCategory === "compact") {
      matchDetails.size = 100;
      reasons.push("Ukuran compact sesuai kebutuhan");
    } else if (sizePref === "large" && sizeCategory === "large") {
      matchDetails.size = 100;
      reasons.push("Ukuran besar sesuai untuk performa");
    } else if (sizePref === "standard" && sizeCategory === "standard") {
      matchDetails.size = 100;
      reasons.push("Ukuran standard seimbang");
    } else {
      matchDetails.size = 50;
    }

    // 5. Usage type
    const usageType = answers.usage_type as string;

    if (
      usageType === "commute" &&
      sizeCategory === "compact" &&
      weight !== null &&
      weight < 16
    ) {
      matchDetails.usage = 100;
      reasons.push("Cocok untuk komuter harian (ringan & compact)");
    } else if (usageType === "production" && range !== null && range >= 40) {
      matchDetails.usage = 100;
      reasons.push("Cocok untuk produksi/jarak jauh (range panjang)");
    } else if (
      usageType === "weekend" &&
      motorPower !== null &&
      motorPower >= 350
    ) {
      matchDetails.usage = 100;
      reasons.push("Cocok untuk hobi weekend (motor kuat)");
    } else {
      matchDetails.usage = 60;
    }

    // 6. Max Speed matching
    const maxSpeed = answers.max_speed as string;
    if (scooterMaxSpeed === null) {
      matchDetails.features += 10;
    } else {
      const requiredSpeed = parseInt(maxSpeed);
      if (scooterMaxSpeed >= requiredSpeed) {
        matchDetails.features += 20;
        reasons.push(
          `Kecepatan maksimal ${scooterMaxSpeed} km/h sesuai kebutuhan`
        );
      } else {
        warnings.push(
          `Kecepatan maksimal ${scooterMaxSpeed} km/h kurang dari yang diinginkan (${requiredSpeed} km/h)`
        );
      }
    }

    // 7. Tire preference matching
    const tirePref = answers.tire_preference as string;
    if (tirePref && tirePref !== "no_preference") {
      if (scooter.tire_type === tirePref) {
        matchDetails.features += 20;
        reasons.push(`Tipe ban ${scooter.tire_type} sesuai preferensi`);
      } else {
        warnings.push(
          `Tipe ban ${scooter.tire_type} tidak sesuai preferensi (${tirePref})`
        );
      }
    } else {
      matchDetails.features += 10;
    }

    // 8. Brake preference matching
    const brakePref = answers.brake_preference as string;
    if (brakePref && brakePref !== "no_preference") {
      let brakeMatch = false;
      if (brakePref === "electronic") {
        brakeMatch =
          scooter.front_brake === "electronic" ||
          scooter.rear_brake === "electronic";
      } else if (brakePref === "mechanical_disc") {
        brakeMatch =
          scooter.front_brake === "mechanical_disc" ||
          scooter.rear_brake === "mechanical_disc";
      } else if (brakePref === "hydraulic_disc") {
        brakeMatch = hasHydraulicBrake(scooter.front_brake, scooter.rear_brake);
      } else if (brakePref === "combined") {
        brakeMatch =
          (scooter.front_brake.includes("disc") ||
            scooter.rear_brake.includes("disc")) &&
          (scooter.front_brake.includes("electronic") ||
            scooter.rear_brake.includes("electronic"));
      }

      if (brakeMatch) {
        matchDetails.features += 20;
        reasons.push(`Sistem rem sesuai preferensi`);
      } else {
        warnings.push(`Sistem rem tidak sesuai preferensi`);
      }
    } else {
      matchDetails.features += 10;
    }

    // 9. Suspension preference matching
    const suspensionPref = answers.suspension_preference as string;
    if (suspensionPref) {
      if (suspensionPref === "none" && scooter.suspension === "none") {
        matchDetails.features += 20;
        reasons.push("Tidak ada suspensi sesuai preferensi");
      } else if (suspensionPref === "front" && scooter.suspension === "front") {
        matchDetails.features += 20;
        reasons.push("Suspensi depan sesuai preferensi");
      } else if (suspensionPref === "rear" && scooter.suspension === "rear") {
        matchDetails.features += 20;
        reasons.push("Suspensi belakang sesuai preferensi");
      } else if (
        suspensionPref === "front_rear" &&
        scooter.suspension === "front_rear"
      ) {
        matchDetails.features += 20;
        reasons.push("Suspensi depan & belakang sesuai preferensi");
      } else if (
        suspensionPref !== "none" &&
        hasSuspension(scooter.suspension)
      ) {
        matchDetails.features += 15;
        reasons.push(`Suspensi tersedia (${scooter.suspension})`);
      } else if (
        suspensionPref !== "none" &&
        !hasSuspension(scooter.suspension)
      ) {
        warnings.push("Butuh suspensi tapi tidak tersedia");
      }
    }

    // 10. Water resistance matching
    const waterResistance = answers.water_resistance as string;
    if (waterResistance) {
      const hasIP = hasIPRating(scooter.ip_body);
      if (waterResistance === "high" && hasIP) {
        const ipLevel = parseInt(scooter.ip_body?.replace(/\D/g, "") || "0");
        if (ipLevel >= 5) {
          matchDetails.features += 20;
          reasons.push(
            `IP rating ${scooter.ip_body} cocok untuk ketahanan air tinggi`
          );
        } else {
          matchDetails.features += 10;
          warnings.push(
            `IP rating ${scooter.ip_body} mungkin kurang untuk ketahanan air tinggi`
          );
        }
      } else if (waterResistance === "medium" && hasIP) {
        matchDetails.features += 20;
        reasons.push(`IP rating ${scooter.ip_body} cocok untuk ketahanan air`);
      } else if (waterResistance === "high" && !hasIP) {
        warnings.push("Butuh IP rating tinggi tapi tidak tersedia");
      } else if (waterResistance === "low") {
        matchDetails.features += 10;
      }
    }

    // 11. Optional questions
    if (
      answers.tire_size_preference &&
      answers.tire_size_preference !== "no_preference"
    ) {
      const tireSizePref = answers.tire_size_preference as string;
      if (tire_size === null) {
        matchDetails.features += 5;
      } else {
        let sizeMatch = false;
        if (tireSizePref === "small" && tire_size < 10) {
          sizeMatch = true;
        } else if (
          tireSizePref === "medium" &&
          tire_size >= 10 &&
          tire_size < 11
        ) {
          sizeMatch = true;
        } else if (tireSizePref === "large" && tire_size >= 11) {
          sizeMatch = true;
        }

        if (sizeMatch) {
          matchDetails.features += 10;
          reasons.push(`Ukuran ban ${tire_size}" sesuai preferensi`);
        }
      }
    }

    if (answers.portability === "yes") {
      if (weight === null) {
        warnings.push("Butuh portabilitas tapi data berat belum tersedia");
      } else if (weight > 16) {
        warnings.push(
          `Butuh portabilitas tapi berat ${weight}kg, sulit dibawa naik tangga`
        );
      } else {
        reasons.push(`Ringan (${weight}kg) dan mudah dibawa`);
      }

      if (!scooter.foldable) {
        warnings.push("Butuh foldable tapi tidak tersedia");
      } else {
        reasons.push("Dapat dilipat untuk portabilitas");
      }
    }

    // if (answers.warranty_service === "yes" && !scooter.official_service) {
    //   warnings.push("Butuh service resmi tapi tidak tersedia");
    // } else if (answers.warranty_service === "yes" && scooter.official_service) {
    //   reasons.push("Service resmi tersedia");
    // }

    // Add scooter-specific warnings
    if (scooter.warnings) {
      warnings.push(...scooter.warnings);
    }

    // Calculate total score (weighted)
    const totalScore =
      matchDetails.battery * 0.3 +
      matchDetails.motor * 0.3 +
      matchDetails.features * 0.2 +
      matchDetails.size * 0.1 +
      matchDetails.usage * 0.1;

    results.push({
      scooter,
      score: totalScore,
      reasons,
      warnings,
      matchDetails,
    });
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Get top N recommendations
 */
export function getTopRecommendations(
  results: ScoreResult[],
  count: number = 3
): ScoreResult[] {
  return results.slice(0, count);
}

// Helper functions
function getRequiredRange(dailyDistance: string): number {
  switch (dailyDistance) {
    case "lt_10":
      return 15;
    case "10_25":
      return 30;
    case "25_40":
      return 50;
    case "gt_40":
      return 70;
    default:
      return 30;
  }
}

function getRequiredMotorPower(riderWeight: string, terrain: string): number {
  let basePower = 250;

  // Adjust by weight
  if (riderWeight === "70_90") basePower = 300;
  if (riderWeight === "gt_90") basePower = 350;

  // Adjust by terrain
  if (terrain === "gentle") basePower += 50;
  if (terrain === "steep") basePower += 100;

  return basePower;
}

function getDistanceLabel(value: string): string {
  const labels: Record<string, string> = {
    lt_10: "<10 km",
    "10_25": "10-25 km",
    "25_40": "25-40 km",
    gt_40: ">40 km",
  };
  return labels[value] || value;
}

function getWeightLabel(value: string): string {
  const labels: Record<string, string> = {
    lt_70: "<70 kg",
    "70_90": "70-90 kg",
    gt_90: ">90 kg",
  };
  return labels[value] || value;
}

function getTerrainLabel(value: string): string {
  const labels: Record<string, string> = {
    flat: "jalan rata",
    gentle: "tanjakan ringan",
    steep: "tanjakan curam",
  };
  return labels[value] || value;
}
