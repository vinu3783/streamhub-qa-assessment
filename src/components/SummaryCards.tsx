import type { LoanInput, LoanSummary } from '../types/loan';
import { formatCurrency, formatPercent } from '../utils/format';

interface SummaryCardsProps {
  loan: LoanInput;
  summary: LoanSummary;
}

export function SummaryCards({ loan, summary }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Monthly EMI',
      value: formatCurrency(summary.emi),
      testId: 'emi-value',
      detail: `${summary.numberOfPayments} monthly payments`,
      hero: true,
    },
    {
      label: 'Loan amount',
      value: formatCurrency(summary.principal),
      testId: 'principal-amount',
      detail: `${loan.annualInterestRate}% p.a. for ${loan.tenure} ${loan.tenureUnit}`,
    },
    {
      label: 'Total interest',
      value: formatCurrency(summary.totalInterest),
      testId: 'total-interest',
      detail: 'Cost of borrowing',
    },
    {
      label: 'Total payment',
      value: formatCurrency(summary.totalPayment),
      testId: 'total-payment',
      detail: 'Principal + interest',
    },
    {
      label: 'Interest-to-principal',
      value: formatPercent(summary.interestToPrincipalRatio),
      testId: 'interest-ratio',
      detail: 'Interest as a share of principal',
    },
  ];

  return (
    <section aria-label="Loan summary" className="summary-grid" data-testid="loan-summary">
      {cards.map((card) => (
        <article key={card.testId} className={card.hero ? 'card stat stat-hero' : 'card stat'}>
          <h3 className="stat-label" id={`${card.testId}-label`}>
            {card.label}
          </h3>
          <p
            className="stat-value"
            aria-labelledby={`${card.testId}-label`}
            data-testid={card.testId}
          >
            {card.value}
          </p>
          <p className="stat-detail muted">{card.detail}</p>
        </article>
      ))}
    </section>
  );
}
