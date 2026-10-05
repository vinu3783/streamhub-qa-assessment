-- Schema for assessment A4 (SQLite 3.25+; window functions required).
-- Timestamps are stored as ISO-8601 text 'YYYY-MM-DD HH:MM:SS' (UTC), which sorts chronologically.

DROP TABLE IF EXISTS batting_scores;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS accounts;

-- ---------------------------------------------------------------------------
-- Scenario 1: account-to-account transfers
-- ---------------------------------------------------------------------------
CREATE TABLE accounts (
  account_id  INTEGER PRIMARY KEY,
  holder_name TEXT    NOT NULL
);

CREATE TABLE transactions (
  id                  INTEGER PRIMARY KEY,
  sender_account_id   INTEGER        NOT NULL REFERENCES accounts (account_id),
  receiver_account_id INTEGER        NOT NULL REFERENCES accounts (account_id),
  amount              NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  transaction_time    TEXT           NOT NULL,
  CHECK (sender_account_id <> receiver_account_id)
);

-- Supports the self-join: look up transfers from B to A in a time range.
CREATE INDEX idx_transactions_route_time
  ON transactions (sender_account_id, receiver_account_id, transaction_time);

-- ---------------------------------------------------------------------------
-- Scenario 2: IPL-style batting performances
-- ---------------------------------------------------------------------------
CREATE TABLE teams (
  team_id    INTEGER PRIMARY KEY,
  short_name TEXT NOT NULL UNIQUE,
  team_name  TEXT NOT NULL
);

CREATE TABLE players (
  player_id   INTEGER PRIMARY KEY,
  player_name TEXT    NOT NULL,
  team_id     INTEGER NOT NULL REFERENCES teams (team_id)
);

CREATE TABLE matches (
  match_id     INTEGER PRIMARY KEY,
  season       INTEGER NOT NULL,
  match_date   TEXT    NOT NULL,
  home_team_id INTEGER NOT NULL REFERENCES teams (team_id),
  away_team_id INTEGER NOT NULL REFERENCES teams (team_id),
  venue        TEXT    NOT NULL,
  CHECK (home_team_id <> away_team_id)
);

-- One row per player innings: a row exists only when the player batted in that match.
CREATE TABLE batting_scores (
  match_id  INTEGER NOT NULL REFERENCES matches (match_id),
  player_id INTEGER NOT NULL REFERENCES players (player_id),
  runs      INTEGER NOT NULL CHECK (runs >= 0),
  PRIMARY KEY (match_id, player_id)
);
