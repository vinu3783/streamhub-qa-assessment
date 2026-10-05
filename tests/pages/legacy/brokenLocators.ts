/**
 * AI self-healing exercise (assessment requirement): deliberately broken / brittle locators.
 *
 * DO NOT FIX THESE. They are intentionally left broken and are exercised only by
 * tests/features/self-healing/broken-locators.feature (tag @self-healing, excluded from
 * `npm test`). The healthy equivalents live in tests/pages/*.ts.
 *
 * Each entry records the *intent* of the locator. The self-healing POC
 * (tools/self-healing) uses the intent plus a DOM snapshot to propose a replacement.
 * See docs/SELF_HEALING_LOCATORS.md.
 */
export interface BrokenLocator {
  id: string;
  selector: string;
  intent: string;
  /** Route the element lives on, relative to BASE_URL. */
  route: string;
  expectedRole: 'textbox' | 'button' | 'img' | 'text';
  whyBroken: string;
}

export const BROKEN_LOCATORS = {
  loanAmountById: {
    id: 'loanAmountById',
    selector: '#loanAmount',
    intent: 'The "Loan amount (₹)" text input in the loan details form',
    route: '/',
    expectedRole: 'textbox',
    whyBroken:
      'Relies on an internal element id that was renamed (the input id is now "principal-input").',
  },
  calculateByAbsoluteXPath: {
    id: 'calculateByAbsoluteXPath',
    selector: 'xpath=/html/body/div[1]/main/div[2]/form/button[1]',
    intent: 'The "Calculate EMI" submit button of the loan details form',
    route: '/',
    expectedRole: 'button',
    whyBroken:
      'Absolute XPath recorded before the layout gained an app-shell wrapper and a sidebar.',
  },
  emiByPosition: {
    id: 'emiByPosition',
    selector: '.summary-grid > article:nth-child(2) > p:nth-child(2)',
    intent: 'The monthly EMI value in the loan summary cards',
    route: '/',
    expectedRole: 'text',
    whyBroken:
      'Positional CSS recorded when EMI was the second card. It still matches an element — the loan amount — so it fails silently with a wrong value instead of a missing element.',
  },
  calculateByStaleText: {
    id: 'calculateByStaleText',
    selector: 'role=button[name="Compute EMI"]',
    intent: 'The "Calculate EMI" submit button of the loan details form',
    route: '/',
    expectedRole: 'button',
    whyBroken: 'Uses button copy that has since changed from "Compute EMI" to "Calculate EMI".',
  },
  chartCanvasByLibraryClass: {
    id: 'chartCanvasByLibraryClass',
    selector: 'canvas.chartjs-render-monitor',
    intent: 'The canvas of the "Principal vs interest" doughnut chart',
    route: '/',
    expectedRole: 'img',
    whyBroken:
      'Depends on a CSS class Chart.js 2.x injected; Chart.js 3+ no longer adds it. A typical AI-suggested selector from outdated training data.',
  },
} as const satisfies Record<string, BrokenLocator>;

export type BrokenLocatorId = keyof typeof BROKEN_LOCATORS;
