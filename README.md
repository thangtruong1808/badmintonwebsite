# ChibiBadminton

A full-stack badminton club management application with React frontend and Express.js backend.

## Project Structure

```
chibibadminton/
├── frontend/           # React frontend application
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   ├── package.json   # Frontend dependencies
│   └── ...
├── backend/           # Express.js backend API
│   ├── src/           # Source code
│   ├── package.json   # Backend dependencies
│   └── ...
├── package.json       # Root package.json (orchestrates both)
└── README.md          # This file
```

## Quick Start

### Initial Setup

1. **Install all dependencies** (frontend, backend, and root):
   ```bash
   npm run install:all
   ```

   Or install manually:
   ```bash
   npm install              # Root dependencies
   cd frontend && npm install  # Frontend dependencies
   cd ../backend && npm install # Backend dependencies
   ```

2. **Configure Backend Environment**:
   ```bash
   cd backend
   cp .env.example .env    # Create .env file (if .env.example exists)
   ```
   
   Edit `backend/.env`:
   ```env
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   ```

### Development

**Start both frontend and backend together**:
```bash
npm run dev
```

This will start:
- Frontend on `http://localhost:5173` (Vite dev server)
- Backend on `http://localhost:3001` (Express API server)

**Start individually**:
```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

### Build for Production

Build both frontend and backend:
```bash
npm run build
```

Build individually:
```bash
npm run build:frontend
npm run build:backend
```

### Production Start

Start both in production mode:
```bash
npm start
```

## Available Scripts

### Root Level (Runs Both)
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production
- `npm run start` - Start both in production mode
- `npm run lint` - Lint both frontend and backend
- `npm run install:all` - Install all dependencies

### Frontend Only
- `npm run dev:frontend` - Start frontend dev server
- `npm run build:frontend` - Build frontend
- `npm run lint:frontend` - Lint frontend code

### Backend Only
- `npm run dev:backend` - Start backend dev server
- `npm run build:backend` - Build backend
- `npm run lint:backend` - Lint backend code

## Technology Stack

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- React Icons

### Backend
- Node.js
- Express.js
- TypeScript
- JWT Authentication
- Zod Validation

## API Documentation

The backend API runs on `http://localhost:3001/api`. See `backend/README.md` for detailed API documentation.

### Quick API Endpoints
- `GET /api/events` - Get all events
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/users/me` - Get current user (Protected)

See `backend/README.md` and `BACKEND_PLAN.md` for complete API documentation.

## Project Organization

### Frontend (`frontend/`)
All React components, pages, utilities, and assets are in the `frontend/` directory.

### Backend (`backend/`)
All Express.js API routes, controllers, services, and middleware are in the `backend/` directory.

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key
```

### Frontend (`frontend/.env`)
Create if needed for frontend-specific variables:
```env
VITE_API_URL=http://localhost:3001/api
```

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload in development mode
2. **Separate Terminals**: You can run frontend and backend in separate terminals if preferred
3. **API Proxy**: Frontend should be configured to proxy API requests to the backend
4. **Ports**: 
   - Frontend: 5173 (default Vite port)
   - Backend: 3001 (configurable in backend/.env)

## Deployment

### Frontend
The frontend can be deployed to Vercel, Netlify, or any static hosting service.

### Backend
The backend can be deployed to services like:
- Railway
- Render
- Heroku
- AWS
- DigitalOcean

See deployment documentation in `backend/README.md` and `SETUP_GUIDE.md`.

## Contributing

1. Make sure both frontend and backend are running
2. Make changes in respective directories
3. Test thoroughly
4. Lint code before committing: `npm run lint`

## License

Private project - All rights reserved
