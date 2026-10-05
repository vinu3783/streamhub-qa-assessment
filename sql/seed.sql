-- Synthetic, reproducible seed data for assessment A4.
-- Every transfer case is annotated with the outcome the round-trip query must produce.
-- Player names and scores are fictional; franchise names only give the data an IPL flavour.

-- ===========================================================================
-- Scenario 1: transfers
-- ===========================================================================
INSERT INTO accounts (account_id, holder_name) VALUES
  (101, 'Asha'),
  (102, 'Bharat'),
  (103, 'Chitra'),
  (104, 'Deepak'),
  (105, 'Esha'),
  (106, 'Farhan'),
  (107, 'Gauri'),
  (108, 'Harish'),
  (109, 'Ira'),
  (110, 'Jai'),
  (111, 'Kavya'),
  (112, 'Lokesh');

INSERT INTO transactions (id, sender_account_id, receiver_account_id, amount, transaction_time) VALUES
  -- Case 1: A->B then B->A, 1% lower, 6.5 h later ........................ MATCH
  (1,  101, 102,  50000.00, '2024-03-01 09:00:00'),
  (2,  102, 101,  49500.00, '2024-03-01 15:30:00'),
  -- Case 2: return exactly 10% lower (inclusive boundary) ................ MATCH
  (3,  103, 104,  10000.00, '2024-03-02 10:00:00'),
  (4,  104, 103,   9000.00, '2024-03-02 20:00:00'),
  -- Case 3: return 10.1% lower ........................................... no match
  (5,  105, 106,  10000.00, '2024-03-03 08:00:00'),
  (6,  106, 105,   8990.00, '2024-03-03 09:00:00'),
  -- Case 4: return 7.5% higher, 23 h 59 min later ........................ MATCH
  (7,  107, 108,  20000.00, '2024-03-04 12:00:00'),
  (8,  108, 107,  21500.00, '2024-03-05 11:59:00'),
  -- Case 5: return exactly 24 h later (inclusive boundary) ............... MATCH
  (9,  109, 110,  75000.00, '2024-03-06 10:00:00'),
  (10, 110, 109,  72000.00, '2024-03-07 10:00:00'),
  -- Case 6: identical amount but 24 h + 1 s later ........................ no match
  (11, 111, 112,  30000.00, '2024-03-08 10:00:00'),
  (12, 112, 111,  30000.00, '2024-03-09 10:00:01'),
  -- Case 7: same direction twice (A->B, A->B) is not a return ............ no match
  (13, 101, 103,  40000.00, '2024-03-10 09:00:00'),
  (14, 101, 103,  40000.00, '2024-03-10 10:00:00'),
  -- Case 8: onward chain A->B->C is not a return to A .................... no match
  (15, 102, 104,  60000.00, '2024-03-11 09:00:00'),
  (16, 104, 105,  60000.00, '2024-03-11 10:00:00'),
  -- Case 9: one transfer, three candidate returns: 5% (MATCH), 50% (no), 4% after 23 h (MATCH)
  (17, 108, 109, 100000.00, '2024-03-13 09:00:00'),
  (18, 109, 108,  95000.00, '2024-03-13 12:00:00'),
  (19, 109, 108,  50000.00, '2024-03-13 13:00:00'),
  (20, 109, 108, 104000.00, '2024-03-14 08:00:00'),
  -- Case 10: 11% of the amount sent (9.9% of the amount returned); base is the sent amount .. no match
  (21, 110, 111,  10000.00, '2024-03-15 09:00:00'),
  (22, 111, 110,  11100.00, '2024-03-15 11:00:00'),
  -- Case 11: round trip started by the other party; the earlier transfer defines A .. MATCH (A = 112)
  (23, 112, 106,   8000.00, '2024-03-16 09:00:00'),
  (24, 106, 112,   8400.00, '2024-03-16 18:00:00'),
  -- Case 12: identical timestamps; reported once, not once per direction . MATCH (once)
  (25, 103, 105,   2500.00, '2024-03-17 12:00:00'),
  (26, 105, 103,   2500.00, '2024-03-17 12:00:00'),
  -- Case 13: amounts with paise, 9.9996% lower ........................... MATCH
  (27, 104, 106,   1234.56, '2024-03-18 08:15:00'),
  (28, 106, 104,   1111.11, '2024-03-18 22:45:00'),
  -- Noise: unrelated transfers, plus a late repeat of case 1 twenty days later (no match)
  (29, 101, 107,   5000.00, '2024-03-19 10:00:00'),
  (30, 107, 110,   7000.00, '2024-03-20 10:00:00'),
  (31, 102, 101,  49500.00, '2024-03-21 09:00:00');

-- ===========================================================================
-- Scenario 2: 2024 season (plus two 2023 matches)
-- Expected 30+ streaks of 3 or more innings in 2024:
--   Arjun Mehta   45, 32, 30           from 2024-03-22 (30 counts as 30+)
--   Nikhil Joshi  34, 50, -, 42        from 2024-03-22 (missed a match; innings stay consecutive)
--   Rohan Iyer    55, 61, 38, 72       from 2024-03-27 (streak of 4)
--   Kabir Sandhu  35, 40, 50           from 2024-04-03 (an earlier run of 2 does not count)
--   Sameer Khan   33, 41, 37           from 2024-03-24 and again 36, 48, 52 from 2024-04-09
-- Not expected:
--   Dev Malhotra  alternates 29 and 30: never 3 in a row
--   Aditya Bose   only 2 in a row
--   Vikram Rao    40, 50 at the end of 2023 then 35 in 2024: the streak crosses seasons
-- ===========================================================================
INSERT INTO teams (team_id, short_name, team_name) VALUES
  (1, 'CSK', 'Chennai Super Kings'),
  (2, 'MI', 'Mumbai Indians'),
  (3, 'RCB', 'Royal Challengers Bengaluru'),
  (4, 'KKR', 'Kolkata Knight Riders'),
  (5, 'SRH', 'Sunrisers Hyderabad'),
  (6, 'RR', 'Rajasthan Royals');

INSERT INTO players (player_id, player_name, team_id) VALUES
  (1, 'Arjun Mehta', 1),
  (2, 'Nikhil Joshi', 1),
  (3, 'Rohan Iyer', 2),
  (4, 'Aditya Bose', 2),
  (5, 'Kabir Sandhu', 3),
  (6, 'Dev Malhotra', 4),
  (7, 'Sameer Khan', 5),
  (8, 'Vikram Rao', 6);

INSERT INTO matches (match_id, season, match_date, home_team_id, away_team_id, venue) VALUES
  (1, 2024, '2024-03-22', 1, 2, 'Chennai'),
  (2, 2024, '2024-03-23', 3, 4, 'Bengaluru'),
  (3, 2024, '2024-03-24', 5, 6, 'Hyderabad'),
  (4, 2024, '2024-03-26', 3, 1, 'Bengaluru'),
  (5, 2024, '2024-03-27', 5, 2, 'Hyderabad'),
  (6, 2024, '2024-03-28', 6, 4, 'Jaipur'),
  (7, 2024, '2024-03-30', 1, 2, 'Chennai'),
  (8, 2024, '2024-03-31', 3, 4, 'Bengaluru'),
  (9, 2024, '2024-04-01', 5, 6, 'Hyderabad'),
  (10, 2024, '2024-04-03', 3, 1, 'Bengaluru'),
  (11, 2024, '2024-04-04', 5, 2, 'Hyderabad'),
  (12, 2024, '2024-04-05', 6, 4, 'Jaipur'),
  (13, 2024, '2024-04-07', 1, 2, 'Chennai'),
  (14, 2024, '2024-04-08', 3, 4, 'Bengaluru'),
  (15, 2024, '2024-04-09', 5, 6, 'Hyderabad'),
  (16, 2024, '2024-04-11', 3, 1, 'Bengaluru'),
  (17, 2024, '2024-04-12', 5, 2, 'Hyderabad'),
  (18, 2024, '2024-04-13', 6, 4, 'Jaipur'),
  (19, 2024, '2024-04-15', 1, 2, 'Chennai'),
  (20, 2024, '2024-04-16', 3, 4, 'Bengaluru'),
  (21, 2024, '2024-04-17', 5, 6, 'Hyderabad'),
  (22, 2024, '2024-04-19', 3, 1, 'Bengaluru'),
  (23, 2024, '2024-04-20', 5, 2, 'Hyderabad'),
  (24, 2024, '2024-04-21', 6, 4, 'Jaipur'),
  (25, 2023, '2023-05-20', 6, 1, 'Jaipur'),
  (26, 2023, '2023-05-25', 2, 6, 'Mumbai');

INSERT INTO batting_scores (match_id, player_id, runs) VALUES
  (1, 1, 45),
  (1, 2, 34),
  (1, 3, 10),
  (1, 4, 0),
  (2, 5, 31),
  (2, 6, 29),
  (3, 7, 33),
  (3, 8, 35),
  (4, 1, 32),
  (4, 2, 50),
  (4, 5, 44),
  (5, 3, 55),
  (5, 4, 88),
  (5, 7, 41),
  (6, 6, 30),
  (6, 8, 12),
  (7, 1, 30),
  (7, 3, 61),
  (7, 4, 12),
  (8, 5, 2),
  (8, 6, 30),
  (9, 7, 37),
  (9, 8, 44),
  (10, 1, 12),
  (10, 2, 42),
  (10, 5, 35),
  (11, 3, 38),
  (11, 7, 9),
  (12, 6, 29),
  (12, 8, 18),
  (13, 1, 8),
  (13, 2, 5),
  (13, 3, 72),
  (14, 5, 40),
  (14, 6, 30),
  (15, 7, 36),
  (15, 8, 30),
  (16, 1, 20),
  (16, 2, 11),
  (16, 5, 50),
  (17, 3, 5),
  (17, 4, 30),
  (17, 7, 48),
  (18, 6, 30),
  (18, 8, 30),
  (19, 1, 15),
  (19, 3, 22),
  (19, 4, 31),
  (20, 5, 0),
  (20, 6, 29),
  (21, 7, 52),
  (22, 1, 7),
  (22, 2, 3),
  (22, 5, 19),
  (23, 3, 14),
  (23, 7, 15),
  (24, 6, 30),
  (24, 8, 3),
  (25, 8, 40),
  (26, 8, 50);
