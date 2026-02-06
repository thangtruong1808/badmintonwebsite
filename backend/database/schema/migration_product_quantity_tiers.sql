-- Migration: Add product_quantity_tiers table for quantity-based pricing
-- Run: mysql -u your_user -p chibibadminton_db < migration_product_quantity_tiers.sql

USE chibibadminton_db;

CREATE TABLE IF NOT EXISTS product_quantity_tiers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY uk_product_quantity (product_id, quantity),
    CHECK (quantity > 0),
    CHECK (unit_price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_product_quantity_tiers_product_id ON product_quantity_tiers(product_id);

-- Seed quantity tiers for products 1, 2, 3 (run only if products exist)
INSERT INTO product_quantity_tiers (product_id, quantity, unit_price, display_order) VALUES
(1, 1, 42.00, 0), (1, 3, 41.00, 1), (1, 5, 40.00, 2),
(2, 1, 52.00, 0), (2, 5, 51.00, 1), (2, 10, 50.00, 2),
(3, 1, 55.00, 0), (3, 5, 54.00, 1), (3, 10, 53.00, 2)
ON DUPLICATE KEY UPDATE unit_price = VALUES(unit_price), display_order = VALUES(display_order);
