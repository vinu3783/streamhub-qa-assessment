-- Scenario 1: round-trip transfers.
-- Account A sends money to account B, and B sends a similar amount back to A
-- (within 10%) no more than 24 hours later.
--
-- Decisions (see docs/SQL.md):
--  * "Within 10%" is measured against the original (outbound) amount, inclusive:
--    |returned - sent| <= 10% of sent. Written as `* 10 <= amount` to avoid 0.1 float error.
--  * The 24-hour window is inclusive and the return must not precede the outbound transfer.
--    Transfers with identical timestamps are ordered by id, so a pair is reported once,
--    never twice with A and B swapped.
--  * Direction is enforced by matching back.sender = outbound.receiver AND
--    back.receiver = outbound.sender, so A->B is never paired with another A->B.
--  * Every qualifying (outbound, return) pair is reported; one transfer with two
--    qualifying returns produces two rows.
--
-- PostgreSQL equivalent of the time window:
--   back.transaction_time >  outbound.transaction_time
--   AND back.transaction_time <= outbound.transaction_time + INTERVAL '24 hours'
SELECT
  outbound.id                  AS outbound_txn_id,
  outbound.sender_account_id   AS account_a,
  outbound.receiver_account_id AS account_b,
  outbound.amount              AS amount_sent,
  outbound.transaction_time    AS sent_at,
  back.id                      AS return_txn_id,
  back.amount                  AS amount_returned,
  back.transaction_time        AS returned_at,
  ROUND(ABS(back.amount - outbound.amount) * 100.0 / outbound.amount, 2) AS amount_diff_pct,
  ROUND((julianday(back.transaction_time) - julianday(outbound.transaction_time)) * 24, 2) AS hours_apart
FROM transactions AS outbound
JOIN transactions AS back
  ON  back.sender_account_id   = outbound.receiver_account_id
  AND back.receiver_account_id = outbound.sender_account_id
  AND (
        back.transaction_time > outbound.transaction_time
        OR (back.transaction_time = outbound.transaction_time AND back.id > outbound.id)
      )
  AND back.transaction_time <= datetime(outbound.transaction_time, '+24 hours')
  AND ABS(back.amount - outbound.amount) * 10 <= outbound.amount
ORDER BY outbound.transaction_time, back.transaction_time, back.id;
