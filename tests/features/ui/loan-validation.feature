@ui
Feature: Loan calculator input validation
  Invalid input must be rejected with a clear message and must never
  replace the last valid calculation.

  Background:
    Given I open the loan dashboard
    And I note the currently displayed monthly EMI

  Scenario Outline: Rejects <field> "<value>"
    When I set the <field> to "<value>"
    And I submit the loan form
    Then the <field> field shows the error "<message>"
    And the <field> field is marked as invalid
    And the displayed monthly EMI is unchanged

    Examples:
      | field         | value   | message                                                     |
      | loan amount   |         | Loan amount is required.                                    |
      | loan amount   | 0       | Loan amount must be greater than zero.                      |
      | loan amount   | -5000   | Loan amount must be greater than zero.                      |
      | loan amount   | 12abc   | Loan amount must be a number with at most 2 decimal places. |
      | loan amount   | 100.555 | Loan amount must be a number with at most 2 decimal places. |
      | interest rate | -1      | Interest rate cannot be negative.                           |
      | interest rate | 50.01   | Interest rate cannot exceed 50% per annum.                  |
      | loan tenure   | 0       | Loan tenure must be between 1 and 40 years.                 |
      | loan tenure   | 2.5     | Loan tenure must be a whole number of years.                |
      | loan tenure   | 41      | Loan tenure must be between 1 and 40 years.                 |

  Scenario: Tenure limits follow the selected unit
    When I calculate a loan of "500000" at "9"% for "481" months
    Then the loan tenure field shows the error "Loan tenure must be between 1 and 480 months."
    And the displayed monthly EMI is unchanged

  Scenario: Every invalid field is reported at once
    When I set the loan amount to ""
    And I set the interest rate to "-2"
    And I set the loan tenure to "0"
    And I submit the loan form
    Then 3 validation errors are displayed

  Scenario: Correcting the input clears the error and recalculates
    When I set the loan amount to "0"
    And I submit the loan form
    Then the loan amount field shows the error "Loan amount must be greater than zero."
    When I calculate a loan of "750000" at "11"% for "5" years
    Then no validation errors are displayed
    And the displayed monthly EMI matches the independently calculated EMI
