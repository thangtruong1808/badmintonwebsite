-- 1) Remove auto‑generated social play events (regular + recurring)
DELETE FROM events
WHERE category = 'regular'
  AND recurring = TRUE;

-- 2) Reset AUTO_INCREMENT back to 1
ALTER TABLE events AUTO_INCREMENT = 1;