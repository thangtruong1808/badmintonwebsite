import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import { getFrontendBaseUrl } from './utils/appUrl.js';
import authRoutes from './routes/auth.js';
import eventsRoutes from './routes/events.js';
import registrationsRoutes from './routes/registrations.js';
import usersRoutes from './routes/users.js';
import rewardsRoutes from './routes/rewards.js';
import dashboardRoutes from './routes/dashboard.js';
import newsletterRoutes from './routes/newsletter.js';
import './utils/initializeData.js'; // Initialize events data

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const origin = getFrontendBaseUrl();
app.use(cors({
  origin: origin,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root: so GET/HEAD https://your-api.vercel.app/ returns 200 (browsers and health checks)
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'ChibiBadminton API', health: '/health' });
});
app.head('/', (req, res) => res.status(200).end());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ChibiBadminton API is running' });
});

// Favicon handler
app.get('/favicon.ico', (_req, res) => res.status(204).end());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/registrations', registrationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/newsletter', newsletterRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Only listen when not running on Vercel (serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  });
}

export default app;
