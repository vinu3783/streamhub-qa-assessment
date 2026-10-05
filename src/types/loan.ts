export type TenureUnit = 'years' | 'months';

export interface LoanInput {
  principal: number;
  annualInterestRate: number;
  tenure: number;
  tenureUnit: TenureUnit;
}

export interface AmortizationRow {
  month: number;
  year: number;
  openingBalance: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  closingBalance: number;
}

export interface YearlySummary {
  year: number;
  principalPaid: number;
  interestPaid: number;
  totalPaid: number;
  closingBalance: number;
}

export interface LoanSummary {
  principal: number;
  emi: number;
  totalInterest: number;
  totalPayment: number;
  interestToPrincipalRatio: number;
  numberOfPayments: number;
}
