import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

ChartJS.defaults.animation = prefersReducedMotion ? false : { duration: 400 };
ChartJS.defaults.maintainAspectRatio = false;
// Mirrors the body font stack; read here because canvas text cannot inherit CSS.
ChartJS.defaults.font.family =
  "Inter, 'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial, sans-serif";

export const compactRupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 1,
});
