-- Migration: Create event_waitlist table for waiting list feature
-- Run after schema.sql. event_waitlist stores users waiting for spots (new or add-guests).
-- registration_id NULL = new spot when session full; registration_id SET = adding guests to existing registration.

CREATE TABLE IF NOT EXISTS event_waitlist (
  id VARCHAR(255) PRIMARY KEY,
  event_id INT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  position INT NOT NULL,
  registration_id VARCHAR(255) NULL,
  guest_count INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_event (user_id, event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_event_waitlist_event ON event_waitlist(event_id);
CREATE INDEX idx_event_waitlist_created ON event_waitlist(event_id, created_at);
