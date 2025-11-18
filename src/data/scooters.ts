import e2_plus_e_ii from './type/e2_plus_e_ii.json';
import e2_e from './type/e2_e.json';
import e2_e_ii from './type/e2_e_ii.json';
import e2_pro_e from './type/e2_pro_e.json';
import e3_pro_e from './type/e3_pro_e.json';
import e3_e from './type/e3_e.json';
import f2_e from './type/f2_e.json';
import f2_pro_e from './type/f2_pro_e.json';
import f2_plus_e from './type/f2_plus_e.json';
import f2_pro_e_ii from './type/f2_pro_e_ii.json';
import f2_e_ii from './type/f2_e_ii.json';
import f3_pro_e from './type/f3_pro_e.json';
import f3_e from './type/f3_e.json';
import segway_gt3_pro from './type/segway_gt3_pro.json';
import segway_gt3_e from './type/segway_gt3_e.json';
import max_g3_e from './type/max_g3_e.json';
import max_g2_e from './type/max_g2_e.json';
import zt3_pro_e from './type/zt3_pro_e.json';

export interface Scooter {
  id: string;
  name: string;
  brand: string;
  price_min_juta: number | null;
  price_max_juta: number | null;
  battery_capacity_wh: number | null;
  motor_power_nominal_w: number | null;
  motor_power_max_w: number | null;
  max_speed_kmh: number | null;
  max_range_km: number | null;
  max_driver_weight_kg: number | null;
  unit_weight_kg: number | null;
  foldable: boolean;
  front_brake:
    | 'none'
    | 'drum'
    | 'mechanical_disc'
    | 'hydraulic_disc'
    | 'electronic'
    | 'drum+electronic'
    | 'disc+electronic';
  rear_brake:
    | 'none'
    | 'drum'
    | 'mechanical_disc'
    | 'hydraulic_disc'
    | 'electronic'
    | 'drum+electronic'
    | 'disc+electronic';
  tire_size_inch: number | null;
  tire_type: 'solid' | 'pneumatic' | 'tubeless' | 'tubeless_with_jelly' | 'other';
  suspension: 'none' | 'front' | 'rear' | 'front_rear';
  ip_body: string | null;
  ip_battery: string | null;
  dimensions_open_mm: string | null;
  dimensions_folded_mm: string | null;
  official_service: boolean;
  image_url?: string;
  description: string;
  pros: string[];
  cons: string[];
  warnings?: string[];
}

export const SCOOTERS: Scooter[] = [
  e2_plus_e_ii as Scooter,
  e2_e as Scooter,
  e2_e_ii as Scooter,
  e2_pro_e as Scooter,
  e3_pro_e as Scooter,
  e3_e as Scooter,
  f2_e as Scooter,
  f2_pro_e as Scooter,
  f2_plus_e as Scooter,
  f2_pro_e_ii as Scooter,
  f2_e_ii as Scooter,
  f3_pro_e as Scooter,
  f3_e as Scooter,
  segway_gt3_pro as Scooter,
  segway_gt3_e as Scooter,
  max_g3_e as Scooter,
  max_g2_e as Scooter,
  zt3_pro_e as Scooter,
];
