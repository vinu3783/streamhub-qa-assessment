import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loanFromSearchParams, loanToSearchParams } from '../services/loanQuery';
import type { LoanInput } from '../types/loan';
import {
  buildAmortizationSchedule,
  summarizeByYear,
  summarizeLoan,
} from '../utils/loanCalculations';

export function useLoan() {
  const [searchParams, setSearchParams] = useSearchParams();
  const loan = useMemo(() => loanFromSearchParams(searchParams), [searchParams]);

  const results = useMemo(() => {
    const schedule = buildAmortizationSchedule(loan);
    return {
      schedule,
      yearly: summarizeByYear(schedule),
      summary: summarizeLoan(loan, schedule),
    };
  }, [loan]);

  const submitLoan = (next: LoanInput) => setSearchParams(loanToSearchParams(next));

  return { loan, ...results, submitLoan, query: loanToSearchParams(loan).toString() };
}
