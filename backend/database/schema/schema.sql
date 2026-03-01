-- =====================================================
-- ChibiBadminton Database Schema
-- MySQL Database Schema with Indexes for Performance
-- =====================================================
-- Prerequisite: Database chibibadminton_db must already exist.
-- Run: mysql -u your_user -p chibibadminton_db < schema.sql
-- =====================================================

USE chibibadminton_db;

-- =====================================================
-- Table: users
-- Stores user account information
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin', 'super_admin') NOT NULL DEFAULT 'user',
    default_payment_method ENUM('stripe', 'points', 'mixed') DEFAULT NULL,
    reward_points INT NOT NULL DEFAULT 0,
    total_points_earned INT NOT NULL DEFAULT 0,
    total_points_spent INT NOT NULL DEFAULT 0,
    member_since DATE NOT NULL,
    avatar VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (reward_points >= 0),
    CHECK (total_points_earned >= 0),
    CHECK (total_points_spent >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_default_payment_method ON users(default_payment_method);
CREATE INDEX idx_users_member_since ON users(member_since);
CREATE INDEX idx_users_created_at ON users(created_at);


ALTER TABLE users ADD COLUMN is_blocked BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX idx_users_is_blocked ON users(is_blocked);

-- =====================================================
-- Table: refresh_tokens
-- Stores refresh tokens for JWT auth (access token is stateless)
-- =====================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_refresh_token_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);

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


-- =====================================================
-- Table: pending_waitlist
-- Pay-before-join waitlist: user reserves a waitlist spot, pays, then is added to event_waitlist.
-- =====================================================
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


-- =====================================================
-- Table: user_shipping_addresses
-- Stores optional shipping addresses for users
-- =====================================================

CREATE TABLE IF NOT EXISTS user_shipping_addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    label VARCHAR(100) DEFAULT NULL, -- e.g. 'Home', 'Work'
    recipient_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) DEFAULT NULL,
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255) DEFAULT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) DEFAULT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Australia',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Key
    CONSTRAINT fk_shipping_address_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Indexes for user_shipping_addresses table
CREATE INDEX idx_shipping_address_user_id ON user_shipping_addresses(user_id);
CREATE INDEX idx_shipping_address_is_default ON user_shipping_addresses(is_default);
CREATE INDEX idx_shipping_address_created_at ON user_shipping_addresses(created_at);
CREATE INDEX idx_shipping_address_updated_at ON user_shipping_addresses(updated_at);
CREATE INDEX idx_shipping_addresses_city ON user_shipping_addresses(city);
CREATE INDEX idx_shipping_addresses_country ON user_shipping_addresses(country);

-- =====================================================
-- Table: play_slots
-- Stores recurring social play slot templates (Wed/Fri, extensible)
-- =====================================================
CREATE TABLE IF NOT EXISTS play_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
    time VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    max_capacity INT NOT NULL DEFAULT 45,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CHECK (max_capacity > 0),
    CHECK (price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_play_slots_day ON play_slots(day_of_week);
CREATE INDEX idx_play_slots_is_active ON play_slots(is_active);

-- =====================================================
-- Table: courts
-- Stores court labels per recurring play slot (e.g. Court 1, Court 2)
-- =====================================================
CREATE TABLE IF NOT EXISTS courts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    play_slot_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (play_slot_id) REFERENCES play_slots(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_courts_play_slot ON courts(play_slot_id);

-- =====================================================
-- Table: events
-- Stores social events and tournaments
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(50) NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    max_capacity INT NOT NULL,
    current_attendees INT NOT NULL DEFAULT 0,
    price DECIMAL(10, 2),
    image_url VARCHAR(500),
    status ENUM('available', 'full', 'completed', 'cancelled') NOT NULL DEFAULT 'available',
    category ENUM('regular', 'tournament') NOT NULL DEFAULT 'regular',
    recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (max_capacity > 0),
    CHECK (current_attendees >= 0),
    CHECK (current_attendees <= max_capacity),
    CHECK (price IS NULL OR price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for events table
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_date_status ON events(date, status);
CREATE INDEX idx_events_category_date ON events(category, date);
CREATE INDEX idx_events_recurring ON events(recurring);
CREATE INDEX idx_events_created_at ON events(created_at);

-- =====================================================
-- Table: registrations
-- Stores user registrations for events
-- =====================================================
CREATE TABLE IF NOT EXISTS registrations (
    id VARCHAR(255) PRIMARY KEY,
    event_id INT NOT NULL,
    user_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    registration_date DATETIME NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
    attendance_status ENUM('attended', 'no-show', 'cancelled', 'upcoming') DEFAULT 'upcoming',
    points_earned INT DEFAULT 0,
    points_claimed BOOLEAN DEFAULT FALSE,
    payment_method ENUM('stripe', 'points', 'mixed') DEFAULT 'stripe',
    points_used INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Constraints
    CHECK (points_earned >= 0),
    CHECK (points_used >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for registrations table
CREATE INDEX idx_registrations_user_id ON registrations(user_id);
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_attendance_status ON registrations(attendance_status);
CREATE INDEX idx_registrations_registration_date ON registrations(registration_date);
CREATE INDEX idx_registrations_user_event ON registrations(user_id, event_id);
CREATE INDEX idx_registrations_event_status ON registrations(event_id, status);
CREATE INDEX idx_registrations_email ON registrations(email);
CREATE INDEX idx_registrations_points_claimed ON registrations(points_claimed);

-- =====================================================
-- Table: reward_point_transactions
-- Stores reward point transaction history
-- =====================================================
CREATE TABLE IF NOT EXISTS reward_point_transactions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    event_id INT,
    event_title VARCHAR(255),
    points INT NOT NULL,
    type ENUM('earned', 'spent', 'bonus', 'refund') NOT NULL,
    description TEXT,
    date DATETIME NOT NULL,
    status ENUM('completed', 'pending', 'cancelled') NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for reward_point_transactions table
CREATE INDEX idx_transactions_user_id ON reward_point_transactions(user_id);
CREATE INDEX idx_transactions_event_id ON reward_point_transactions(event_id);
CREATE INDEX idx_transactions_type ON reward_point_transactions(type);
CREATE INDEX idx_transactions_date ON reward_point_transactions(date);
CREATE INDEX idx_transactions_status ON reward_point_transactions(status);
CREATE INDEX idx_transactions_user_date ON reward_point_transactions(user_id, date);
CREATE INDEX idx_transactions_user_type ON reward_point_transactions(user_id, type);
CREATE INDEX idx_transactions_event_date ON reward_point_transactions(event_id, date);

-- =====================================================
-- Table: user_event_history
-- Stores historical event participation data
-- =====================================================
CREATE TABLE IF NOT EXISTS user_event_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    event_id INT NOT NULL,
    event_title VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    event_time VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    category ENUM('regular', 'tournament') NOT NULL,
    registration_date DATETIME NOT NULL,
    attendance_status ENUM('attended', 'no-show', 'cancelled', 'upcoming') NOT NULL,
    points_earned INT NOT NULL DEFAULT 0,
    points_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    price_paid DECIMAL(10, 2) NOT NULL DEFAULT 0,
    payment_method ENUM('stripe', 'points', 'mixed') NOT NULL DEFAULT 'stripe',
    points_used INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    
    -- Constraints
    CHECK (points_earned >= 0),
    CHECK (points_used >= 0),
    CHECK (price_paid >= 0),
    
    -- Unique constraint to prevent duplicate history entries
    UNIQUE KEY unique_user_event_history (user_id, event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for user_event_history table
CREATE INDEX idx_history_user_id ON user_event_history(user_id);
CREATE INDEX idx_history_event_id ON user_event_history(event_id);
CREATE INDEX idx_history_attendance_status ON user_event_history(attendance_status);
CREATE INDEX idx_history_points_claimed ON user_event_history(points_claimed);
CREATE INDEX idx_history_event_date ON user_event_history(event_date);
CREATE INDEX idx_history_user_date ON user_event_history(user_id, event_date);
CREATE INDEX idx_history_user_attendance ON user_event_history(user_id, attendance_status);
CREATE INDEX idx_history_user_points_claimed ON user_event_history(user_id, points_claimed);

-- =====================================================
-- Table: products
-- Stores shop products and services
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    image VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (price >= 0),
    CHECK (original_price IS NULL OR original_price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for products table
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_in_stock ON products(in_stock);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category_stock ON products(category, in_stock);
CREATE INDEX idx_products_created_at ON products(created_at);

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

-- =====================================================
-- Table: homepage_banners
-- Stores homepage carousel banners (images from Cloudinary, 1920x600)
-- =====================================================

CREATE TABLE IF NOT EXISTS homepage_banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) DEFAULT NULL,
    cloudinary_public_id VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CHECK (display_order >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_homepage_banners_is_active ON homepage_banners(is_active);
CREATE INDEX idx_homepage_banners_display_order ON homepage_banners(display_order);
CREATE INDEX idx_homepage_banners_active_order ON homepage_banners(is_active, display_order);

-- =====================================================
-- Table: product_images
-- Stores multiple images per product
-- =====================================================
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    -- Constraints
    CHECK (display_order >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for product_images table
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_display_order ON product_images(product_id, display_order);

-- =====================================================
-- Table: product_quantity_tiers
-- Stores quantity-based pricing per product (e.g. 1 tube $42, 3 tubes $41 each)
-- =====================================================
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

-- =====================================================
-- Table: gallery_photos
-- Stores gallery photos
-- =====================================================
CREATE TABLE IF NOT EXISTS gallery_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    src VARCHAR(500) NOT NULL,
    alt VARCHAR(255) NOT NULL,
    type ENUM('chibi-tournament', 'veteran-tournament', 'social') NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (display_order >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for gallery_photos table
CREATE INDEX idx_gallery_photos_type ON gallery_photos(type);
CREATE INDEX idx_gallery_photos_display_order ON gallery_photos(display_order);
CREATE INDEX idx_gallery_photos_type_order ON gallery_photos(type, display_order);

-- =====================================================
-- Table: gallery_videos
-- Stores gallery videos
-- =====================================================
CREATE TABLE IF NOT EXISTS gallery_videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    embed_id VARCHAR(255) NOT NULL,
    thumbnail VARCHAR(500),
    category ENUM('Wednesday', 'Friday', 'tournament', 'playlists') NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (display_order >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for gallery_videos table
CREATE INDEX idx_gallery_videos_category ON gallery_videos(category);
CREATE INDEX idx_gallery_videos_display_order ON gallery_videos(display_order);
CREATE INDEX idx_gallery_videos_category_order ON gallery_videos(category, display_order);

-- =====================================================
-- Table: news_articles
-- Stores featured news articles
-- =====================================================
CREATE TABLE IF NOT EXISTS news_articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image VARCHAR(500),
    title VARCHAR(255) NOT NULL,
    date VARCHAR(100),
    time VARCHAR(100),
    location VARCHAR(255),
    description TEXT,
    badge VARCHAR(100) NOT NULL DEFAULT 'OPEN',
    category VARCHAR(100),
    link VARCHAR(500),
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (display_order >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for news_articles table
CREATE INDEX idx_news_articles_badge ON news_articles(badge);
CREATE INDEX idx_news_articles_category ON news_articles(category);
CREATE INDEX idx_news_articles_display_order ON news_articles(display_order);
CREATE INDEX idx_news_articles_created_at ON news_articles(created_at);
CREATE INDEX idx_news_articles_badge_order ON news_articles(badge, display_order);

-- =====================================================
-- Table: homepage_banners
-- Stores homepage carousel banners (images from Cloudinary, 1920x600)
-- =====================================================
CREATE TABLE IF NOT EXISTS homepage_banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) DEFAULT NULL,
    cloudinary_public_id VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CHECK (display_order >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for homepage_banners table
CREATE INDEX idx_homepage_banners_is_active ON homepage_banners(is_active);
CREATE INDEX idx_homepage_banners_display_order ON homepage_banners(display_order);
CREATE INDEX idx_homepage_banners_active_order ON homepage_banners(is_active, display_order);

-- =====================================================
-- Table: reviews
-- Stores user reviews
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    rating INT NOT NULL,
    review_date VARCHAR(50) NOT NULL,
    review_text TEXT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    status ENUM('active', 'hidden', 'deleted') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Constraints
    CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for reviews table
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_is_verified ON reviews(is_verified);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
CREATE INDEX idx_reviews_verified_rating ON reviews(is_verified, rating);

-- =====================================================
-- Table: newsletter_subscriptions
-- Stores newsletter subscriptions
-- =====================================================
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    subscribed_at DATETIME NOT NULL,
    status ENUM('active', 'unsubscribed') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for newsletter_subscriptions table
CREATE INDEX idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX idx_newsletter_status ON newsletter_subscriptions(status);
CREATE INDEX idx_newsletter_subscribed_at ON newsletter_subscriptions(subscribed_at);
CREATE INDEX idx_newsletter_status_email ON newsletter_subscriptions(status, email);

-- =====================================================
-- Table: contact_messages
-- Stores contact form messages
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied', 'archived') NOT NULL DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for contact_messages table
CREATE INDEX idx_contact_messages_email ON contact_messages(email);
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at);
CREATE INDEX idx_contact_messages_status_date ON contact_messages(status, created_at);

-- =====================================================
-- Table: service_requests
-- Stores stringing service requests
-- =====================================================
CREATE TABLE IF NOT EXISTS service_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    racket_brand VARCHAR(100) NOT NULL,
    racket_model VARCHAR(100) NOT NULL,
    string_type VARCHAR(100) NOT NULL,
    string_colour VARCHAR(50),
    tension VARCHAR(20) NOT NULL,
    stencil BOOLEAN NOT NULL DEFAULT FALSE,
    grip BOOLEAN NOT NULL DEFAULT FALSE,
    grommet_replacement VARCHAR(50),
    message TEXT,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for service_requests table
CREATE INDEX idx_service_requests_user_id ON service_requests(user_id);
CREATE INDEX idx_service_requests_email ON service_requests(email);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_created_at ON service_requests(created_at);
CREATE INDEX idx_service_requests_status_date ON service_requests(status, created_at);

-- =====================================================
-- Table: payments
-- Stores payment records (mock or Stripe). Used for checkout and invoice generation.
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'AUD',
    status ENUM('pending', 'completed', 'failed', 'refunded', 'expired', 'disputed', 'requires_action') NOT NULL DEFAULT 'pending',
    payment_method ENUM('stripe', 'points', 'mixed') NOT NULL DEFAULT 'stripe',
    stripe_payment_intent_id VARCHAR(255) DEFAULT NULL,
    stripe_checkout_session_id VARCHAR(255) DEFAULT NULL,
    stripe_payment_method_type VARCHAR(50) DEFAULT NULL,
    metadata JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- Constraints
    CHECK (amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for payments table
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_checkout_session ON payments(stripe_checkout_session_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_method ON payments(payment_method);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_payments_stripe_intent ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_user_status_date ON payments(user_id, status, created_at);
CREATE INDEX idx_payments_stripe_method_type ON payments(stripe_payment_method_type);

-- =====================================================
-- Table: invoices
-- Stores invoices for payments. Generated after checkout (mock or Stripe).
-- =====================================================
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    payment_id VARCHAR(255) DEFAULT NULL,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    status ENUM('draft', 'issued', 'paid', 'cancelled') NOT NULL DEFAULT 'draft',
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'AUD',
    due_date DATE DEFAULT NULL,
    paid_at DATETIME DEFAULT NULL,
    pdf_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
    
    -- Constraints
    CHECK (subtotal >= 0),
    CHECK (total >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for invoices table
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_payment_id ON invoices(payment_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_user_status ON invoices(user_id, status);

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
-- Create service_config table (single row for flyer URL)
-- =====================================================
CREATE TABLE IF NOT EXISTS service_config (
    id INT PRIMARY KEY DEFAULT 1,
    flyer_image_url VARCHAR(500) DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO service_config (id, flyer_image_url) VALUES (1, NULL)
ON DUPLICATE KEY UPDATE id = id;

-- =====================================================
-- Remove image_url from service_strings
-- =====================================================
ALTER TABLE service_strings DROP COLUMN image_url;

-- =====================================================
-- Table: invoice_line_items
-- Line items for each invoice (e.g. event registrations).
-- =====================================================
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    event_id INT DEFAULT NULL,
    registration_id VARCHAR(255) DEFAULT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE SET NULL,
    
    -- Constraints
    CHECK (quantity > 0),
    CHECK (unit_price >= 0),
    CHECK (amount >= 0),
    CHECK (sort_order >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for invoice_line_items table
CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX idx_invoice_line_items_event_id ON invoice_line_items(event_id);
CREATE INDEX idx_invoice_line_items_registration_id ON invoice_line_items(registration_id);
CREATE INDEX idx_invoice_line_items_invoice_sort ON invoice_line_items(invoice_id, sort_order);

-- =====================================================
-- Additional Performance Indexes
-- Composite indexes for common query patterns
-- =====================================================

-- For querying events by date range and status
CREATE INDEX idx_events_date_status_category ON events(date, status, category);

-- For querying user registrations with event details
CREATE INDEX idx_registrations_user_status_date ON registrations(user_id, status, registration_date);

-- For querying transactions by user and date range
CREATE INDEX idx_transactions_user_status_date ON reward_point_transactions(user_id, status, date);

-- For querying history by user and attendance status
CREATE INDEX idx_history_user_attendance_date ON user_event_history(user_id, attendance_status, event_date);

-- =====================================================
-- Table: orders
-- Stores shop orders created via Stripe Checkout.
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    payment_id VARCHAR(255) DEFAULT NULL,
    status ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    total DECIMAL(10, 2) NOT NULL,
    shipping_name VARCHAR(255) DEFAULT NULL,
    shipping_email VARCHAR(255) DEFAULT NULL,
    shipping_phone VARCHAR(50) DEFAULT NULL,
    shipping_address TEXT DEFAULT NULL,
    stripe_payment_intent_id VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,

    CHECK (total >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_id ON orders(payment_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- =====================================================
-- Table: order_items
-- Line items for shop orders.
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,

    CHECK (quantity > 0),
    CHECK (unit_price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- =====================================================
-- End of Schema
-- =====================================================
