@api @assessment-expectation
Feature: JSONPlaceholder POST /posts — validation as specified by the assessment
  These scenarios encode the assessment's expected outcome literally: invalid input is
  rejected with a 4xx status and an error message, and nothing fails server-side.
  JSONPlaceholder does not implement validation, so these scenarios FAIL against it.
  That failure is the finding, not a test bug. They are excluded from `npm test` and
  run on their own with `npm run test:api:assessment-expectations`; the failing report
  is committed under reports/ as evidence.

  Scenario Outline: A post with <payload> is rejected with a client error
    When I create a post with "<payload>"
    Then the response is not a server error
    And the response status is a 4xx client error
    And the response explains the validation problem

    Examples:
      | payload                                     |
      | an excessively long title                   |
      | unsupported special characters in the title |
      | no userId                                   |

  Scenario: A malformed JSON body is rejected with a client error
    When I send a malformed JSON body
    Then the response is not a server error
    And the response status is a 4xx client error
