import { Money } from "@core/precision/value-objects.ts";

export type AmortizationType = "FLAT" | "DECLINING" | "BALLOON";

export interface AmortizationScheduleRow {
  installmentNumber: number;
  dueDate: Date;
  principalCents: bigint;
  interestCents: bigint;
  totalPaymentCents: bigint;
  remainingBalanceCents: bigint;
}

export interface AmortizationInput {
  principalCents: bigint;
  currency: string;
  annualRateBps: number;
  termMonths: number;
  startDate: Date;
  type: AmortizationType;
}

export class AmortizationEngine {
  generate(input: AmortizationInput): AmortizationScheduleRow[] {
    switch (input.type) {
      case "FLAT":      return this.generateFlat(input);
      case "DECLINING": return this.generateDeclining(input);
      case "BALLOON":   return this.generateBalloon(input);
    }
  }

  // قسط ثابت: الفائدة على الأصل الكامل طول المدة
  // الفائدة الشهرية = أصل * (bps / 10000) / 12
  //                 = أصل * bps / 120000
  private generateFlat(input: AmortizationInput): AmortizationScheduleRow[] {
    const { principalCents, annualRateBps, termMonths, startDate } = input;
    const rows: AmortizationScheduleRow[] = [];

    const bps = BigInt(annualRateBps);
    const monthlyInterest = principalCents * bps / 120000n;
    const monthlyPrincipal = principalCents / BigInt(termMonths);

    let remaining = principalCents;

    for (let i = 1; i <= termMonths; i++) {
      const isLast = i === termMonths;
      const principal = isLast ? remaining : monthlyPrincipal;
      remaining -= principal;

      rows.push({
        installmentNumber: i,
        dueDate: this.addMonths(startDate, i),
        principalCents: principal,
        interestCents: monthlyInterest,
        totalPaymentCents: principal + monthlyInterest,
        remainingBalanceCents: remaining,
      });
    }
    return rows;
  }

  // قسط متناقص: الفائدة على الرصيد المتبقي
  private generateDeclining(input: AmortizationInput): AmortizationScheduleRow[] {
    const { principalCents, annualRateBps, termMonths, startDate } = input;
    const rows: AmortizationScheduleRow[] = [];

    const bps = BigInt(annualRateBps);
    const monthlyPrincipal = principalCents / BigInt(termMonths);
    let remaining = principalCents;

    for (let i = 1; i <= termMonths; i++) {
      const isLast = i === termMonths;
      const interest = remaining * bps / 120000n;
      const principal = isLast ? remaining : monthlyPrincipal;
      remaining -= principal;

      rows.push({
        installmentNumber: i,
        dueDate: this.addMonths(startDate, i),
        principalCents: principal,
        interestCents: interest,
        totalPaymentCents: principal + interest,
        remainingBalanceCents: remaining,
      });
    }
    return rows;
  }

  // بالون: فوائد فقط ثم الأصل كاملاً في النهاية
  private generateBalloon(input: AmortizationInput): AmortizationScheduleRow[] {
    const { principalCents, annualRateBps, termMonths, startDate } = input;
    const rows: AmortizationScheduleRow[] = [];

    const bps = BigInt(annualRateBps);
    const monthlyInterest = principalCents * bps / 120000n;

    for (let i = 1; i <= termMonths; i++) {
      const isLast = i === termMonths;
      const principal = isLast ? principalCents : 0n;

      rows.push({
        installmentNumber: i,
        dueDate: this.addMonths(startDate, i),
        principalCents: principal,
        interestCents: monthlyInterest,
        totalPaymentCents: principal + monthlyInterest,
        remainingBalanceCents: isLast ? 0n : principalCents,
      });
    }
    return rows;
  }

  private addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }

  totalCost(schedule: AmortizationScheduleRow[]): {
    totalPrincipal: bigint;
    totalInterest: bigint;
    totalPayment: bigint;
  } {
    return schedule.reduce((acc, row) => ({
      totalPrincipal: acc.totalPrincipal + row.principalCents,
      totalInterest:  acc.totalInterest  + row.interestCents,
      totalPayment:   acc.totalPayment   + row.totalPaymentCents,
    }), { totalPrincipal: 0n, totalInterest: 0n, totalPayment: 0n });
  }
}
