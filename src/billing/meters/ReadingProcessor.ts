export interface Reading {
  meterId: string;
  usageKWh: number;
  timestamp: Date;
}

export class ReadingProcessor {
  static validate(reading: Reading): boolean {
    // التحقق من منطقية القراءة (تجنب القراءات الشاذة الناتجة عن عطل فني)
    return reading.usageKWh >= 0 && reading.usageKWh < 10000;
  }
}
