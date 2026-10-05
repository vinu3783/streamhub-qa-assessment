You are repairing a broken Playwright locator in an end-to-end test suite.

## Broken locator
- Selector: #loanAmount
- What it is meant to find: The "Loan amount (₹)" text input in the loan details form
- Expected element role: textbox
- Observed failure: not-found: Selector matched 0 elements.

## Rules
- Propose at most 3 replacement locators, best first.
- Allowed strategies, in order of preference: "testid" (getByTestId), "role" (getByRole with an
  exact accessible name), "label" (getByLabel), "scoped-role" (getByTestId(container).getByRole).
- Never propose CSS classes, nth-child/positional selectors or XPath.
- Use only test ids, roles, names and labels that appear in the page data below. Do not invent any.
- If nothing on the page matches the intent, return an empty list.

## Accessibility snapshot of the page
- banner:
  - text: Loan Analytics
  - navigation "Main":
    - list:
      - listitem:
        - link "Dashboard":
          - /url: /
      - listitem:
        - link "Amortization report":
          - /url: /report
- main:
  - complementary:
    - form "Loan details":
      - heading "Loan details" [level=2]
      - text: Loan amount (₹)
      - textbox "Loan amount (₹)": "2500000"
      - paragraph: Up to ₹10,00,00,000.
      - text: Interest rate (% p.a.)
      - textbox "Interest rate (% p.a.)": "10"
      - paragraph: 0% to 50%.
      - text: Loan tenure
      - textbox "Loan tenure": "10"
      - combobox "Tenure unit":
        - option "Years" [selected]
        - option "Months"
      - paragraph: 1–40 years or 1–480 months.
      - button "Calculate EMI"
  - heading "Loan dashboard" [level=1]
  - paragraph: EMI, total cost of borrowing and how repayments split over time.
  - region "Loan summary":
    - article:
      - heading "Monthly EMI" [level=3]
      - paragraph: ₹33,037.68
      - paragraph: 120 monthly payments
    - article:
      - heading "Loan amount" [level=3]
      - paragraph: ₹25,00,000.00
      - paragraph: 10% p.a. for 10 years
    - article:
      - heading "Total interest" [level=3]
      - paragraph: ₹14,64,522.11
      - paragraph: Cost of borrowing
    - article:
      - heading "Total payment" [level=3]
      - paragraph: ₹39,64,522.11
      - paragraph: Principal + interest
    - article:
      - heading "Interest-to-principal" [level=3]
      - paragraph: 58.58%
      - paragraph: Interest as a share of principal
  - figure "Principal vs interest":
    - heading "Principal vs interest" [level=2]
    - paragraph: Breakdown of the total payment of ₹39,64,522.11.
    - list "Principal vs interest legend":
      - listitem: Principal ₹25,00,000.00
      - listitem: Interest ₹14,64,522.11
    - img "Principal 63.06%, Interest 36.94%"
    - group: Show data table
  - figure "Year-wise payment distribution":
    - heading "Year-wise payment distribution" [level=2]
    - paragraph: Principal and interest paid in each of the 10 loan years.
    - list "Year-wise payment distribution legend":
      - listitem: Principal ₹25,00,000.00
      - listitem: Interest ₹14,64,522.11
    - img "Stacked bar chart of principal and interest paid across 10 years"
    - group: Show data table

## Candidate elements (visible elements with a role, label or data-testid)
[
 {
  "tag": "input",
  "role": "textbox",
  "name": "Loan amount (₹)",
  "label": "Loan amount (₹)",
  "testId": "loan-amount-input",
  "id": "principal-input",
  "text": "",
  "ancestorTestId": null,
  "ancestorName": null,
  "visible": true
 },
 {
  "tag": "input",
  "role": "textbox",
  "name": "Interest rate (% p.a.)",
  "label": "Interest rate (% p.a.)",
  "testId": "interest-rate-input",
  "id": "annualInterestRate-input",
  "text": "",
  "ancestorTestId": null,
  "ancestorName": null,
  "visible": true
 },
 {
  "tag": "input",
  "role": "textbox",
  "name": "Loan tenure",
  "label": "Loan tenure",
  "testId": "loan-tenure-input",
  "id": "tenure-input",
  "text": "",
  "ancestorTestId": null,
  "ancestorName": null,
  "visible": true
 }
]