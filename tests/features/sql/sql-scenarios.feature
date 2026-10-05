@sql
Feature: SQL scenarios (assessment A4)
  The queries in sql/ run against an in-memory SQLite database built from sql/schema.sql and
  sql/seed.sql. The seed data is designed around edge cases, so the expected rows below
  were derived by hand from the annotated seed, not copied from query output.

  Scenario: Round-trip transfers within 10% and 24 hours are found, and nothing else
    When I run the "roundTripTransactions" query
    Then the query returns exactly these rows:
      | outbound_txn_id | account_a | account_b | return_txn_id |
      | 1               | 101       | 102       | 2             |
      | 3               | 103       | 104       | 4             |
      | 7               | 107       | 108       | 8             |
      | 9               | 109       | 110       | 10            |
      | 17              | 108       | 109       | 18            |
      | 17              | 108       | 109       | 20            |
      | 23              | 112       | 106       | 24            |
      | 25              | 103       | 105       | 26            |
      | 27              | 104       | 106       | 28            |
    And every returned row is a reversal within 10% of the amount sent and at most 24 hours later

  Scenario: Players with 30+ runs in at least 3 consecutive 2024 innings
    When I run the "playerStreaks" query
    Then the query returns exactly these rows:
      | player_name  | streak_start_date | matches_in_streak |
      | Arjun Mehta  | 2024-03-22        | 3                 |
      | Nikhil Joshi | 2024-03-22        | 3                 |
      | Sameer Khan  | 2024-03-24        | 3                 |
      | Rohan Iyer   | 2024-03-27        | 4                 |
      | Kabir Sandhu | 2024-04-03        | 3                 |
      | Sameer Khan  | 2024-04-09        | 3                 |
    And the result does not include "Dev Malhotra", "Aditya Bose" or "Vikram Rao"
