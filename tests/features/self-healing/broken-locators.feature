@self-healing
Feature: AI self-healing exercise — deliberately broken locators
  These scenarios use the intentionally broken locators in
  tests/pages/legacy/brokenLocators.ts and are EXPECTED TO FAIL. They are left broken on
  purpose for the self-healing exercise (docs/SELF_HEALING_LOCATORS.md) and are excluded
  from `npm test`. Run them with `npm run test:self-healing`; heal them with `npm run heal`.
  The same journeys pass in loan-dashboard.feature using resilient locators.

  Background:
    Given I open the dashboard with the legacy page object

  Scenario: Broken locator 1 — loan amount input by a renamed element id
    When I enter "3000000" as the loan amount using the legacy locator

  Scenario: Broken locator 2 — calculate button by absolute XPath
    When I click calculate using the legacy absolute XPath

  Scenario: Broken locator 3 — EMI value by position (silently matches the wrong card)
    Then the legacy EMI locator shows the EMI for the default loan of 2500000 at 10% for 10 years

  Scenario: Broken locator 4 — calculate button by outdated button text
    When I click calculate using the legacy button text

  Scenario: Broken locator 5 — chart canvas by a class from an older Chart.js version
    Then the legacy chart canvas locator finds a visible chart
