import type { TenureUnit } from '../types/loan';

export const LIMITS = {
  principal: { max: 100_000_000 },
  annualInterestRate: { max: 50 },
  tenure: { years: { min: 1, max: 40 }, months: { min: 1, max: 480 } },
} as const;

export interface LoanFormValues {
  principal: string;
  annualInterestRate: string;
  tenure: string;
  tenureUnit: TenureUnit;
}

export type LoanField = 'principal' | 'annualInterestRate' | 'tenure';
export type LoanFormErrors = Partial<Record<LoanField, string>>;

const DECIMAL_PATTERN = /^\d+(\.\d{1,2})?$/;
const INTEGER_PATTERN = /^\d+$/;
const indianNumber = new Intl.NumberFormat('en-IN');

function validatePrincipal(raw: string): string | undefined {
  const value = raw.trim();
  if (value === '') return 'Loan amount is required.';
  if (value.startsWith('-')) return 'Loan amount must be greater than zero.';
  if (!DECIMAL_PATTERN.test(value)) {
    return 'Loan amount must be a number with at most 2 decimal places.';
  }
  const amount = Number(value);
  if (amount <= 0) return 'Loan amount must be greater than zero.';
  if (amount > LIMITS.principal.max) {
    return `Loan amount cannot exceed ₹${indianNumber.format(LIMITS.principal.max)}.`;
  }
  return undefined;
}

function validateRate(raw: string): string | undefined {
  const value = raw.trim();
  const { max } = LIMITS.annualInterestRate;
  if (value === '') return 'Interest rate is required.';
  if (value.startsWith('-')) return 'Interest rate cannot be negative.';
  if (!DECIMAL_PATTERN.test(value)) {
    return 'Interest rate must be a number with at most 2 decimal places.';
  }
  if (Number(value) > max) return `Interest rate cannot exceed ${max}% per annum.`;
  return undefined;
}

function validateTenure(raw: string, unit: TenureUnit): string | undefined {
  const value = raw.trim();
  const { min, max } = LIMITS.tenure[unit];
  if (value === '') return 'Loan tenure is required.';
  if (!INTEGER_PATTERN.test(value)) return `Loan tenure must be a whole number of ${unit}.`;
  const tenure = Number(value);
  if (tenure < min || tenure > max) {
    return `Loan tenure must be between ${min} and ${max} ${unit}.`;
  }
  return undefined;
}

export function validateLoanForm(values: LoanFormValues): LoanFormErrors {
  const errors: LoanFormErrors = {};
  const principal = validatePrincipal(values.principal);
  const rate = validateRate(values.annualInterestRate);
  const tenure = validateTenure(values.tenure, values.tenureUnit);
  if (principal) errors.principal = principal;
  if (rate) errors.annualInterestRate = rate;
  if (tenure) errors.tenure = tenure;
  return errors;
}
