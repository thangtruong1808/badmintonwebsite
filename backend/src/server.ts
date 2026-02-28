import dotenv from 'dotenv';
// Load environment variables FIRST before any other imports
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.js';
import { isOriginAllowed } from './utils/appUrl.js';
import authRoutes from './routes/auth.js';
import eventsRoutes from './routes/events.js';
import playSlotsRoutes from './routes/playSlots.js';
import registrationsRoutes from './routes/registrations.js';
import usersRoutes from './routes/users.js';
import rewardsRoutes from './routes/rewards.js';
import dashboardRoutes from './routes/dashboard.js';
import productsRoutes from './routes/products.js';
import newsletterRoutes from './routes/newsletter.js';
import galleryRoutes from './routes/gallery.js';
import newsRoutes from './routes/news.js';
import homepageBannersRoutes from './routes/homepageBanners.js';
import keyPersonsRoutes from './routes/keyPersons.js';
import uploadRoutes from './routes/upload.js';
import serviceOptionsRoutes from './routes/serviceOptions.js';
import contactRoutes from './routes/contact.js';
import serviceRequestsRoutes from './routes/serviceRequests.js';
import cronRoutes from './routes/cron.js';
import paymentsRoutes from './routes/payments.js';
import webhooksRoutes from './routes/webhooks.js';
import { seedPlaySlotsIfEmpty } from './utils/initializeData.js';
import { testConnection } from './db/connection.js';

// Test database connection on startup
testConnection().then(({ ok, message }) => {
  if (ok) {
    console.log('✅ Database connection successful');
    // Seed play_slots on startup if empty
    seedPlaySlotsIfEmpty().catch(() => {});
  } else {
    console.error('❌ Database connection failed:', message);
  }
}).catch((err) => {
  console.error('❌ Database connection error:', err);
});

const app = express();
const PORT = process.env.PORT || 3001;

// Handle OPTIONS preflight requests first
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

// Middleware – support multiple origins for CORS (e.g. Vercel production + preview)
app.use(cors({
  origin: true, // Allow all origins temporarily to debug
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(cookieParser());

// Request logging for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} from ${req.headers.origin || 'no-origin'}`);
  next();
});

// Webhook routes MUST be registered BEFORE express.json() for raw body parsing
app.use('/api/webhooks', webhooksRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root: so GET/HEAD https://your-api.vercel.app/ returns 200 (browsers and health checks)
app.get('/', (req, res) => {
  console.log('Root endpoint hit');
  res.json({ status: 'ok', message: 'ChibiBadminton API', health: '/health', timestamp: new Date().toISOString() });
});
app.head('/', (req, res) => res.status(200).end());

// Simple ping endpoint (no database, for debugging)
app.get('/ping', (req, res) => {
  res.json({ pong: true, timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    res.json({ 
      status: dbStatus.ok ? 'ok' : 'degraded',
      message: 'ChibiBadminton API is running',
      database: dbStatus.ok ? 'connected' : dbStatus.message,
    });
  } catch (err) {
    console.error('Health check error:', err);
    res.status(500).json({ 
      status: 'error',
      message: 'Health check failed',
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

// Favicon handler
app.get('/favicon.ico', (_req, res) => res.status(204).end());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/play-slots', playSlotsRoutes);
app.use('/api/registrations', registrationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/homepage-banners', homepageBannersRoutes);
app.use('/api/key-persons', keyPersonsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/service-options', serviceOptionsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/service-requests', serviceRequestsRoutes);
app.use('/api/cron', cronRoutes);
app.use('/api/payments', paymentsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Global error handlers for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Only listen when not running on Vercel (serverless)
if (!process.env.VERCEL) {
  // Bind to 0.0.0.0 for Railway/Docker compatibility
  const HOST = '0.0.0.0';
  const server = app.listen(Number(PORT), HOST, () => {
    const railwayUrl = process.env.RAILWAY_PUBLIC_DOMAIN;
    const baseUrl = railwayUrl 
      ? `https://${railwayUrl}` 
      : `http://localhost:${PORT}`;
    console.log(`🚀 Server is running on ${baseUrl}`);
    console.log(`📡 API endpoints available at ${baseUrl}/api`);
    console.log(`🔌 Listening on ${HOST}:${PORT}`);
    if (railwayUrl) {
      console.log(`🌐 Environment: Production (Railway)`);
    } else {
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    }
  });

  server.on('error', (err) => {
    console.error('❌ Server error:', err);
  });
}

export default app;
