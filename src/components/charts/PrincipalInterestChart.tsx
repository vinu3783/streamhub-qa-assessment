import { Doughnut } from 'react-chartjs-2';
import type { LoanSummary } from '../../types/loan';
import { useChartTheme } from '../../hooks/useChartTheme';
import { formatCurrency, formatPercent } from '../../utils/format';
import { ChartFigure } from './ChartFigure';
import './chartSetup';

export function PrincipalInterestChart({ summary }: { summary: LoanSummary }) {
  const theme = useChartTheme();
  const slices = [
    { label: 'Principal', value: summary.principal, color: theme.principal },
    { label: 'Interest', value: summary.totalInterest, color: theme.interest },
  ];
  const share = (value: number) => formatPercent(value / summary.totalPayment);

  return (
    <ChartFigure
      testId="principal-interest-chart"
      title="Principal vs interest"
      description={`Breakdown of the total payment of ${formatCurrency(summary.totalPayment)}.`}
      legend={slices}
      table={{
        caption: 'Principal and interest share of the total payment',
        columns: ['Component', 'Amount'],
        rows: slices.map((slice) => ({ label: slice.label, values: [slice.value] })),
      }}
    >
      <Doughnut
        role="img"
        aria-label={slices.map((s) => `${s.label} ${share(s.value)}`).join(', ')}
        data={{
          labels: slices.map((s) => s.label),
          datasets: [
            {
              data: slices.map((s) => s.value),
              backgroundColor: slices.map((s) => s.color),
              borderColor: theme.surface,
              borderWidth: 2,
            },
          ],
        }}
        options={{
          cutout: '62%',
          plugins: {
            tooltip: {
              callbacks: {
                label: (item) => ` ${formatCurrency(item.parsed)} (${share(item.parsed)})`,
              },
            },
          },
        }}
      />
    </ChartFigure>
  );
}
