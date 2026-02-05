-- Migration: Add image_url column to play_slots table
-- Run: mysql -u your_user -p chibibadminton_db < migration_play_slots_image_url.sql
-- For existing databases that don't have image_url yet.
-- Compatible with MySQL 5.7+ (does not rely on ADD COLUMN IF NOT EXISTS from MySQL 8.0.12+).

USE chibibadminton_db;

DROP PROCEDURE IF EXISTS add_play_slots_image_url;
DELIMITER //
CREATE PROCEDURE add_play_slots_image_url()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'play_slots'
      AND COLUMN_NAME = 'image_url'
  ) THEN
    ALTER TABLE play_slots ADD COLUMN image_url VARCHAR(500) NULL AFTER max_capacity;
  END IF;
END //
DELIMITER ;
CALL add_play_slots_image_url();
DROP PROCEDURE add_play_slots_image_url;
