-- Migration: Create pending_waitlist table for pay-before-join waitlist flow
-- When event is full, authenticated users must pay before being added to the waitlist.
-- After payment, confirm-waitlist-payment adds them to event_waitlist and deletes this row.

CREATE TABLE IF NOT EXISTS pending_waitlist (
  id VARCHAR(255) PRIMARY KEY,
  event_id INT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_event_pending (user_id, event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_pending_waitlist_event ON pending_waitlist(event_id);
CREATE INDEX idx_pending_waitlist_expires ON pending_waitlist(expires_at);
