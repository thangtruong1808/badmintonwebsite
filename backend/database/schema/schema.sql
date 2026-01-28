-- =====================================================
-- ChibiBadminton Database Schema
-- MySQL Database Schema with Indexes for Performance
-- =====================================================

-- Create database (uncomment if needed)
-- CREATE DATABASE IF NOT EXISTS chibibadminton CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE chibibadminton;

-- =====================================================
-- Table: users
-- Stores user account information
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin', 'super_admin') NOT NULL DEFAULT 'user',
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
CREATE INDEX idx_users_member_since ON users(member_since);
CREATE INDEX idx_users_created_at ON users(created_at);

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
    payment_method ENUM('cash', 'points', 'mixed') DEFAULT 'cash',
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
    payment_method ENUM('cash', 'points', 'mixed') NOT NULL DEFAULT 'cash',
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
    badge ENUM('UPCOMING', 'REGULAR', 'OPEN') NOT NULL DEFAULT 'OPEN',
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
-- End of Schema
-- =====================================================
