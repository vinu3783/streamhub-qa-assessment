# Self-healing POC report

Generated 2026-10-05T12:02:02.626Z against `BASE_URL`. Candidate sources: heuristic only (run with `--ai` to add Claude suggestions).

Nothing below has been applied. A recommendation becomes a fix only after a human applies it,
the affected scenario passes and the full regression suite passes.

| Locator | Failure mode | Recommended replacement | Candidates (accepted / total) |
| --- | --- | --- | --- |
| `loanAmountById` | not-found | `page.getByTestId('loan-amount-input')` | 6 / 9 |
| `calculateByAbsoluteXPath` | not-found | `page.getByTestId('calculate-button')` | 2 / 2 |
| `emiByPosition` | wrong-target | `page.getByTestId('emi-value')` | 6 / 14 |
| `calculateByStaleText` | not-found | `page.getByTestId('calculate-button')` | 2 / 2 |
| `chartCanvasByLibraryClass` | not-found | human review: Top candidates point at different elements with close scores (0.64 vs 0.64). | 2 / 4 |

## `loanAmountById`

- Broken selector: `#loanAmount`
- Intent: The "Loan amount (₹)" text input in the loan details form
- Why it is brittle: Relies on an internal element id that was renamed (the input id is now "principal-input").
- Detected: **not-found** — Selector matched 0 elements.
- Prompt: [prompts/loanAmountById.md](prompts/loanAmountById.md)

Suggested patch (tests/pages/legacy/brokenLocators.ts → page object):

```diff
- page.locator('#loanAmount')
+ page.getByTestId('loan-amount-input')
```

| Candidate | Source | Score | Accepted | Checks |
| --- | --- | --- | --- | --- |
| `page.getByTestId('loan-amount-input')` | heuristic | 0.50 | yes | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=textbox, expected textbox)<br>✅ matches intent (semantic score 0.50 (min 0.3))<br>✅ editable (isEditable())<br>✅ survives layout change (1 match(es) at 390px wide) |
| `page.getByRole('textbox', { name: 'Loan amount (₹)', exact: true })` | heuristic | 0.45 | yes | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=textbox, expected textbox)<br>✅ matches intent (semantic score 0.50 (min 0.3))<br>✅ editable (isEditable())<br>✅ survives layout change (1 match(es) at 390px wide) |
| `page.getByLabel('Loan amount (₹)', { exact: true })` | heuristic | 0.42 | yes | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=textbox, expected textbox)<br>✅ matches intent (semantic score 0.50 (min 0.3))<br>✅ editable (isEditable())<br>✅ survives layout change (1 match(es) at 390px wide) |
| `page.getByTestId('loan-tenure-input')` | heuristic | 0.33 | yes | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=textbox, expected textbox)<br>✅ matches intent (semantic score 0.33 (min 0.3))<br>✅ editable (isEditable())<br>✅ survives layout change (1 match(es) at 390px wide) |
| `page.getByRole('textbox', { name: 'Loan tenure', exact: true })` | heuristic | 0.30 | yes | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=textbox, expected textbox)<br>✅ matches intent (semantic score 0.33 (min 0.3))<br>✅ editable (isEditable())<br>✅ survives layout change (1 match(es) at 390px wide) |
| `page.getByLabel('Loan tenure', { exact: true })` | heuristic | 0.28 | yes | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=textbox, expected textbox)<br>✅ matches intent (semantic score 0.33 (min 0.3))<br>✅ editable (isEditable())<br>✅ survives layout change (1 match(es) at 390px wide) |
| `page.getByTestId('interest-rate-input')` | heuristic | 0.17 | no | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=textbox, expected textbox)<br>❌ matches intent (semantic score 0.17 (min 0.3))<br>✅ editable (isEditable())<br>✅ survives layout change (1 match(es) at 390px wide) |
| `page.getByRole('textbox', { name: 'Interest rate (% p.a.)', exact: true })` | heuristic | 0.15 | no | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=textbox, expected textbox)<br>❌ matches intent (semantic score 0.17 (min 0.3))<br>✅ editable (isEditable())<br>✅ survives layout change (1 match(es) at 390px wide) |
| `page.getByLabel('Interest rate (% p.a.)', { exact: true })` | heuristic | 0.14 | no | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=textbox, expected textbox)<br>❌ matches intent (semantic score 0.17 (min 0.3))<br>✅ editable (isEditable())<br>✅ survives layout change (1 match(es) at 390px wide) |

## `calculateByAbsoluteXPath`

- Broken selector: `xpath=/html/body/div[1]/main/div[2]/form/button[1]`
- Intent: The "Calculate EMI" submit button of the loan details form
- Why it is brittle: Absolute XPath recorded before the layout gained an app-shell wrapper and a sidebar.
- Detected: **not-found** — Selector matched 0 elements.
- Prompt: [prompts/calculateByAbsoluteXPath.md](prompts/calculateByAbsoluteXPath.md)

Suggested patch (tests/pages/legacy/brokenLocators.ts → page object):

```diff
- page.locator('xpath=/html/body/div[1]/main/div[2]/form/button[1]')
+ page.getByTestId('calculate-button')
```

| Candidate | Source | Score | Accepted | Checks |
| --- | --- | --- | --- | --- |
| `page.getByTestId('calculate-button')` | heuristic | 0.43 | yes | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=button, expected button)<br>✅ matches intent (semantic score 0.43 (min 0.3))<br>✅ actionable (click({ trial: true }))<br>✅ survives layout change (1 match(es) at 390px wide) |
| `page.getByRole('button', { name: 'Calculate EMI', exact: true })` | heuristic | 0.39 | yes | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=button, expected button)<br>✅ matches intent (semantic score 0.43 (min 0.3))<br>✅ actionable (click({ trial: true }))<br>✅ survives layout change (1 match(es) at 390px wide) |

## `emiByPosition`

- Broken selector: `.summary-grid > article:nth-child(2) > p:nth-child(2)`
- Intent: The monthly EMI value in the loan summary cards
- Why it is brittle: Positional CSS recorded when EMI was the second card. It still matches an element — the loan amount — so it fails silently with a wrong value instead of a missing element.
- Detected: **wrong-target** — Selector matched 1 element ("Loan amount", data-testid="principal-amount") whose description scores 0.33 against the intent while another element scores 0.83.
- Prompt: [prompts/emiByPosition.md](prompts/emiByPosition.md)

Suggested patch (tests/pages/legacy/brokenLocators.ts → page object):

```diff
- page.locator('.summary-grid > article:nth-child(2) > p:nth-child(2)')
+ page.getByTestId('emi-value')
```

| Candidate | Source | Score | Accepted | Checks |
| --- | --- | --- | --- | --- |
| `page.getByTestId('emi-value')` | heuristic | 0.83 | yes | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=none, expected text)<br>✅ matches intent (semantic score 0.83 (min 0.3))<br>✅ survives layout change (1 match(es) at 390px wide) |
| `page.getByTestId('loan-summary')` | heuristic | 0.33 | yes | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=none, expected text)<br>✅ matches intent (semantic score 0.33 (min 0.3))<br>✅ survives layout change (1 match(es) at 390px wide) |
| `page.getByTestId('principal-amount')` | heuristic | 0.33 | yes | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=none, expected text)<br>✅ matches intent (semantic score 0.33 (min 0.3))<br>✅ survives layout change (1 match(es) at 390px wide) |
| `page.getByTestId('total-interest')` | heuristic | 0.33 | yes | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=none, expected text)<br>✅ matches intent (semantic score 0.33 (min 0.3))<br>✅ survives layout change (1 match(es) at 390px wide) |
| `page.getByTestId('total-payment')` | heuristic | 0.33 | yes | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=none, expected text)<br>✅ matches intent (semantic score 0.33 (min 0.3))<br>✅ survives layout change (1 match(es) at 390px wide) |
| `page.getByTestId('interest-ratio')` | heuristic | 0.33 | yes | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=none, expected text)<br>✅ matches intent (semantic score 0.33 (min 0.3))<br>✅ survives layout change (1 match(es) at 390px wide) |
| `page.getByTestId('principal-interest-chart')` | heuristic | 0.00 | no | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=none, expected text)<br>❌ matches intent (semantic score 0.00 (min 0.3))<br>✅ survives layout change (1 match(es) at 390px wide) |
| `page.getByTestId('principal-interest-chart-legend')` | heuristic | 0.00 | no | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=none, expected text)<br>❌ matches intent (semantic score 0.00 (min 0.3))<br>✅ survives layout change (1 match(es) at 390px wide) |
| `page.getByTestId('principal-interest-chart-legend-value')` | heuristic | 0.00 | no | ✅ stable name (no data-dependent text)<br>❌ unique (2 match(es)) |
| `page.getByTestId('principal-interest-chart-data')` | heuristic | 0.00 | no | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>❌ visible (element is visible)<br>✅ expected role (role=none, expected text)<br>❌ matches intent (semantic score 0.00 (min 0.3))<br>✅ survives layout change (1 match(es) at 390px wide) |
| `page.getByTestId('yearly-payment-chart')` | heuristic | 0.00 | no | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=none, expected text)<br>❌ matches intent (semantic score 0.00 (min 0.3))<br>✅ survives layout change (1 match(es) at 390px wide) |
| `page.getByTestId('yearly-payment-chart-legend')` | heuristic | 0.00 | no | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=none, expected text)<br>❌ matches intent (semantic score 0.00 (min 0.3))<br>✅ survives layout change (1 match(es) at 390px wide) |
| `page.getByTestId('yearly-payment-chart-legend-value')` | heuristic | 0.00 | no | ✅ stable name (no data-dependent text)<br>❌ unique (2 match(es)) |
| `page.getByTestId('yearly-payment-chart-data')` | heuristic | 0.00 | no | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>❌ visible (element is visible)<br>✅ expected role (role=none, expected text)<br>❌ matches intent (semantic score 0.00 (min 0.3))<br>✅ survives layout change (1 match(es) at 390px wide) |

## `calculateByStaleText`

- Broken selector: `role=button[name="Compute EMI"]`
- Intent: The "Calculate EMI" submit button of the loan details form
- Why it is brittle: Uses button copy that has since changed from "Compute EMI" to "Calculate EMI".
- Detected: **not-found** — Selector matched 0 elements.
- Prompt: [prompts/calculateByStaleText.md](prompts/calculateByStaleText.md)

Suggested patch (tests/pages/legacy/brokenLocators.ts → page object):

```diff
- page.locator('role=button[name="Compute EMI"]')
+ page.getByTestId('calculate-button')
```

| Candidate | Source | Score | Accepted | Checks |
| --- | --- | --- | --- | --- |
| `page.getByTestId('calculate-button')` | heuristic | 0.43 | yes | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=button, expected button)<br>✅ matches intent (semantic score 0.43 (min 0.3))<br>✅ actionable (click({ trial: true }))<br>✅ survives layout change (1 match(es) at 390px wide) |
| `page.getByRole('button', { name: 'Calculate EMI', exact: true })` | heuristic | 0.39 | yes | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=button, expected button)<br>✅ matches intent (semantic score 0.43 (min 0.3))<br>✅ actionable (click({ trial: true }))<br>✅ survives layout change (1 match(es) at 390px wide) |

## `chartCanvasByLibraryClass`

- Broken selector: `canvas.chartjs-render-monitor`
- Intent: The canvas of the "Principal vs interest" doughnut chart
- Why it is brittle: Depends on a CSS class Chart.js 2.x injected; Chart.js 3+ no longer adds it. A typical AI-suggested selector from outdated training data.
- Detected: **not-found** — Selector matched 0 elements.
- Prompt: [prompts/chartCanvasByLibraryClass.md](prompts/chartCanvasByLibraryClass.md)

| Candidate | Source | Score | Accepted | Checks |
| --- | --- | --- | --- | --- |
| `page.getByTestId('principal-interest-chart').getByRole('img')` | heuristic | 0.64 | yes | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=img, expected img)<br>✅ matches intent (semantic score 0.80 (min 0.3))<br>✅ survives layout change (1 match(es) at 390px wide) |
| `page.getByTestId('yearly-payment-chart').getByRole('img')` | heuristic | 0.64 | yes | ✅ stable name (no data-dependent text)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=img, expected img)<br>✅ matches intent (semantic score 0.80 (min 0.3))<br>✅ survives layout change (1 match(es) at 390px wide) |
| `page.getByRole('img', { name: 'Principal 63.06%, Interest 36.94%', exact: true })` | heuristic | 0.72 | no | ❌ stable name (name contains numbers that change with the data)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=img, expected img)<br>✅ matches intent (semantic score 0.80 (min 0.3))<br>✅ survives layout change (1 match(es) at 390px wide) |
| `page.getByRole('img', { name: 'Stacked bar chart of principal and interest paid across 10 years', exact: true })` | heuristic | 0.72 | no | ❌ stable name (name contains numbers that change with the data)<br>✅ unique (1 match(es))<br>✅ visible (element is visible)<br>✅ expected role (role=img, expected img)<br>✅ matches intent (semantic score 0.80 (min 0.3))<br>✅ survives layout change (1 match(es) at 390px wide) |
