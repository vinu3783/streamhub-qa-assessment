@ui
Feature: Amortization report
  The report is driven by the loan entered by the user and by the report filters.

  Scenario: Navigating from the dashboard opens the report for the same loan
    Given I open the loan dashboard
    When I calculate a loan of "3200000" at "8.6"% for "20" years
    And I navigate to "Amortization report"
    Then the page heading is "Amortization report"
    And the displayed monthly EMI matches the independently calculated EMI
    And the displayed loan amount, total interest and total payment match the independent calculation

  Scenario: Full yearly schedule reconciles with the loan
    Given I open the amortization report for a loan of "2500000" at "10"% for "10" years
    Then the schedule shows 10 rows from "Year 1" to "Year 10"
    And the report totals for the selected years match the independent calculation
    And the final closing balance is zero

  Scenario: Filtering by year range and switching to monthly rows
    Given I open the amortization report for a loan of "2500000" at "10"% for "10" years
    When I filter the report to years 3 to 5
    And I group the report by "Monthly"
    Then the schedule shows 36 rows from "Month 25" to "Month 60"
    And the report totals for the selected years match the independent calculation

  Scenario: Recalculating on the report updates the schedule and resets filters
    Given I open the amortization report for a loan of "2500000" at "10"% for "10" years
    And I filter the report to years 2 to 4
    When I calculate a loan of "1000000" at "9"% for "5" years
    Then the schedule shows 5 rows from "Year 1" to "Year 5"
    And the report totals for the selected years match the independent calculation

  Scenario: Outstanding balance chart plots every selected period
    Given I open the amortization report for a loan of "5000000" at "7.5"% for "15" years
    When I filter the report to years 6 to 10
    Then the "outstanding balance" chart is visible
    And the "outstanding balance" chart canvas has been drawn
    And the "outstanding balance" chart plots 5 periods with a positive balance in each
