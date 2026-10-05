# AI self-healing locators

This document covers the assessment's self-healing exercise:

1. **3–5 incorrect or brittle locators, left broken in the test files.** There are five, in
   [`tests/pages/legacy/brokenLocators.ts`](../tests/pages/legacy/brokenLocators.ts). They are used by
   [`LegacyDashboardPage`](../tests/pages/legacy/LegacyDashboardPage.ts) and
   [`broken-locators.feature`](../tests/features/self-healing/broken-locators.feature).
2. **How they would be healed with AI:** detection, the prompt approach, and validation before a fix is applied.
3. **A working proof of concept** in [`tools/self-healing/`](../tools/self-healing/) (`npm run heal`).

The broken scenarios are tagged `@self-healing`. They are excluded from `npm test` so the main
suite stays meaningful, and they run on their own with `npm run test:self-healing`. Their real,
failing output is committed in
[`reports/cucumber/self-healing.html`](../reports/cucumber/self-healing.html) and
[`reports/logs/self-healing-summary.txt`](../reports/logs/self-healing-summary.txt). The same user
journeys pass in `loan-dashboard.feature`, which uses the resilient locators in `tests/pages/`.

## The broken locators

| #   | Id                          | Broken locator                                          | Failure it causes                                                     |
| --- | --------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------- |
| 1   | `loanAmountById`            | `#loanAmount`                                           | Not found: the element id was renamed                                 |
| 2   | `calculateByAbsoluteXPath`  | `xpath=/html/body/div[1]/main/div[2]/form/button[1]`    | Not found: the layout gained a wrapper and a sidebar                  |
| 3   | `emiByPosition`             | `.summary-grid > article:nth-child(2) > p:nth-child(2)` | **Silent wrong target**: it finds the _loan amount_ card, not the EMI |
| 4   | `calculateByStaleText`      | `role=button[name="Compute EMI"]`                       | Not found: the button copy changed to "Calculate EMI"                 |
| 5   | `chartCanvasByLibraryClass` | `canvas.chartjs-render-monitor`                         | Not found: the class only existed in Chart.js 2.x                     |

Number 3 is the most dangerous kind. It doesn't time out; it reads `₹25,00,000.00` where an EMI of
`₹33,037.68` was expected. Only a value assertion against the independent oracle catches it.
Locator #5 is the kind of selector an AI assistant suggests from outdated training data, so it's
also an example of why AI output has to be validated.

## Per-locator analysis

Each entry answers the questions the exercise asks: why the locator is brittle, how the failure
is detected, what context goes to the AI, the candidate fix, and how the candidate is validated.
The prompt template and the safety checks are shared by all five and are described once,
further down.

### 1. `#loanAmount`

- **Why brittle:** ids are implementation details. The input's id became `principal-input`, and
  nothing in the UI changed for the user.
- **Detection:** `locator.fill()` times out. A probe gives `count() === 0`, so the mode is `not-found`.
- **Context sent:** the intent ("the _Loan amount (₹)_ text input in the loan details form"), the
  expected role `textbox`, the aria snapshot, and every visible textbox with its label, test id and container.
- **Candidate:** `page.getByTestId('loan-amount-input')`. Alternatives that also passed:
  `getByRole('textbox', { name: 'Loan amount (₹)' })` and `getByLabel('Loan amount (₹)')`.
- **Validation:** unique, visible, editable, role textbox, matches intent (0.50), still unique at
  390 px. It beats the next _different_ element (the tenure input, 0.33) by more than the margin.

### 2. `/html/body/div[1]/main/div[2]/form/button[1]`

- **Why brittle:** absolute XPath encodes the whole ancestry. Adding the `app-shell` wrapper and
  the sidebar broke it, even though the button itself never changed.
- **Detection:** `click()` times out. `count() === 0`, so `not-found`.
- **Context sent:** intent ("the _Calculate EMI_ submit button"), expected role `button`, the aria
  snapshot and the visible buttons.
- **Candidate:** `page.getByTestId('calculate-button')`; `getByRole('button', { name: 'Calculate EMI' })` also passed.
- **Validation:** unique, visible, role button, actionable (`click({ trial: true })` runs
  Playwright's actionability checks without clicking), and still unique at 390 px.

### 3. `.summary-grid > article:nth-child(2) > p:nth-child(2)`

- **Why brittle:** it's positional. It was written when the EMI was the second card. After the
  cards were reordered it still matches one element, so the failure is silent.
- **Detection:** the scenario fails on the _value_ assertion, not on the locator. The POC
  detects it without running the test. The element it finds describes itself as "Loan amount"
  (`data-testid="principal-amount"`), which scores 0.33 against the intent, while another element
  scores 0.83. A gap of 0.2 or more means `wrong-target`.
- **Context sent:** intent ("the monthly EMI value in the loan summary cards"), the description
  of the element that _was_ matched, and the other labelled values in the summary.
- **Candidate:** `page.getByTestId('emi-value')`.
- **Validation:** unique, visible, matches intent (0.83), unique at 390 px. Then the affected
  scenario must show the EMI matching the oracle, `₹33,037.68`.

### 4. `role=button[name="Compute EMI"]`

- **Why brittle:** the locator is a good _kind_ (role plus name), but copy changes. That's
  acceptable when the copy is part of the requirement, and it isn't here.
- **Detection:** `count() === 0`, so `not-found`.
- **Candidate:** `page.getByTestId('calculate-button')`. A role locator with the new name also
  passed. Choosing between them is a policy decision: test ids survive copy changes, while role
  plus name also checks the accessible name. This framework prefers test ids for controls.

### 5. `canvas.chartjs-render-monitor`

- **Why brittle:** it depends on a class a third-party library injected in an old major version.
- **Detection:** `toBeVisible()` fails with "element(s) not found", so `not-found`.
- **Context sent:** intent ("the canvas of the _Principal vs interest_ doughnut chart"), expected
  role `img`, and both chart canvases with their container test ids and headings.
- **POC outcome: escalated to human review.** Both canvases (doughnut and bar) mention
  "principal", "interest" and "chart", so word overlap scores them equally (0.64 vs 0.64). The
  safety gate refuses to choose between two _different_ elements with close scores. This is
  where the AI step earns its place: a model can tell that "doughnut" identifies the first chart.
  The right fix, used by `ChartComponent`, is
  `page.getByTestId('principal-interest-chart').getByRole('img')`.
- **A trap the POC caught in itself:** the first version recommended
  `getByRole('img', { name: 'Principal 63.06%, Interest 36.94%' })`. That name contains the chart's
  _data_ and changes with every loan. The **stable name** check now rejects names containing numbers.

## Detection

1. **At runtime** (in the suite): a Playwright `TimeoutError` / "element(s) not found" from a
   locator action, or an assertion failure on a value. Cucumber's HTML/JUnit report records the
   step, the selector and a screenshot (`reports/screenshots/FAILED-*.png`).
2. **Probe** (in the POC): open the route and count matches for the selector.
   - `0` gives **not-found**; more than `1` gives **ambiguous**.
   - `1` is compared against the intent: if the element has the wrong role, or another element
     describes the intent at least 0.2 better, the mode is **wrong-target**.
3. Only locators that carry an **intent** (a sentence describing what they're meant to find) can be
   healed. That intent is the most important input: without it, "heal" just means "find something
   that exists", which is how silent failures like #3 happen.

## What is sent to the AI

The exact prompts the POC built in the last run are committed in
[`reports/self-healing/prompts/`](../reports/self-healing/prompts/). Each contains:

- the broken selector, its intent, the expected role and the observed failure mode;
- the page's **aria snapshot** (`locator('body').ariaSnapshot()`), which gives roles, names and
  structure without CSS noise;
- an **inventory of candidate elements** filtered to the expected role: tag, role, accessible
  name, label, `data-testid`, id, and the closest identified container with its accessible name;
- **rules**: at most 3 candidates; only test id, role + exact name, label, or container-scoped
  role; never CSS classes, positional selectors or XPath; only use names and ids that appear in
  the data (this guards against hallucinated selectors); return nothing if nothing fits.

The response is constrained with structured output (a Zod schema, via
`client.beta.messages.parse`), so the model returns data rather than code. The test suite never
`eval`s model output: candidates are rebuilt from those fields with Playwright's typed API in
`toLocator()`.

### Prompt template (abridged)

```text
You are repairing a broken Playwright locator in an end-to-end test suite.

## Broken locator
- Selector: .summary-grid > article:nth-child(2) > p:nth-child(2)
- What it is meant to find: The monthly EMI value in the loan summary cards
- Expected element role: text
- Observed failure: wrong-target: Selector matched 1 element ("Loan amount", data-testid="principal-amount") ...

## Rules
- Propose at most 3 replacement locators, best first.
- Allowed strategies: "testid", "role" (exact accessible name), "label", "scoped-role".
- Never propose CSS classes, nth-child/positional selectors or XPath.
- Use only test ids, roles, names and labels that appear in the page data below.
- If nothing on the page matches the intent, return an empty list.

## Accessibility snapshot of the page
...
## Candidate elements
...
```

## Validation before a fix is applied

AI candidates and heuristic candidates go through the same gates. An AI suggestion is never
trusted more than one derived mechanically from the DOM.

| Gate             | Check                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| Stable name      | Role/label names must not contain data-dependent text (numbers)                                              |
| Unique           | Resolves to exactly one element (`count() === 1`)                                                            |
| Visible          | `isVisible()`                                                                                                |
| Role             | Matches the expected role from the intent                                                                    |
| Intent           | Describes at least 30% of the intent's words                                                                 |
| Actionable       | Buttons: `click({ trial: true })`. Inputs: `isEditable()`                                                    |
| Layout-resilient | Still resolves to exactly one element at 390 px wide (the responsive layout reflows the page)                |
| Unambiguous      | The winner must beat the best candidate for a _different_ element by at least 0.1, otherwise a human decides |

Ranking: accepted candidates first, then by semantic score × strategy weight
(test id 1.0 > role 0.9 > label 0.85 > scoped role 0.8). The weights follow the assessment's
guidance to prefer role/label/text or test-id locators.

### Safety: what the POC deliberately does not do

- **It never edits source files.** It writes a report with a suggested diff
  ([`reports/self-healing/healing-report.md`](../reports/self-healing/healing-report.md)).
- A recommendation becomes a fix only through this pipeline:

```text
test fails → capture failure + DOM context → generate candidates (heuristic ± AI)
→ validate (gates above) → rank → safety gate (margin / human review)
→ human applies the patch in a PR → run the affected scenario
→ run the full regression suite → code review → merge
```

- It never auto-heals at runtime to make a test pass. Doing so would hide real regressions,
  such as a button that was genuinely removed. A healed locator that passes while the feature is
  broken is worse than a red test.
- It refuses candidates built from data-dependent names, and it escalates ties instead of guessing.
- Healing events should be reported and reviewed. Repeated healing of the same area is a signal
  to add a `data-testid` or fix the page object, not to keep healing.

## Running the POC

```bash
npm run dev                      # the app must be running at BASE_URL
npm run heal                     # deterministic candidates only: no network, no cost
npm run heal -- --id emiByPosition
npm run heal -- --ai             # adds Claude candidates (needs Anthropic credentials; costs money)
```

The `--ai` path uses `@anthropic-ai/sdk` with `claude-opus-5-5` (override with `HEAL_MODEL`) and
structured output. The server-side refusal fallback is enabled (`fallbacks: 'default'`), and a
refusal or unparseable reply just means "no AI candidates".

**Honest status:** the deterministic path was executed for all five locators, and its output is
committed. The `--ai` path type-checks against the installed SDK but **has not been executed**,
because no API credentials were used for this submission. Its value is shown by locator #5, where the
heuristics correctly stop and ask for help.
