You are repairing a broken Playwright locator in an end-to-end test suite.

## Broken locator
- Selector: .summary-grid > article:nth-child(2) > p:nth-child(2)
- What it is meant to find: The monthly EMI value in the loan summary cards
- Expected element role: text
- Observed failure: wrong-target: Selector matched 1 element ("Loan amount", data-testid="principal-amount") whose description scores 0.33 against the intent while another element scores 0.83.

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
  "tag": "section",
  "role": null,
  "name": "Loan summary",
  "label": null,
  "testId": "loan-summary",
  "id": null,
  "text": "MONTHLY EMI ₹33,037.68 120 monthly payments LOAN AMOUNT ₹25,00,000.00 10% p.a. f",
  "ancestorTestId": null,
  "ancestorName": null,
  "visible": true
 },
 {
  "tag": "p",
  "role": null,
  "name": "Monthly EMI",
  "label": null,
  "testId": "emi-value",
  "id": null,
  "text": "₹33,037.68",
  "ancestorTestId": "loan-summary",
  "ancestorName": "Loan summary",
  "visible": true
 },
 {
  "tag": "p",
  "role": null,
  "name": "Loan amount",
  "label": null,
  "testId": "principal-amount",
  "id": null,
  "text": "₹25,00,000.00",
  "ancestorTestId": "loan-summary",
  "ancestorName": "Loan summary",
  "visible": true
 },
 {
  "tag": "p",
  "role": null,
  "name": "Total interest",
  "label": null,
  "testId": "total-interest",
  "id": null,
  "text": "₹14,64,522.11",
  "ancestorTestId": "loan-summary",
  "ancestorName": "Loan summary",
  "visible": true
 },
 {
  "tag": "p",
  "role": null,
  "name": "Total payment",
  "label": null,
  "testId": "total-payment",
  "id": null,
  "text": "₹39,64,522.11",
  "ancestorTestId": "loan-summary",
  "ancestorName": "Loan summary",
  "visible": true
 },
 {
  "tag": "p",
  "role": null,
  "name": "Interest-to-principal",
  "label": null,
  "testId": "interest-ratio",
  "id": null,
  "text": "58.58%",
  "ancestorTestId": "loan-summary",
  "ancestorName": "Loan summary",
  "visible": true
 },
 {
  "tag": "figure",
  "role": null,
  "name": "Principal vs interest",
  "label": null,
  "testId": "principal-interest-chart",
  "id": null,
  "text": "Principal vs interest Breakdown of the total payment of ₹39,64,522.11. Principal",
  "ancestorTestId": null,
  "ancestorName": null,
  "visible": true
 },
 {
  "tag": "ul",
  "role": null,
  "name": "Principal vs interest legend",
  "label": null,
  "testId": "principal-interest-chart-legend",
  "id": null,
  "text": "Principal ₹25,00,000.00 Interest ₹14,64,522.11",
  "ancestorTestId": "principal-interest-chart",
  "ancestorName": "Principal vs interest",
  "visible": true
 },
 {
  "tag": "span",
  "role": null,
  "name": "",
  "label": null,
  "testId": "principal-interest-chart-legend-value",
  "id": null,
  "text": "₹25,00,000.00",
  "ancestorTestId": "principal-interest-chart-legend",
  "ancestorName": "Principal vs interest legend",
  "visible": true
 },
 {
  "tag": "span",
  "role": null,
  "name": "",
  "label": null,
  "testId": "principal-interest-chart-legend-value",
  "id": null,
  "text": "₹14,64,522.11",
  "ancestorTestId": "principal-interest-chart-legend",
  "ancestorName": "Principal vs interest legend",
  "visible": true
 },
 {
  "tag": "table",
  "role": null,
  "name": "",
  "label": null,
  "testId": "principal-interest-chart-data",
  "id": null,
  "text": "",
  "ancestorTestId": "principal-interest-chart",
  "ancestorName": "Principal vs interest",
  "visible": true
 },
 {
  "tag": "figure",
  "role": null,
  "name": "Year-wise payment distribution",
  "label": null,
  "testId": "yearly-payment-chart",
  "id": null,
  "text": "Year-wise payment distribution Principal and interest paid in each of the 10 loa",
  "ancestorTestId": null,
  "ancestorName": null,
  "visible": true
 },
 {
  "tag": "ul",
  "role": null,
  "name": "Year-wise payment distribution legend",
  "label": null,
  "testId": "yearly-payment-chart-legend",
  "id": null,
  "text": "Principal ₹25,00,000.00 Interest ₹14,64,522.11",
  "ancestorTestId": "yearly-payment-chart",
  "ancestorName": "Year-wise payment distribution",
  "visible": true
 },
 {
  "tag": "span",
  "role": null,
  "name": "",
  "label": null,
  "testId": "yearly-payment-chart-legend-value",
  "id": null,
  "text": "₹25,00,000.00",
  "ancestorTestId": "yearly-payment-chart-legend",
  "ancestorName": "Year-wise payment distribution legend",
  "visible": true
 },
 {
  "tag": "span",
  "role": null,
  "name": "",
  "label": null,
  "testId": "yearly-payment-chart-legend-value",
  "id": null,
  "text": "₹14,64,522.11",
  "ancestorTestId": "yearly-payment-chart-legend",
  "ancestorName": "Year-wise payment distribution legend",
  "visible": true
 },
 {
  "tag": "table",
  "role": null,
  "name": "",
  "label": null,
  "testId": "yearly-payment-chart-data",
  "id": null,
  "text": "",
  "ancestorTestId": "yearly-payment-chart",
  "ancestorName": "Year-wise payment distribution",
  "visible": true
 }
]