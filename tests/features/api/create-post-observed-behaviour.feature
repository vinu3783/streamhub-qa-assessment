@api
Feature: JSONPlaceholder POST /posts — observed handling of boundary and invalid data
  Assessment A3 expects the API to reject invalid posts with a 4xx status and to never fail
  server-side. JSONPlaceholder is a public mock API: it echoes any JSON body back with
  201 Created and persists nothing. These scenarios pin down what the API *actually* does
  (characterisation tests) and record, for every payload, whether the assessment's
  expectation was met. The strict assessment expectations live in
  create-post-assessment-expectations.feature.

  Scenario: Control — a valid post is created
    When I create a post with "a valid post"
    Then the response status is 201
    And the response is JSON
    And the response echoes every submitted field
    And the response assigns a numeric id

  Scenario Outline: Payload with <payload> is accepted without a server-side failure
    When I create a post with "<payload>"
    Then the response is not a server error
    And the response status is 201
    And the response echoes every submitted field
    And the response does not invent a userId
    And the gap against the assessment's 4xx expectation is recorded

    Examples:
      | payload                                     |
      | an excessively long title                   |
      | unsupported special characters in the title |
      | no userId                                   |
      | no fields at all                            |
      | a non-numeric userId                        |

  @known-defect
  Scenario: Known defect — a malformed JSON body causes a 500 that leaks a stack trace
    When I send a malformed JSON body
    Then the response status is 500
    And the response body exposes a server stack trace
    And the gap against the assessment's 4xx expectation is recorded
