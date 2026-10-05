import type { Locator, Page } from '@playwright/test';

export type LoanFormField = 'loan amount' | 'interest rate' | 'loan tenure';

const FIELD_TEST_IDS: Record<LoanFormField, string> = {
  'loan amount': 'loan-amount',
  'interest rate': 'interest-rate',
  'loan tenure': 'loan-tenure',
};

export interface LoanFormInput {
  amount: string;
  rate: string;
  tenure: string;
  unit: 'years' | 'months';
}

export class LoanFormComponent {
  readonly root: Locator;
  readonly calculateButton: Locator;
  readonly tenureUnit: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('form', { name: 'Loan details' });
    this.calculateButton = this.root.getByTestId('calculate-button');
    this.tenureUnit = this.root.getByTestId('tenure-unit-select');
  }

  input(field: LoanFormField): Locator {
    return this.root.getByTestId(`${FIELD_TEST_IDS[field]}-input`);
  }

  error(field: LoanFormField): Locator {
    return this.root.getByTestId(`${FIELD_TEST_IDS[field]}-error`);
  }

  get errors(): Locator {
    return this.root.getByRole('alert');
  }

  async setField(field: LoanFormField, value: string): Promise<void> {
    await this.input(field).fill(value);
  }

  async fill(loan: LoanFormInput): Promise<void> {
    await this.setField('loan amount', loan.amount);
    await this.setField('interest rate', loan.rate);
    await this.setField('loan tenure', loan.tenure);
    await this.tenureUnit.selectOption(loan.unit);
  }

  async submit(): Promise<void> {
    await this.calculateButton.click();
  }
}
