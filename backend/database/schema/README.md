# ChibiBadminton Database Schema

This directory contains the MySQL database schema for the ChibiBadminton application.

## Files

- `schema.sql` - Complete database schema with tables, relationships, and indexes
- `drop_schema.sql` - Script to drop all tables (useful for testing/reset)
- `README.md` - This documentation file

## Database Structure

### Tables

#### 1. `users`
Stores user account information including authentication, roles, and reward points.

**Key Fields:**
- `id` (VARCHAR) - Primary key, unique user identifier
- `email` (VARCHAR) - Unique email address (indexed)
- `password` (VARCHAR) - Hashed password
- `role` (ENUM) - User role: user (default), admin, super_admin (indexed)
- `reward_points` (INT) - Current available reward points
- `total_points_earned` (INT) - Lifetime points earned
- `total_points_spent` (INT) - Lifetime points spent

**Indexes:**
- Primary key on `id`
- Unique index on `email`
- Index on `role` for role-based access control queries
- Index on `member_since` for sorting/filtering
- Index on `created_at` for chronological queries

**Role Hierarchy:**
- `user` - Normal user (default role for new registrations)
- `admin` - Administrator with elevated permissions
- `super_admin` - Super administrator with full system access

#### 2. `events`
Stores social events and tournaments.

**Key Fields:**
- `id` (INT) - Primary key, auto-increment
- `title` (VARCHAR) - Event title
- `date` (DATE) - Event date (indexed)
- `status` (ENUM) - Event status: available, full, completed, cancelled (indexed)
- `category` (ENUM) - Event category: regular, tournament (indexed)
- `max_capacity` (INT) - Maximum attendees
- `current_attendees` (INT) - Current number of attendees

**Indexes:**
- Primary key on `id`
- Index on `date` for date-based queries
- Index on `status` for filtering by status
- Index on `category` for filtering by category
- Composite indexes for common query patterns:
  - `(date, status)` - Query events by date and status
  - `(category, date)` - Query events by category and date
  - `(date, status, category)` - Complex filtering

#### 3. `registrations`
Stores user registrations for events.

**Key Fields:**
- `id` (VARCHAR) - Primary key, unique registration identifier
- `event_id` (INT) - Foreign key to `events.id`
- `user_id` (VARCHAR) - Foreign key to `users.id` (nullable for guest registrations)
- `status` (ENUM) - Registration status: pending, confirmed, cancelled
- `attendance_status` (ENUM) - Attendance tracking: attended, no-show, cancelled, upcoming
- `points_earned` (INT) - Points earned from this registration
- `points_claimed` (BOOLEAN) - Whether points have been claimed

**Indexes:**
- Primary key on `id`
- Foreign key indexes on `event_id` and `user_id`
- Index on `status` for filtering registrations
- Index on `attendance_status` for attendance queries
- Index on `registration_date` for chronological queries
- Composite indexes:
  - `(user_id, event_id)` - Check if user registered for event
  - `(event_id, status)` - Get registrations for an event by status
  - `(user_id, status, registration_date)` - User's registration history

#### 4. `reward_point_transactions`
Stores reward point transaction history.

**Key Fields:**
- `id` (VARCHAR) - Primary key, unique transaction identifier
- `user_id` (VARCHAR) - Foreign key to `users.id`
- `event_id` (INT) - Foreign key to `events.id` (nullable)
- `points` (INT) - Points amount (positive for earned, negative for spent)
- `type` (ENUM) - Transaction type: earned, spent, bonus, refund
- `date` (DATETIME) - Transaction date (indexed)
- `status` (ENUM) - Transaction status: completed, pending, cancelled

**Indexes:**
- Primary key on `id`
- Foreign key indexes on `user_id` and `event_id`
- Index on `type` for filtering by transaction type
- Index on `date` for chronological queries
- Index on `status` for filtering by status
- Composite indexes:
  - `(user_id, date)` - User's transaction history
  - `(user_id, type)` - User's transactions by type
  - `(user_id, status, date)` - User's transactions with status filtering

#### 5. `user_event_history`
Stores historical event participation data.

**Key Fields:**
- `id` (INT) - Primary key, auto-increment
- `user_id` (VARCHAR) - Foreign key to `users.id`
- `event_id` (INT) - Foreign key to `events.id`
- `attendance_status` (ENUM) - Attendance status
- `points_earned` (INT) - Points earned
- `points_claimed` (BOOLEAN) - Whether points were claimed
- `price_paid` (DECIMAL) - Amount paid
- `payment_method` (ENUM) - Payment method used

**Indexes:**
- Primary key on `id`
- Unique constraint on `(user_id, event_id)` to prevent duplicates
- Foreign key indexes on `user_id` and `event_id`
- Index on `attendance_status` for filtering
- Index on `points_claimed` for finding unclaimed points
- Index on `event_date` for date-based queries
- Composite indexes:
  - `(user_id, event_date)` - User's event history by date
  - `(user_id, attendance_status)` - User's events by attendance
  - `(user_id, points_claimed)` - User's unclaimed points
  - `(user_id, attendance_status, event_date)` - Complex filtering

#### 6. `products`
Stores shop products and services.

**Key Fields:**
- `id` (INT) - Primary key, auto-increment
- `name` (VARCHAR) - Product name (indexed for search)
- `price` (DECIMAL) - Current price
- `original_price` (DECIMAL) - Original price (for sales)
- `image` (VARCHAR) - Main product image URL
- `category` (VARCHAR) - Product category (indexed)
- `in_stock` (BOOLEAN) - Stock availability (indexed)
- `description` (TEXT) - Product description

**Indexes:**
- Primary key on `id`
- Index on `category` for filtering by category
- Index on `in_stock` for filtering available products
- Index on `name` for search functionality
- Composite index `(category, in_stock)` for category filtering with stock status

#### 7. `product_images`
Stores multiple images per product.

**Key Fields:**
- `id` (INT) - Primary key, auto-increment
- `product_id` (INT) - Foreign key to `products.id`
- `image_url` (VARCHAR) - Image URL
- `display_order` (INT) - Display order for sorting

**Indexes:**
- Primary key on `id`
- Foreign key index on `product_id`
- Composite index `(product_id, display_order)` for ordered image retrieval

#### 8. `gallery_photos`
Stores gallery photos.

**Key Fields:**
- `id` (INT) - Primary key, auto-increment
- `src` (VARCHAR) - Image source URL
- `alt` (VARCHAR) - Alt text for accessibility
- `type` (ENUM) - Photo type: chibi-tournament, veteran-tournament, social (indexed)
- `display_order` (INT) - Display order for sorting

**Indexes:**
- Primary key on `id`
- Index on `type` for filtering by photo type
- Index on `display_order` for sorting
- Composite index `(type, display_order)` for filtered and sorted queries

#### 9. `gallery_videos`
Stores gallery videos.

**Key Fields:**
- `id` (INT) - Primary key, auto-increment
- `title` (VARCHAR) - Video title
- `embed_id` (VARCHAR) - YouTube embed ID
- `thumbnail` (VARCHAR) - Thumbnail image URL
- `category` (ENUM) - Video category: Wednesday, Friday, tournament, playlists (indexed)
- `display_order` (INT) - Display order for sorting

**Indexes:**
- Primary key on `id`
- Index on `category` for filtering by category
- Index on `display_order` for sorting
- Composite index `(category, display_order)` for filtered and sorted queries

#### 10. `news_articles`
Stores featured news articles.

**Key Fields:**
- `id` (INT) - Primary key, auto-increment
- `image` (VARCHAR) - Article image URL
- `title` (VARCHAR) - Article title
- `date` (VARCHAR) - Article date
- `time` (VARCHAR) - Article time
- `location` (VARCHAR) - Article location
- `description` (TEXT) - Article description
- `badge` (ENUM) - Badge type: UPCOMING, REGULAR, OPEN (indexed)
- `category` (VARCHAR) - Article category (indexed)
- `link` (VARCHAR) - External link URL
- `display_order` (INT) - Display order for sorting

**Indexes:**
- Primary key on `id`
- Index on `badge` for filtering by badge type
- Index on `category` for filtering by category
- Index on `display_order` for sorting
- Index on `created_at` for chronological queries
- Composite index `(badge, display_order)` for filtered and sorted queries

#### 11. `reviews`
Stores user reviews.

**Key Fields:**
- `id` (INT) - Primary key, auto-increment
- `user_id` (VARCHAR) - Foreign key to `users.id` (nullable for guest reviews)
- `name` (VARCHAR) - Reviewer name
- `rating` (INT) - Rating from 1-5 (indexed)
- `review_date` (VARCHAR) - Review date string
- `review_text` (TEXT) - Review content
- `is_verified` (BOOLEAN) - Whether review is verified (indexed)
- `status` (ENUM) - Review status: active, hidden, deleted (indexed)

**Indexes:**
- Primary key on `id`
- Foreign key index on `user_id`
- Index on `rating` for filtering by rating
- Index on `is_verified` for showing verified reviews
- Index on `status` for filtering active reviews
- Index on `created_at` for chronological queries
- Composite index `(is_verified, rating)` for verified reviews by rating

#### 12. `newsletter_subscriptions`
Stores newsletter subscriptions.

**Key Fields:**
- `id` (INT) - Primary key, auto-increment
- `email` (VARCHAR) - Subscriber email (unique, indexed)
- `subscribed_at` (DATETIME) - Subscription date (indexed)
- `status` (ENUM) - Subscription status: active, unsubscribed (indexed)

**Indexes:**
- Primary key on `id`
- Unique index on `email` to prevent duplicate subscriptions
- Index on `status` for filtering active subscriptions
- Index on `subscribed_at` for chronological queries
- Composite index `(status, email)` for status-based email lookups

#### 13. `contact_messages`
Stores contact form messages.

**Key Fields:**
- `id` (INT) - Primary key, auto-increment
- `name` (VARCHAR) - Sender name
- `email` (VARCHAR) - Sender email (indexed)
- `phone` (VARCHAR) - Sender phone
- `subject` (VARCHAR) - Message subject
- `message` (TEXT) - Message content
- `status` (ENUM) - Message status: new, read, replied, archived (indexed)

**Indexes:**
- Primary key on `id`
- Index on `email` for filtering by sender
- Index on `status` for filtering by status
- Index on `created_at` for chronological queries
- Composite index `(status, created_at)` for status-based date filtering

#### 14. `service_requests`
Stores stringing service requests.

**Key Fields:**
- `id` (INT) - Primary key, auto-increment
- `user_id` (VARCHAR) - Foreign key to `users.id` (nullable for guest requests)
- `name` (VARCHAR) - Customer name
- `email` (VARCHAR) - Customer email (indexed)
- `phone` (VARCHAR) - Customer phone
- `racket_brand` (VARCHAR) - Racket brand
- `racket_model` (VARCHAR) - Racket model
- `string_type` (VARCHAR) - String type
- `string_colour` (VARCHAR) - String color
- `tension` (VARCHAR) - String tension
- `stencil` (BOOLEAN) - Stencil service requested
- `grip` (BOOLEAN) - Grip service requested
- `grommet_replacement` (VARCHAR) - Grommet replacement count
- `message` (TEXT) - Additional notes
- `status` (ENUM) - Request status: pending, in_progress, completed, cancelled (indexed)

**Indexes:**
- Primary key on `id`
- Foreign key index on `user_id`
- Index on `email` for filtering by customer
- Index on `status` for filtering by status
- Index on `created_at` for chronological queries
- Composite index `(status, created_at)` for status-based date filtering

## Relationships

```
users (1) ──< (many) registrations
events (1) ──< (many) registrations
users (1) ──< (many) reward_point_transactions
events (1) ──< (many) reward_point_transactions
users (1) ──< (many) user_event_history
events (1) ──< (many) user_event_history
users (1) ──< (many) reviews
users (1) ──< (many) service_requests
products (1) ──< (many) product_images
```

## Performance Optimizations

### Index Strategy

1. **Primary Keys**: All tables have primary keys for fast lookups
2. **Foreign Keys**: Indexed for join performance
3. **Search Columns**: Frequently queried columns are indexed:
   - Email addresses
   - Dates
   - Status fields
   - Category fields
4. **Composite Indexes**: Created for common query patterns:
   - Multi-column filters
   - Sorting with filtering
   - Join operations

### Query Optimization Tips

1. **Use indexed columns in WHERE clauses** - Always filter by indexed columns when possible
2. **Leverage composite indexes** - Order your WHERE conditions to match composite index order
3. **Date range queries** - Use indexed date columns for efficient range queries
4. **Status filtering** - Use status indexes for filtering active/completed records

## Usage

### Creating the Database

```bash
# Connect to MySQL
mysql -u your_username -p

# Run the schema script
source backend/database/schema/schema.sql

# Or from command line
mysql -u your_username -p your_database < backend/database/schema/schema.sql
```

### Resetting the Database

```bash
# Drop all tables (use with caution!)
mysql -u your_username -p your_database < backend/database/schema/drop_schema.sql

# Then recreate
mysql -u your_username -p your_database < backend/database/schema/schema.sql
```

## Data Types

- **VARCHAR**: Variable-length strings (sized appropriately for content)
- **INT**: Integer values for counts and IDs
- **DECIMAL**: Monetary values (price, points)
- **DATE/DATETIME**: Date and time values
- **ENUM**: Fixed set of values for status/category fields
- **BOOLEAN**: True/false values
- **TEXT**: Long text content (descriptions)

## Constraints

- **NOT NULL**: Required fields
- **UNIQUE**: Unique constraints on email and composite keys
- **CHECK**: Data validation (non-negative values, capacity limits)
- **FOREIGN KEY**: Referential integrity with CASCADE/SET NULL actions
- **DEFAULT**: Default values for optional fields

## Notes

- All tables use `utf8mb4` character set for full Unicode support
- `InnoDB` engine is used for foreign key support and transactions
- Timestamps (`created_at`, `updated_at`) are automatically managed
- Foreign keys use appropriate actions:
  - `ON DELETE CASCADE` for dependent records
  - `ON DELETE SET NULL` for optional relationships

## Future Considerations

- Consider partitioning large tables (e.g., `reward_point_transactions`) by date
- Add full-text search indexes if text search is needed
- Consider archiving old completed events to separate tables
- Monitor index usage and adjust based on actual query patterns
