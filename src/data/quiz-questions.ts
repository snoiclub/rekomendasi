export interface QuizQuestion {
  id: string;
  question: string;
  description: string;
  type: 'single' | 'multiple';
  required: boolean;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  label: string;
  value: string;
  affects: string[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'daily_distance',
    question: 'Berapa jarak tempuh harianmu?',
    description: 'Menentukan kapasitas baterai dan jarak tempuh yang dibutuhkan',
    type: 'single',
    required: true,
    options: [
      {
        id: 'dist_lt_10',
        label: '<10 km',
        value: 'lt_10',
        affects: ['max_range_km', 'battery_capacity_wh'],
      },
      {
        id: 'dist_10_25',
        label: '10–25 km',
        value: '10_25',
        affects: ['max_range_km', 'battery_capacity_wh'],
      },
      {
        id: 'dist_25_40',
        label: '25–40 km',
        value: '25_40',
        affects: ['max_range_km', 'battery_capacity_wh'],
      },
      {
        id: 'dist_gt_40',
        label: '>40 km',
        value: 'gt_40',
        affects: ['max_range_km', 'battery_capacity_wh'],
      },
    ],
  },
  {
    id: 'rider_weight',
    question: 'Berapa berat badanmu?',
    description: 'Menentukan daya dukung scooter dan kebutuhan tenaga motor',
    type: 'single',
    required: true,
    options: [
      {
        id: 'weight_lt_70',
        label: '<70 kg',
        value: 'lt_70',
        affects: ['max_payload_kg', 'motor_power_nominal_w', 'motor_power_max_w'],
      },
      {
        id: 'weight_70_90',
        label: '70–90 kg',
        value: '70_90',
        affects: ['max_payload_kg', 'motor_power_nominal_w', 'motor_power_max_w'],
      },
      {
        id: 'weight_gt_90',
        label: '>90 kg',
        value: 'gt_90',
        affects: ['max_payload_kg', 'motor_power_nominal_w', 'motor_power_max_w'],
      },
    ],
  },
  {
    id: 'max_speed',
    question: 'Kecepatan maksimal yang kamu inginkan?',
    description: 'Beberapa model memiliki batas kecepatan berbeda',
    type: 'single',
    required: true,
    options: [
      { id: 'speed_20', label: '20 km/h (cukup untuk komuter)', value: '20', affects: ['max_speed_kmh'] },
      { id: 'speed_25', label: '25 km/h (standar)', value: '25', affects: ['max_speed_kmh'] },
      { id: 'speed_30', label: '30+ km/h (high performance)', value: '30', affects: ['max_speed_kmh'] },
    ],
  },
  {
    id: 'road_terrain',
    question: 'Seperti apa kontur jalan yang sering kamu hadapi?',
    description: 'Mempengaruhi kebutuhan tenaga motor dan suspensi',
    type: 'single',
    required: true,
    options: [
      { id: 'terrain_flat', label: 'Jalan kota rata', value: 'flat', affects: ['motor_power_max_w'] },
      {
        id: 'terrain_gentle',
        label: 'Tanjakan ringan / flyover',
        value: 'gentle',
        affects: ['motor_power_max_w', 'suspension'],
      },
      {
        id: 'terrain_steep',
        label: 'Tanjakan curam / bukit',
        value: 'steep',
        affects: ['motor_power_max_w', 'suspension'],
      },
    ],
  },
  {
    id: 'usage_type',
    question: 'Apa fokus utama penggunaan scooter?',
    description: 'Setiap kebutuhan memerlukan spesifikasi berbeda',
    type: 'single',
    required: true,
    options: [
      {
        id: 'usage_commute',
        label: 'Komuter harian (efisiensi & ringan)',
        value: 'commute',
        affects: ['unit_weight_kg', 'foldable', 'max_range_km'],
      },
      {
        id: 'usage_weekend',
        label: 'Hobi/weekend (butuh performa & speed)',
        value: 'weekend',
        affects: ['max_speed_kmh', 'motor_power_max_w'],
      },
      {
        id: 'usage_ojol',
        label: 'Produksi / ojol / jarak jauh',
        value: 'ojol',
        affects: ['max_range_km', 'battery_capacity_wh', 'unit_weight_kg'],
      },
    ],
  },
  {
    id: 'tire_preference',
    question: 'Tipe ban yang kamu inginkan?',
    description: 'Setiap tipe ban memiliki kelebihan dan kekurangan',
    type: 'single',
    required: true,
    options: [
      {
        id: 'tire_solid',
        label: 'Solid (anti bocor, tahan lama)',
        value: 'solid',
        affects: ['tire_type'],
      },
      {
        id: 'tire_pneumatic',
        label: 'Pneumatic (kenyamanan lebih baik)',
        value: 'pneumatic',
        affects: ['tire_type'],
      },
      {
        id: 'tire_tubeless',
        label: 'Tubeless (seimbang antara kenyamanan & ketahanan)',
        value: 'tubeless',
        affects: ['tire_type'],
      },
      {
        id: 'tire_no_preference',
        label: 'Tidak ada preferensi',
        value: 'no_preference',
        affects: [],
      },
    ],
  },
  {
    id: 'brake_preference',
    question: 'Tipe rem yang kamu inginkan?',
    description: 'Sistem rem mempengaruhi keamanan dan performa pengereman',
    type: 'single',
    required: true,
    options: [
      {
        id: 'brake_electronic',
        label: 'Electronic brake (pengereman otomatis)',
        value: 'electronic',
        affects: ['front_brake', 'rear_brake'],
      },
      {
        id: 'brake_mechanical',
        label: 'Mechanical disc (rem cakram manual)',
        value: 'mechanical_disc',
        affects: ['front_brake', 'rear_brake'],
      },
      {
        id: 'brake_hydraulic',
        label: 'Hydraulic disc (rem hidrolik premium)',
        value: 'hydraulic_disc',
        affects: ['front_brake', 'rear_brake'],
      },
      {
        id: 'brake_combined',
        label: 'Kombinasi (disc + electronic)',
        value: 'combined',
        affects: ['front_brake', 'rear_brake'],
      },
      {
        id: 'brake_no_preference',
        label: 'Tidak ada preferensi',
        value: 'no_preference',
        affects: [],
      },
    ],
  },
  {
    id: 'suspension_preference',
    question: 'Apakah kamu butuh suspensi?',
    description: 'Suspensi meningkatkan kenyamanan di jalan tidak rata',
    type: 'single',
    required: true,
    options: [
      {
        id: 'suspension_none',
        label: 'Tidak perlu suspensi',
        value: 'none',
        affects: ['suspension'],
      },
      {
        id: 'suspension_front',
        label: 'Suspensi depan saja',
        value: 'front',
        affects: ['suspension'],
      },
      {
        id: 'suspension_rear',
        label: 'Suspensi belakang saja',
        value: 'rear',
        affects: ['suspension'],
      },
      {
        id: 'suspension_both',
        label: 'Suspensi depan & belakang',
        value: 'front_rear',
        affects: ['suspension'],
      },
    ],
  },
  {
    id: 'water_resistance',
    question: 'Seberapa penting ketahanan air?',
    description: 'IP rating menentukan seberapa tahan scooter terhadap air dan debu',
    type: 'single',
    required: true,
    options: [
      {
        id: 'water_low',
        label: 'Tidak terlalu penting (jarang hujan)',
        value: 'low',
        affects: ['ip_body', 'ip_battery'],
      },
      {
        id: 'water_medium',
        label: 'Penting (kadang hujan)',
        value: 'medium',
        affects: ['ip_body', 'ip_battery'],
      },
      {
        id: 'water_high',
        label: 'Sangat penting (sering hujan/basah)',
        value: 'high',
        affects: ['ip_body', 'ip_battery'],
      },
    ],
  },
  {
    id: 'size_preference',
    question: 'Seberapa penting ukuran & berat unit?',
    description: 'Ukuran dan berat mempengaruhi portabilitas dan performa',
    type: 'single',
    required: true,
    options: [
      {
        id: 'size_compact',
        label: 'Compact <15 kg (mudah dibawa & disimpan)',
        value: 'compact',
        affects: ['unit_weight_kg', 'foldable', 'dimensions_folded_mm'],
      },
      {
        id: 'size_standard',
        label: 'Standar 15–18 kg',
        value: 'standard',
        affects: ['unit_weight_kg', 'dimensions_open_mm'],
      },
      {
        id: 'size_large',
        label: 'Rela berat >18 kg demi performa',
        value: 'large',
        affects: ['unit_weight_kg', 'max_speed_kmh', 'motor_power_max_w'],
      },
    ],
  },
];

// Pertanyaan tambahan opsional
export const OPTIONAL_QUESTIONS: QuizQuestion[] = [
  {
    id: 'tire_size_preference',
    question: 'Ukuran ban yang kamu inginkan?',
    description: 'Ukuran ban mempengaruhi stabilitas dan kenyamanan berkendara',
    type: 'single',
    required: false,
    options: [
      { id: 'tire_small', label: 'Kecil (8-9 inch)', value: 'small', affects: ['tire_size_inch'] },
      { id: 'tire_medium', label: 'Sedang (10 inch)', value: 'medium', affects: ['tire_size_inch'] },
      { id: 'tire_large', label: 'Besar (11+ inch)', value: 'large', affects: ['tire_size_inch'] },
      { id: 'tire_no_preference', label: 'Tidak ada preferensi', value: 'no_preference', affects: [] },
    ],
  },
  {
    id: 'portability',
    question: 'Apakah unit perlu sering dilipat/dibawa masuk transportasi?',
    description: 'Portabilitas penting jika sering dibawa naik KRL, bus, atau disimpan di ruang sempit',
    type: 'single',
    required: false,
    options: [
      { id: 'portable_yes', label: 'Ya, harus ringkas & foldable', value: 'yes', affects: ['foldable', 'unit_weight_kg', 'dimensions_folded_mm'] },
      { id: 'portable_no', label: 'Tidak masalah', value: 'no', affects: [] },
    ],
  },
  {
    id: 'warranty_service',
    question: 'Butuh garansi & jaringan service resmi Segway?',
    description: 'Service resmi memastikan dukungan purna jual yang terjamin',
    type: 'single',
    required: false,
    options: [
      { id: 'warranty_yes', label: 'Ya, wajib resmi', value: 'yes', affects: ['official_service'] },
      { id: 'warranty_no', label: 'Tidak terlalu penting', value: 'no', affects: [] },
    ],
  },
];

export type QuizAnswers = Record<string, string | string[]>;

