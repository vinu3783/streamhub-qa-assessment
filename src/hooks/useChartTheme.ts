import { useEffect, useState } from 'react';

export interface ChartTheme {
  principal: string;
  interest: string;
  balance: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  grid: string;
}

function readTheme(): ChartTheme {
  const styles = getComputedStyle(document.documentElement);
  const token = (name: string) => styles.getPropertyValue(name).trim();
  return {
    principal: token('--series-principal'),
    interest: token('--series-interest'),
    balance: token('--series-balance'),
    surface: token('--surface-1'),
    textPrimary: token('--text-primary'),
    textSecondary: token('--text-secondary'),
    grid: token('--grid'),
  };
}

/** Chart.js paints on canvas, so it needs the CSS colour tokens resolved for the active theme. */
export function useChartTheme(): ChartTheme {
  const [theme, setTheme] = useState(readTheme);
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setTheme(readTheme());
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return theme;
}
