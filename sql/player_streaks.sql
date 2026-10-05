-- Scenario 2: players who scored 30+ runs in at least 3 consecutive matches in the 2024
-- season, with the date each streak began.
--
-- Gaps-and-islands with window functions:
--  1. Number each player's 2024 innings chronologically (appearance_no).
--  2. Keep only 30+ innings and number those again. Within an unbroken run of 30+
--     innings both numbers rise together, so their difference (streak_key) is constant;
--     any sub-30 innings in between changes it.
--  3. Group by (player, streak_key) and keep groups of 3 or more.
--
-- Decisions (see docs/SQL.md):
--  * "Consecutive matches" means consecutive innings of that player. A team match the
--    player did not bat in neither extends nor breaks the streak.
--  * The season filter is applied before numbering, so a 2023 streak cannot run into 2024.
--  * A player with two separate streaks is reported once per streak.
--  * Ties on date are broken by match_id so the order is deterministic.
WITH season_innings AS (
  SELECT
    p.player_id,
    p.player_name,
    m.match_id,
    m.match_date,
    b.runs,
    ROW_NUMBER() OVER (PARTITION BY p.player_id ORDER BY m.match_date, m.match_id) AS appearance_no
  FROM batting_scores AS b
  JOIN matches AS m ON m.match_id = b.match_id
  JOIN players AS p ON p.player_id = b.player_id
  WHERE m.season = 2024
),
qualifying_innings AS (
  SELECT
    player_id,
    player_name,
    match_date,
    appearance_no
      - ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY match_date, match_id) AS streak_key
  FROM season_innings
  WHERE runs >= 30
)
SELECT
  player_name,
  MIN(match_date) AS streak_start_date,
  MAX(match_date) AS streak_end_date,
  COUNT(*)        AS matches_in_streak
FROM qualifying_innings
GROUP BY player_id, player_name, streak_key
HAVING COUNT(*) >= 3
ORDER BY streak_start_date, player_name;
