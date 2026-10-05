/**
 * Independent test oracle for loan maths.
 *
 * Deliberately does NOT import anything from src/: the expected values are derived here
 * from first principles, so a bug in the application's calculation cannot also hide in
 * the expectation. It uses the annuity form EMI = P·r / (1 − (1 + r)^−n), which is
 * algebraically equal to the P·r·(1+r)^n / ((1+r)^n − 1) form used by the app, and
 * builds the yearly split by simulating each monthly payment.
 */

export type TenureUnit = 'years' | 'months';

export interface ExpectedYear {
  year: number;
  principal: number;
  interest: number;
}

export interface ExpectedLoan {
  principal: number;
  annualRatePercent: number;
  months: number;
  emi: number;
  totalPayment: number;
  totalInterest: number;
  interestToPrincipalRatio: number;
  years: ExpectedYear[];
}

export function tenureInMonths(tenure: number, unit: TenureUnit): number {
  return unit === 'years' ? tenure * 12 : tenure;
}

export function expectedEmi(principal: number, annualRatePercent: number, months: number): number {
  const monthlyRate = annualRatePercent / 1200;
  if (monthlyRate === 0) return principal / months;
  return (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -months);
}

function expectedYearlySplit(principal: number, monthlyRate: number, months: number, emi: number) {
  const years: ExpectedYear[] = [];
  let outstanding = principal;
  for (let month = 0; month < months; month += 1) {
    const yearIndex = Math.floor(month / 12);
    const interest = outstanding * monthlyRate;
    const isLast = month === months - 1;
    const principalPart = isLast ? outstanding : emi - interest;
    outstanding -= principalPart;
    const year = (years[yearIndex] ??= { year: yearIndex + 1, principal: 0, interest: 0 });
    year.principal += principalPart;
    year.interest += interest;
  }
  return years;
}

export function expectedLoan(
  principal: number,
  annualRatePercent: number,
  tenure: number,
  unit: TenureUnit,
): ExpectedLoan {
  const months = tenureInMonths(tenure, unit);
  const emi = expectedEmi(principal, annualRatePercent, months);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;
  return {
    principal,
    annualRatePercent,
    months,
    emi,
    totalPayment,
    totalInterest,
    interestToPrincipalRatio: totalInterest / principal,
    years: expectedYearlySplit(principal, annualRatePercent / 1200, months, emi),
  };
}

/** Rounds half away from zero to 2 decimals, the way the UI presents money. */
export function roundToPaise(value: number): number {
  return (Math.sign(value) * Math.round((Math.abs(value) + Number.EPSILON) * 100)) / 100;
}
