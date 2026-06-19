// src/core/Amortization.ts
// ═══════════════════════════════════════════════════════════════
// DECLINING BALANCE AMORTIZATION — الطريقة البنكية الصحيحة
// فائدة كل شهر = الرصيد المتبقي × المعدل الشهري
// القسط الثابت يُحسب بمعادلة PMT — الفرق يُضبط في الشهر الأخير
// ═══════════════════════════════════════════════════════════════

export interface InstallmentRow {
  installmentNumber: number;
  dueDate: Date;
  principalMillimes: bigint;
  interestMillimes:  bigint;
  totalMillimes:     bigint;
  remainingBalanceMillimes: bigint;
}

export interface AmortizationResult {
  monthlyPaymentMillimes: bigint;
  totalPrincipalMillimes: bigint;
  totalInterestMillimes:  bigint;
  schedule: InstallmentRow[];
}

export function buildAmortizationSchedule(params: {
  principalMillimes: bigint;
  annualRateBps:     number;   // e.g. 2400 = 24% سنوي
  termMonths:        number;
  startDate:         Date;     // تاريخ الإنشاء — أول قسط بعد شهر
}): AmortizationResult {
  const { principalMillimes, annualRateBps, termMonths, startDate } = params;

  if (principalMillimes <= 0n) throw new Error("AMORT: principal must be > 0");
  if (termMonths <= 0 || termMonths > 360) throw new Error("AMORT: invalid term");
  if (annualRateBps < 0) throw new Error("AMORT: rate cannot be negative");

  const schedule: InstallmentRow[] = [];

  // حساب القسط الثابت بمعادلة PMT
  // PMT = P × r / (1 - (1+r)^-n)  حيث r = معدل شهري
  const monthlyPaymentMillimes = calcPMT(principalMillimes, annualRateBps, termMonths);

  let remainingBalance = principalMillimes;
  let totalInterest    = 0n;

  // ANNUAL_DENOM = 12 × 10000 = 120000
  // interest = balance × annualRateBps / 120000
  const DENOM = 120000n;
  const rateBpsN = BigInt(annualRateBps);

  for (let i = 1; i <= termMonths; i++) {
    // فائدة هذا الشهر على الرصيد المتبقي
    const interestMillimes = (remainingBalance * rateBpsN) / DENOM;

    let principalMillimesThisMonth = monthlyPaymentMillimes - interestMillimes;

    // الشهر الأخير: يأخذ كل الرصيد (يصفّي فروق التقريب)
    if (i === termMonths) {
      principalMillimesThisMonth = remainingBalance;
    }

    // حماية: الأصل لا يتجاوز الرصيد
    if (principalMillimesThisMonth > remainingBalance) {
      principalMillimesThisMonth = remainingBalance;
    }

    const totalMillimes = principalMillimesThisMonth + interestMillimes;
    remainingBalance   -= principalMillimesThisMonth;
    totalInterest      += interestMillimes;

    schedule.push({
      installmentNumber:        i,
      dueDate:                  addMonths(startDate, i),
      principalMillimes:        principalMillimesThisMonth,
      interestMillimes,
      totalMillimes,
      remainingBalanceMillimes: remainingBalance,
    });
  }

  return {
    monthlyPaymentMillimes,
    totalPrincipalMillimes: principalMillimes,
    totalInterestMillimes:  totalInterest,
    schedule,
  };
}

// PMT بـ float مرة واحدة فقط عند بناء الجدول
// الدقة محفوظة لأننا نستخدم bigint في كل خطوة من الجدول
function calcPMT(principal: bigint, annualRateBps: number, n: number): bigint {
  if (annualRateBps === 0) {
    // بدون فائدة: قسمة تساوية
    const { quotient } = { quotient: principal / BigInt(n), remainder: principal % BigInt(n) };
    return quotient + 1n; // نرفع قليلاً — الشهر الأخير يصفّي
  }
  const r = annualRateBps / 12 / 10000;
  const P = Number(principal);
  const factor = Math.pow(1 + r, n);
  const pmt = (P * r * factor) / (factor - 1);
  return BigInt(Math.ceil(pmt)); // ceil — الفرق في الشهر الأخير
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}
