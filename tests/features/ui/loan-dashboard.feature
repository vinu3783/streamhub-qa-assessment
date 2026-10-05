@ui
Feature: Loan dashboard
  As a borrower
  I want to see my EMI, total cost and repayment split
  So that I understand what a loan will cost me

  Background:
    Given I open the loan dashboard

  @smoke
  Scenario: Dashboard loads with the calculator, summary and charts
    Then the page heading is "Loan dashboard"
    And the loan calculator form is displayed
    And the loan summary shows the monthly EMI, loan amount, total interest, total payment and interest ratio
    And the "principal vs interest" chart is visible
    And the "yearly payment" chart is visible

  Scenario Outline: EMI for ₹<amount> at <rate>% over <tenure> <unit> matches the independent calculation
    When I calculate a loan of "<amount>" at "<rate>"% for "<tenure>" <unit>
    Then the displayed monthly EMI matches the independently calculated EMI
    And the displayed loan amount, total interest and total payment match the independent calculation
    And the displayed interest-to-principal ratio matches the independent calculation

    Examples: Assessment-style home loans
      | amount  | rate | tenure | unit  |
      | 2500000 | 10   | 10     | years |
      | 5000000 | 7.5  | 15     | years |

    Examples: Edge cases
      | amount    | rate | tenure | unit   |
      | 150000.50 | 8.25 | 18     | months |
      | 120000    | 0    | 12     | months |
      | 100000000 | 50   | 40     | years  |

  Scenario: Principal vs interest chart renders non-zero data that reconciles with the loan
    When I calculate a loan of "2500000" at "10"% for "10" years
    Then the "principal vs interest" chart is visible
    And the "principal vs interest" chart canvas has been drawn
    And the "principal vs interest" chart shows a non-zero "Principal" value equal to the loan amount
    And the "principal vs interest" chart shows a non-zero "Interest" value equal to the expected total interest

  Scenario: Yearly payment chart has one bar per loan year with non-zero, correct values
    When I calculate a loan of "5000000" at "7.5"% for "15" years
    Then the "yearly payment" chart is visible
    And the "yearly payment" chart canvas has been drawn
    And the "yearly payment" chart has 15 yearly bars
    And every yearly bar has a non-zero principal and interest matching the independent schedule
    And the yearly principal amounts add up to the loan amount
