# ChibiBadminton - Project Structure

## Overview

The project is organized as a monorepo with separate frontend and backend applications.

## Directory Structure

```
chibibadminton/
├── frontend/                  # React Frontend Application
│   ├── src/                   # Source code
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── utils/             # Utility functions
│   │   ├── types/             # TypeScript type definitions
│   │   ├── data/              # Mock data
│   │   ├── assets/            # Images, fonts, etc.
│   │   ├── App.tsx            # Main app component
│   │   └── main.tsx           # Entry point
│   ├── public/                # Static public assets
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.ts         # Vite configuration
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   ├── tsconfig.json          # TypeScript configuration
│   └── index.html             # HTML entry point
│
├── backend/                   # Express.js Backend API
│   ├── src/
│   │   ├── server.ts          # Express server entry point
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Express middleware
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utility functions
│   ├── package.json           # Backend dependencies
│   ├── tsconfig.json          # TypeScript configuration
│   └── .env                   # Environment variables (create from .env.example)
│
├── package.json               # Root package.json (orchestrates both)
├── README.md                  # Main project documentation
├── MIGRATION_GUIDE.md         # Migration guide for new structure
└── .gitignore                 # Git ignore rules for entire project
```

## Running the Project

### Development Mode

**Start both frontend and backend:**
```bash
npm run dev
```

This starts:
- Frontend: `http://localhost:5173` (Vite dev server)
- Backend: `http://localhost:3001` (Express API server)

### Individual Servers

**Frontend only:**
```bash
npm run dev:frontend
```

**Backend only:**
```bash
npm run dev:backend
```

## Installation

Install all dependencies:
```bash
npm run install:all
```

Or install manually:
```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend && npm install

# Backend dependencies
cd backend && npm install
```

## Build

Build both applications:
```bash
npm run build
```

Outputs:
- Frontend: `frontend/dist/`
- Backend: `backend/dist/`

## Scripts Reference

### Root Level Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both frontend and backend in dev mode |
| `npm run build` | Build both frontend and backend |
| `npm run start` | Start both in production mode |
| `npm run lint` | Lint both frontend and backend |
| `npm run install:all` | Install all dependencies |

### Frontend Scripts (run from `frontend/`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint frontend code |

### Backend Scripts (run from `backend/`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run lint` | Lint backend code |

## Configuration Files

### Frontend
- `vite.config.ts` - Vite bundler configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint configuration

### Backend
- `tsconfig.json` - TypeScript configuration
- `.env` - Environment variables (create from `.env.example`)

### Root
- `package.json` - Orchestrates both applications using `concurrently`

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key
```

### Frontend (`frontend/.env` - optional)
```env
VITE_API_URL=http://localhost:3001/api
```

## Port Configuration

- **Frontend**: 5173 (default Vite port)
- **Backend**: 3001 (configurable in `backend/.env`)

## Development Workflow

1. **Install dependencies**: `npm run install:all`
2. **Configure backend**: Create `backend/.env` file
3. **Start development**: `npm run dev`
4. **Make changes**: Edit files in `frontend/src/` or `backend/src/`
5. **Hot reload**: Both servers support hot reload in dev mode

## Deployment

### Frontend
- Build: `npm run build:frontend`
- Output: `frontend/dist/`
- Deploy to: Vercel, Netlify, or any static hosting

### Backend
- Build: `npm run build:backend`
- Output: `backend/dist/`
- Deploy to: Railway, Render, Heroku, AWS, etc.

## Notes

- Both frontend and backend are independent applications
- They can be developed, built, and deployed separately
- The root `package.json` is only for convenience in development
- No code, design, or features have been changed - only structure
- All imports use relative paths, so they work regardless of structure
