-- Migration: Add service_options tables for stringing service form options
-- Run: mysql -u your_user -p chibibadminton_db < migration_service_options.sql

USE chibibadminton_db;

-- =====================================================
-- Table: service_strings
-- Stores string types with optional flyer image
-- =====================================================
CREATE TABLE IF NOT EXISTS service_strings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    image_url VARCHAR(500) DEFAULT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CHECK (display_order >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_service_strings_display_order ON service_strings(display_order);

-- =====================================================
-- Table: service_string_colours
-- Stores available colours per string type
-- =====================================================
CREATE TABLE IF NOT EXISTS service_string_colours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    string_id INT NOT NULL,
    colour VARCHAR(50) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (string_id) REFERENCES service_strings(id) ON DELETE CASCADE,
    CHECK (display_order >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_service_string_colours_string_id ON service_string_colours(string_id);

-- =====================================================
-- Table: service_tensions
-- Stores tension options (e.g. 20 lbs, 21 lbs)
-- =====================================================
CREATE TABLE IF NOT EXISTS service_tensions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(20) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CHECK (display_order >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_service_tensions_display_order ON service_tensions(display_order);

-- =====================================================
-- Table: service_stencils
-- Stores stencil options (value, label)
-- =====================================================
CREATE TABLE IF NOT EXISTS service_stencils (
    id INT AUTO_INCREMENT PRIMARY KEY,
    value VARCHAR(100) NOT NULL DEFAULT '',
    label VARCHAR(100) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CHECK (display_order >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_service_stencils_display_order ON service_stencils(display_order);

-- =====================================================
-- Table: service_grips
-- Stores grip options (value, label)
-- =====================================================
CREATE TABLE IF NOT EXISTS service_grips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    value VARCHAR(150) NOT NULL DEFAULT '',
    label VARCHAR(150) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CHECK (display_order >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_service_grips_display_order ON service_grips(display_order);

-- =====================================================
-- Seed data
-- =====================================================

INSERT INTO service_strings (name, image_url, display_order) VALUES
    ('Yonex Exbolt 63', NULL, 1),
    ('Yonex Exbolt 65', NULL, 2),
    ('Yonex Exbolt 68', NULL, 3),
    ('Yonex BG66 Ultimax', NULL, 4),
    ('Yonex BG80', NULL, 5),
    ('Yonex BG80 Power', NULL, 6),
    ('Yonex Aerobite', NULL, 7),
    ('Yonex Aerosonic', NULL, 8),
    ('Yonex Nanogy 98', NULL, 9),
    ('Yonex BG65 Titanium', NULL, 10),
    ('Yonex BG65', NULL, 11),
    ('Other', NULL, 12);

-- Colours for each string (string_id from insert order: 1=Exbolt63, 2=Exbolt65, ... 12=Other)
INSERT INTO service_string_colours (string_id, colour, display_order) VALUES
    (1, 'yellow', 1), (1, 'white', 2), (1, 'red', 3),
    (2, 'Purple', 1), (2, 'Black', 2), (2, 'Blue', 3), (2, 'Green', 4), (2, 'White', 5),
    (3, 'Red', 1), (3, 'Yellow', 2), (3, 'Black', 3),
    (4, 'White', 1), (4, 'Pink', 2), (4, 'Blue', 3),
    (5, 'Blue', 1), (5, 'Black', 2), (5, 'White', 3),
    (6, 'White', 1),
    (7, 'white', 1), (7, 'red', 2),
    (8, 'purple', 1),
    (9, 'yellow', 1),
    (10, 'White', 1), (10, 'red', 2),
    (11, 'White', 1),
    (12, 'Please specify in message', 1);

INSERT INTO service_tensions (label, display_order) VALUES
    ('20 lbs', 1), ('21 lbs', 2), ('22 lbs', 3), ('23 lbs', 4), ('24 lbs', 5),
    ('25 lbs', 6), ('26 lbs', 7), ('27 lbs', 8), ('28 lbs', 9), ('29 lbs', 10),
    ('30 lbs', 11), ('31 lbs', 12), ('32 lbs', 13);

INSERT INTO service_stencils (value, label, display_order) VALUES
    ('', 'None', 1),
    ('Yonex (+$2)', 'Yonex (+$2)', 2),
    ('Victor (+$2)', 'Victor (+$2)', 3),
    ('Li-Ning (+$2)', 'Li-Ning (+$2)', 4),
    ('Lin Dan (+$2)', 'Lin Dan (+$2)', 5);

INSERT INTO service_grips (value, label, display_order) VALUES
    ('', 'None', 1),
    ('Lingmei thin grip (+$3)', 'Lingmei thin grip (+$3)', 2),
    ('Lingmei thick ripple grip (+$3)', 'Lingmei thick ripple grip (+$3)', 3);
