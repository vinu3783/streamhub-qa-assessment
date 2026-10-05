import type { AmortizationRow, LoanInput, LoanSummary, YearlySummary } from '../types/loan';

const MONTHS_PER_YEAR = 12;

export function toMonths(tenure: number, unit: LoanInput['tenureUnit']): number {
  return unit === 'years' ? tenure * MONTHS_PER_YEAR : tenure;
}

/**
 * Standard reducing-balance EMI: P × r × (1 + r)^n / ((1 + r)^n − 1),
 * where r is the monthly rate and n the number of monthly payments.
 * A zero-interest loan is repaid in equal instalments of P / n.
 */
export function calculateEMI(
  principal: number,
  annualInterestRate: number,
  months: number,
): number {
  if (principal <= 0 || months <= 0 || annualInterestRate < 0) {
    throw new RangeError('principal and months must be positive and the rate non-negative');
  }
  const monthlyRate = annualInterestRate / MONTHS_PER_YEAR / 100;
  if (monthlyRate === 0) {
    return principal / months;
  }
  const growth = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * growth) / (growth - 1);
}

export function buildAmortizationSchedule(input: LoanInput): AmortizationRow[] {
  const months = toMonths(input.tenure, input.tenureUnit);
  const emi = calculateEMI(input.principal, input.annualInterestRate, months);
  const monthlyRate = input.annualInterestRate / MONTHS_PER_YEAR / 100;

  const rows: AmortizationRow[] = [];
  let balance = input.principal;
  for (let month = 1; month <= months; month += 1) {
    const interestPaid = balance * monthlyRate;
    const isFinalPayment = month === months;
    // The final instalment clears whatever floating-point residue is left.
    const principalPaid = isFinalPayment ? balance : emi - interestPaid;
    const closingBalance = isFinalPayment ? 0 : Math.max(balance - principalPaid, 0);
    rows.push({
      month,
      year: Math.ceil(month / MONTHS_PER_YEAR),
      openingBalance: balance,
      emi: principalPaid + interestPaid,
      principalPaid,
      interestPaid,
      closingBalance,
    });
    balance = closingBalance;
  }
  return rows;
}

export function summarizeByYear(schedule: AmortizationRow[]): YearlySummary[] {
  const byYear = new Map<number, YearlySummary>();
  for (const row of schedule) {
    const summary = byYear.get(row.year) ?? {
      year: row.year,
      principalPaid: 0,
      interestPaid: 0,
      totalPaid: 0,
      closingBalance: 0,
    };
    summary.principalPaid += row.principalPaid;
    summary.interestPaid += row.interestPaid;
    summary.totalPaid += row.emi;
    summary.closingBalance = row.closingBalance;
    byYear.set(row.year, summary);
  }
  return [...byYear.values()];
}

export function summarizeLoan(input: LoanInput, schedule: AmortizationRow[]): LoanSummary {
  const numberOfPayments = schedule.length;
  const emi = calculateEMI(input.principal, input.annualInterestRate, numberOfPayments);
  const totalPayment = emi * numberOfPayments;
  const totalInterest = totalPayment - input.principal;
  return {
    principal: input.principal,
    emi,
    totalInterest,
    totalPayment,
    interestToPrincipalRatio: totalInterest / input.principal,
    numberOfPayments,
  };
}
