# ChibiBadminton Backend Setup Guide

## Overview

The backend has been successfully created as a separate Express.js server. This guide will help you set it up and understand the project structure.

## Project Structure

```
chibibadminton/
├── backend/              # NEW: Express.js backend server
│   ├── src/
│   │   ├── server.ts     # Main server entry point
│   │   ├── controllers/  # Request handlers
│   │   ├── routes/       # API route definitions
│   │   ├── services/     # Business logic layer
│   │   ├── middleware/   # Auth, validation, error handling
│   │   ├── types/        # TypeScript type definitions
│   │   └── utils/        # Utility functions
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── src/                  # EXISTING: Frontend React app (unchanged)
└── BACKEND_PLAN.md       # Detailed implementation plan
```

## Quick Start

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env  # If .env.example exists, or create manually
```

Edit `.env` with your configuration:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 3. Start the Backend Server

**Development mode** (with hot reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm run build
npm start
```

The server will start on `http://localhost:3001` (or the PORT specified in `.env`).

### 4. Verify Server is Running

Visit `http://localhost:3001/health` in your browser or use curl:
```bash
curl http://localhost:3001/health
```

You should see:
```json
{
  "status": "ok",
  "message": "ChibiBadminton API is running"
}
```

## API Endpoints

### Base URL
```
http://localhost:3001/api
```

### Available Endpoints

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

#### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (Protected - requires JWT)
- `PUT /api/events/:id` - Update event (Protected)
- `DELETE /api/events/:id` - Delete event (Protected)

#### Registrations
- `GET /api/registrations/my-registrations` - Get user's registrations (Protected)
- `GET /api/registrations/event/:eventId` - Get event registrations (Protected)
- `POST /api/registrations` - Register for events (Protected)
- `DELETE /api/registrations/:registrationId` - Cancel registration (Protected)

#### Users
- `GET /api/users/me` - Get current user profile (Protected)
- `PUT /api/users/me` - Update user profile (Protected)

#### Rewards
- `GET /api/rewards/points` - Get user's reward points (Protected)
- `GET /api/rewards/transactions` - Get transaction history (Protected)
- `GET /api/rewards/event-history` - Get event history (Protected)
- `GET /api/rewards/unclaimed-count` - Get unclaimed points count (Protected)
- `POST /api/rewards/claim/:eventId` - Claim points for event (Protected)
- `POST /api/rewards/use-points` - Use points for booking (Protected)

## Testing the API

### Test Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "+61 400 000 000"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Response will include a JWT token:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-...",
    "name": "Test User",
    "email": "test@example.com",
    ...
  }
}
```

### Test Protected Endpoint (with token)
```bash
curl -X GET http://localhost:3001/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Get Events
```bash
curl http://localhost:3001/api/events
```

## Frontend Integration (Next Steps)

The frontend currently uses localStorage. To integrate with the backend:

1. **Create API service layer** in `src/services/api.ts`
2. **Update authentication** to use JWT tokens
3. **Replace localStorage calls** with API calls
4. **Update components** to handle loading/error states

See `BACKEND_PLAN.md` for detailed migration strategy.

## Current Implementation Notes

⚠️ **Important**: The backend currently uses **in-memory storage**, which means:
- Data is lost when the server restarts
- Not suitable for production
- Multiple server instances won't share data

**Next steps for production**:
1. Integrate a database (PostgreSQL, MongoDB, etc.)
2. Add proper data persistence
3. Implement database migrations
4. Add authentication middleware for admin routes

## Development Commands

```bash
# Install dependencies
npm install

# Run in development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint
```

## Troubleshooting

### Port Already in Use
If port 3001 is already in use, change the PORT in `.env`:
```env
PORT=3002
```

### CORS Issues
If you encounter CORS errors, ensure `FRONTEND_URL` in `.env` matches your frontend URL:
```env
FRONTEND_URL=http://localhost:5173
```

### Module Not Found Errors
Make sure all dependencies are installed:
```bash
cd backend
npm install
```

## Security Notes

1. **Change JWT_SECRET** in production to a strong, random value
2. **Use HTTPS** in production
3. **Add rate limiting** before deploying
4. **Validate all inputs** (already implemented with Zod)
5. **Never commit `.env`** file (already in `.gitignore`)

## Support

For detailed API documentation, see `backend/README.md`.
For implementation plan and architecture details, see `BACKEND_PLAN.md`.
