import { useState, type FormEvent } from 'react';
import { fromFormValues, toFormValues } from '../services/loanQuery';
import type { LoanInput, TenureUnit } from '../types/loan';
import {
  validateLoanForm,
  type LoanField,
  type LoanFormErrors,
  type LoanFormValues,
} from '../utils/validation';

interface LoanFormProps {
  loan: LoanInput;
  onSubmit: (loan: LoanInput) => void;
}

interface FieldConfig {
  name: LoanField;
  label: string;
  testId: string;
  hint: string;
  inputMode: 'decimal' | 'numeric';
}

const FIELDS: FieldConfig[] = [
  {
    name: 'principal',
    label: 'Loan amount (₹)',
    testId: 'loan-amount',
    hint: 'Up to ₹10,00,00,000.',
    inputMode: 'decimal',
  },
  {
    name: 'annualInterestRate',
    label: 'Interest rate (% p.a.)',
    testId: 'interest-rate',
    hint: '0% to 50%.',
    inputMode: 'decimal',
  },
  {
    name: 'tenure',
    label: 'Loan tenure',
    testId: 'loan-tenure',
    hint: '1–40 years or 1–480 months.',
    inputMode: 'numeric',
  },
];

export function LoanForm({ loan, onSubmit }: LoanFormProps) {
  const [values, setValues] = useState<LoanFormValues>(() => toFormValues(loan));
  const [errors, setErrors] = useState<LoanFormErrors>({});

  const update = (name: keyof LoanFormValues, value: string) =>
    setValues((current) => ({ ...current, [name]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateLoanForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      onSubmit(fromFormValues(values));
    }
  };

  return (
    <form
      className="card loan-form"
      aria-labelledby="loan-form-title"
      noValidate
      onSubmit={handleSubmit}
    >
      <h2 id="loan-form-title" className="card-title">
        Loan details
      </h2>

      {FIELDS.map((field) => {
        const error = errors[field.name];
        const id = `${field.name}-input`;
        return (
          <div key={field.name} className="field">
            <label htmlFor={id}>{field.label}</label>
            <div className={field.name === 'tenure' ? 'input-group' : undefined}>
              <input
                id={id}
                name={field.name}
                type="text"
                inputMode={field.inputMode}
                autoComplete="off"
                value={values[field.name]}
                onChange={(event) => update(field.name, event.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${field.name}-error` : `${field.name}-hint`}
                data-testid={`${field.testId}-input`}
              />
              {field.name === 'tenure' && (
                <select
                  aria-label="Tenure unit"
                  value={values.tenureUnit}
                  onChange={(event) => update('tenureUnit', event.target.value as TenureUnit)}
                  data-testid="tenure-unit-select"
                >
                  <option value="years">Years</option>
                  <option value="months">Months</option>
                </select>
              )}
            </div>
            {error ? (
              <p
                id={`${field.name}-error`}
                className="field-error"
                role="alert"
                data-testid={`${field.testId}-error`}
              >
                {error}
              </p>
            ) : (
              <p id={`${field.name}-hint`} className="field-hint">
                {field.hint}
              </p>
            )}
          </div>
        );
      })}

      <button type="submit" className="button-primary" data-testid="calculate-button">
        Calculate EMI
      </button>
    </form>
  );
}
