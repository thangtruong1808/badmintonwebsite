# Backend Implementation Plan for ChibiBadminton

## Overview
This document outlines the plan for integrating an Express.js backend into the ChibiBadminton project, separating it from the frontend while maintaining all existing functionality.

## Project Structure

```
chibibadminton/
├── backend/                    # NEW: Backend Express.js server
│   ├── src/
│   │   ├── server.ts          # Main server entry point
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic layer
│   │   ├── middleware/        # Express middleware (auth, validation, error handling)
│   │   └── types/             # TypeScript types
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── src/                        # EXISTING: Frontend React app (unchanged)
│   ├── components/
│   ├── utils/
│   ├── types/
│   └── ...
└── package.json                # Frontend package.json (unchanged)
```

## Backend Architecture

### Technology Stack
- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Password Hashing**: bcryptjs
- **Current Storage**: In-memory (to be replaced with database later)

### API Structure

#### 1. Authentication (`/api/auth`)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login and JWT token generation

#### 2. Events (`/api/events`)
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (Admin - protected)
- `PUT /api/events/:id` - Update event (Admin - protected)
- `DELETE /api/events/:id` - Delete event (Admin - protected)

#### 3. Registrations (`/api/registrations`)
- `GET /api/registrations/my-registrations` - Get current user's registrations
- `GET /api/registrations/event/:eventId` - Get all registrations for an event
- `POST /api/registrations` - Register for events
- `DELETE /api/registrations/:registrationId` - Cancel registration

#### 4. Users (`/api/users`)
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `GET /api/users/:id` - Get user by ID (Admin - protected)

#### 5. Rewards (`/api/rewards`)
- `GET /api/rewards/points` - Get user's reward points
- `GET /api/rewards/transactions` - Get reward point transactions
- `GET /api/rewards/event-history` - Get user's event history
- `GET /api/rewards/unclaimed-count` - Get count of unclaimed points
- `POST /api/rewards/claim/:eventId` - Claim points for attended event
- `POST /api/rewards/use-points` - Use points for booking

## Current Frontend Services to Replace

### 1. Authentication (`src/utils/mockAuth.ts`)
**Current**: localStorage-based mock authentication
**Backend**: JWT-based authentication with bcrypt password hashing

### 2. User Storage (`src/utils/userStorage.ts`)
**Current**: localStorage for user ID
**Backend**: User IDs managed by backend, stored in JWT token

### 3. Registration Service (`src/utils/registrationService.ts`)
**Current**: localStorage for events and registrations
**Backend**: API endpoints for event registration management

### 4. Reward Points Service (`src/utils/rewardPointsService.ts`)
**Current**: localStorage for transactions and event history
**Backend**: API endpoints for reward points management

### 5. Cart Storage (`src/utils/cartStorage.ts`)
**Current**: localStorage for cart items
**Backend**: Can remain client-side or move to backend session

## Implementation Phases

### Phase 1: Backend Setup (✅ COMPLETED)
- [x] Create backend folder structure
- [x] Set up Express.js server
- [x] Configure TypeScript
- [x] Set up basic middleware (CORS, body-parser, error handling)
- [x] Create route structure
- [x] Implement in-memory data storage (temporary)

### Phase 2: Frontend Integration (TODO)
- [ ] Create API service layer in frontend
- [ ] Replace localStorage calls with API calls
- [ ] Implement JWT token storage and management
- [ ] Update authentication flow
- [ ] Update all components to use API services
- [ ] Handle loading and error states

### Phase 3: Database Integration (TODO)
- [ ] Choose database (PostgreSQL recommended)
- [ ] Set up database schema
- [ ] Create database models
- [ ] Replace in-memory storage with database queries
- [ ] Add database migrations
- [ ] Implement connection pooling

### Phase 4: Production Features (TODO)
- [ ] Add rate limiting
- [ ] Implement request validation
- [ ] Add logging (Winston or similar)
- [ ] Set up environment-specific configs
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Implement admin role management
- [ ] Add email notifications
- [ ] Set up file upload for event images

## Data Models

### User
```typescript
{
  id: string
  name: string
  email: string
  phone?: string
  password: string (hashed)
  rewardPoints: number
  totalPointsEarned: number
  totalPointsSpent: number
  memberSince: string (ISO date)
  avatar?: string
}
```

### SocialEvent
```typescript
{
  id: number
  title: string
  date: string
  time: string
  dayOfWeek: string
  location: string
  description: string
  maxCapacity: number
  currentAttendees: number
  price?: number
  imageUrl?: string
  status: "available" | "full" | "completed" | "cancelled"
  category: "regular" | "tournament"
  recurring?: boolean
}
```

### Registration
```typescript
{
  id: string
  eventId: number
  userId: string
  name: string
  email: string
  phone: string
  registrationDate: string (ISO)
  status: "pending" | "confirmed" | "cancelled"
  attendanceStatus?: "attended" | "no-show" | "cancelled" | "upcoming"
  pointsEarned?: number
  pointsClaimed?: boolean
  paymentMethod?: "cash" | "points" | "mixed"
  pointsUsed?: number
}
```

### RewardPointTransaction
```typescript
{
  id: string
  userId: string
  eventId: number
  eventTitle: string
  points: number (positive/negative)
  type: "earned" | "spent" | "bonus" | "refund"
  description: string
  date: string (ISO)
  status: "completed" | "pending" | "cancelled"
}
```

## Environment Variables

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key-change-in-production
DATABASE_URL=postgresql://user:password@localhost:5432/chibibadminton
```

## Security Considerations

1. **JWT Tokens**: 7-day expiration, stored securely on frontend
2. **Password Hashing**: bcrypt with salt rounds
3. **CORS**: Configured for frontend origin only
4. **Input Validation**: Zod schemas for all user inputs
5. **Error Handling**: Consistent error responses without exposing internals
6. **Rate Limiting**: To be implemented (Phase 4)

## Migration Strategy

1. **Backend First**: Backend is ready and can run independently
2. **Gradual Migration**: Frontend can be updated incrementally
3. **Dual Mode**: Support both localStorage and API during transition (optional)
4. **Testing**: Test all endpoints before frontend integration

## Next Steps

1. **Test Backend**: Use Postman/Thunder Client to test all endpoints
2. **Frontend Integration**: Create API service utilities
3. **Update Components**: Replace localStorage with API calls
4. **Database**: Plan and implement database schema
5. **Deployment**: Set up deployment pipeline for both frontend and backend

## Notes

- Frontend design, layout, and features remain unchanged
- All existing functionality will work the same way, just powered by backend
- Backend can be deployed separately from frontend
- Supports future scaling and additional features
