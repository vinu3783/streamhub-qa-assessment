import { Line } from 'react-chartjs-2';
import { useChartTheme } from '../../hooks/useChartTheme';
import { formatCurrency } from '../../utils/format';
import { ChartFigure } from './ChartFigure';
import { compactRupees } from './chartSetup';

export interface BalancePoint {
  label: string;
  balance: number;
}

export function BalanceChart({ points }: { points: BalancePoint[] }) {
  const theme = useChartTheme();
  const first = points[0];
  const last = points.at(-1);

  return (
    <ChartFigure
      testId="balance-chart"
      title="Outstanding balance"
      description={
        first && last
          ? `Closing balance from ${first.label} (${formatCurrency(first.balance)}) to ${last.label} (${formatCurrency(last.balance)}).`
          : 'No periods selected.'
      }
      legend={[]}
      table={{
        caption: 'Closing balance per period',
        columns: ['Period', 'Closing balance'],
        rows: points.map((p) => ({ label: p.label, values: [p.balance] })),
      }}
    >
      <Line
        role="img"
        aria-label={`Line chart of the outstanding balance over ${points.length} periods`}
        data={{
          labels: points.map((p) => p.label),
          datasets: [
            {
              label: 'Closing balance',
              data: points.map((p) => p.balance),
              borderColor: theme.balance,
              backgroundColor: `${theme.balance}22`,
              borderWidth: 2,
              fill: true,
              pointRadius: points.length > 40 ? 0 : 3,
              pointHoverRadius: 5,
              tension: 0.2,
            },
          ],
        }}
        options={{
          interaction: { mode: 'index', intersect: false },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: theme.textSecondary, maxTicksLimit: 12 },
            },
            y: {
              beginAtZero: true,
              grid: { color: theme.grid },
              border: { display: false },
              ticks: {
                color: theme.textSecondary,
                callback: (v) => compactRupees.format(Number(v)),
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: { label: (item) => ` Balance: ${formatCurrency(item.parsed.y ?? 0)}` },
            },
          },
        }}
      />
    </ChartFigure>
  );
}
