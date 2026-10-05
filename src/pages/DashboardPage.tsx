import { LoanForm } from '../components/LoanForm';
import { SummaryCards } from '../components/SummaryCards';
import { PrincipalInterestChart } from '../components/charts/PrincipalInterestChart';
import { YearlyPaymentChart } from '../components/charts/YearlyPaymentChart';
import { useLoan } from '../hooks/useLoan';

export function DashboardPage() {
  const { loan, summary, yearly, submitLoan, query } = useLoan();

  return (
    <div className="page-grid">
      <aside>
        <LoanForm key={query} loan={loan} onSubmit={submitLoan} />
      </aside>
      <div className="page-content">
        <header className="page-header">
          <h1>Loan dashboard</h1>
          <p className="muted">EMI, total cost of borrowing and how repayments split over time.</p>
        </header>
        <SummaryCards loan={loan} summary={summary} />
        <div className="chart-grid">
          <PrincipalInterestChart summary={summary} />
          <YearlyPaymentChart yearly={yearly} />
        </div>
      </div>
    </div>
  );
}
