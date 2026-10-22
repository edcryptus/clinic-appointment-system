import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { healthCheck, closePool } from './db/index.js';
import { errorHandler, notFound } from './middleware/errors.js';

// Routes
import servicesRouter from './routes/services.js';
import doctorsRouter from './routes/doctors.js';
import availabilityRouter from './routes/availability.js';
import appointmentsRouter from './routes/appointments.js';
import contactRouter from './routes/contact.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5174').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbHealthy = await healthCheck();
  const status = dbHealthy ? 200 : 503;
  res.status(status).json({
    status: dbHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    database: dbHealthy ? 'connected' : 'disconnected'
  });
});

// API routes
app.use('/services', servicesRouter);
app.use('/doctors', doctorsRouter);
app.use('/availability', availabilityRouter);
app.use('/appointments', appointmentsRouter);
app.use('/contactMessages', contactRouter);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Graceful shutdown
const shutdown = async () => {
  console.log('\nShutting down gracefully...');
  await closePool();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
app.listen(port, () => {
  console.log(`✓ Wellnest Medical Clinic Backend`);
  console.log(`✓ Server running on port ${port}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Health check: http://localhost:${port}/health`);
  console.log(`✓ CORS enabled for: ${allowedOrigins.join(', ')}`);
});
