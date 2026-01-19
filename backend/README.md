# ChibiBadminton Backend API

Express.js backend server for the ChibiBadminton application.

## Project Structure

```
backend/
├── src/
│   ├── server.ts              # Main server entry point
│   ├── controllers/           # Request handlers
│   │   ├── authController.ts
│   │   ├── eventsController.ts
│   │   ├── registrationsController.ts
│   │   ├── usersController.ts
│   │   └── rewardsController.ts
│   ├── routes/                # API routes
│   │   ├── auth.ts
│   │   ├── events.ts
│   │   ├── registrations.ts
│   │   ├── users.ts
│   │   └── rewards.ts
│   ├── services/              # Business logic
│   │   ├── userService.ts
│   │   ├── eventService.ts
│   │   ├── registrationService.ts
│   │   └── rewardService.ts
│   ├── middleware/            # Express middleware
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   └── types/                 # TypeScript type definitions
│       └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your configuration values.

3. **Development**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:3001` (or PORT from .env)

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (Protected)
- `PUT /api/events/:id` - Update event (Protected)
- `DELETE /api/events/:id` - Delete event (Protected)

### Registrations
- `GET /api/registrations/my-registrations` - Get user's registrations (Protected)
- `GET /api/registrations/event/:eventId` - Get event registrations (Protected)
- `POST /api/registrations` - Register for events (Protected)
- `DELETE /api/registrations/:registrationId` - Cancel registration (Protected)

### Users
- `GET /api/users/me` - Get current user profile (Protected)
- `PUT /api/users/me` - Update user profile (Protected)

### Rewards
- `GET /api/rewards/points` - Get user's reward points (Protected)
- `GET /api/rewards/transactions` - Get transaction history (Protected)
- `GET /api/rewards/event-history` - Get event history (Protected)
- `GET /api/rewards/unclaimed-count` - Get unclaimed points count (Protected)
- `POST /api/rewards/claim/:eventId` - Claim points for event (Protected)
- `POST /api/rewards/use-points` - Use points for booking (Protected)

## Authentication

Protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Tokens are obtained from the `/api/auth/login` endpoint and expire after 7 days.

## Current Implementation

⚠️ **Note**: Currently using in-memory storage for all data. This means:
- Data is lost on server restart
- Not suitable for production
- Multiple instances won't share data

**Next Steps**:
1. Integrate a database (PostgreSQL, MongoDB, etc.)
2. Add proper data persistence
3. Implement database migrations
4. Add caching layer if needed

## Development Notes

- Uses TypeScript for type safety
- Express.js for the web framework
- JWT for authentication
- CORS enabled for frontend integration
- Zod for request validation
- Error handling middleware for consistent error responses

## Integration with Frontend

The frontend should be configured to:
1. Use the backend API URL (default: `http://localhost:3001/api`)
2. Include JWT token in Authorization header for protected routes
3. Handle CORS if running on different ports

Example frontend API configuration:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

fetch(`${API_BASE_URL}/events`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```
