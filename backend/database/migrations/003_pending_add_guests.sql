-- Migration: Create pending_add_guests table for add-guests waitlist promotions
-- Run: mysql -u your_user -p chibibadminton_db < database/migrations/003_pending_add_guests.sql
-- When a spot opens and the first add-guests waitlist user is offered it, we create
-- a pending record. User must pay within 24h; after payment, guests are added and
-- this record is deleted. If expired, the spot is released for re-promotion.

CREATE TABLE IF NOT EXISTS pending_add_guests (
  id VARCHAR(255) PRIMARY KEY,
  event_id INT NOT NULL,
  registration_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  guest_count INT NOT NULL DEFAULT 1,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_pending_add_guests_event ON pending_add_guests(event_id);
CREATE INDEX idx_pending_add_guests_expires ON pending_add_guests(expires_at);
