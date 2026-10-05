import type { LoanInput, TenureUnit } from '../types/loan';
import { validateLoanForm, type LoanFormValues } from '../utils/validation';

export const DEFAULT_LOAN: LoanInput = {
  principal: 2_500_000,
  annualInterestRate: 10,
  tenure: 10,
  tenureUnit: 'years',
};

const PARAM = { principal: 'amount', rate: 'rate', tenure: 'tenure', unit: 'unit' } as const;

const isTenureUnit = (value: string | null): value is TenureUnit =>
  value === 'years' || value === 'months';

export function toFormValues(loan: LoanInput): LoanFormValues {
  return {
    principal: String(loan.principal),
    annualInterestRate: String(loan.annualInterestRate),
    tenure: String(loan.tenure),
    tenureUnit: loan.tenureUnit,
  };
}

export function fromFormValues(values: LoanFormValues): LoanInput {
  return {
    principal: Number(values.principal),
    annualInterestRate: Number(values.annualInterestRate),
    tenure: Number(values.tenure),
    tenureUnit: values.tenureUnit,
  };
}

/**
 * The submitted loan lives in the URL so every view is shareable and deep-linkable.
 * Missing or invalid parameters fall back to the default loan.
 */
export function loanFromSearchParams(params: URLSearchParams): LoanInput {
  const unit = params.get(PARAM.unit);
  const values: LoanFormValues = {
    principal: params.get(PARAM.principal) ?? '',
    annualInterestRate: params.get(PARAM.rate) ?? '',
    tenure: params.get(PARAM.tenure) ?? '',
    tenureUnit: isTenureUnit(unit) ? unit : 'years',
  };
  const isValid = Object.keys(validateLoanForm(values)).length === 0;
  return isValid ? fromFormValues(values) : DEFAULT_LOAN;
}

export function loanToSearchParams(loan: LoanInput): URLSearchParams {
  return new URLSearchParams({
    [PARAM.principal]: String(loan.principal),
    [PARAM.rate]: String(loan.annualInterestRate),
    [PARAM.tenure]: String(loan.tenure),
    [PARAM.unit]: loan.tenureUnit,
  });
}
