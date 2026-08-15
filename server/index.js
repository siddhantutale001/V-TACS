import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';
import { auditLogger } from './middleware/logger.js';

const app = express();

// Security Rate Limiter (100 requests per 15 mins)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined'));
app.use(auditLogger);
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Health check & root endpoints
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'V-TACS Backend API Server',
    endpoints: {
      health: '/health',
      hospitals: '/api/hospitals',
      ambulances: '/api/ambulances',
      triageMatch: 'POST /api/triage/match',
      voiceParse: 'POST /api/triage/voice-parse',
      dispatchExecute: 'POST /api/dispatch/execute'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    system: 'V-TACS (Venom Treatment & Ambulance Coordination System)',
    timestamp: new Date().toISOString()
  });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` V-TACS Backend Server Running on Port ${PORT}`);
  console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Health Check: http://localhost:${PORT}/health`);
  console.log(`=======================================================`);
});

export default app;
