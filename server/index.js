import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';
import { auditLogger } from './middleware/logger.js';

const app = express();

// Security Rate Limiter (200 requests per 15 mins)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('combined'));
app.use(auditLogger);
app.use(apiLimiter);

// Mount routes to support both direct and /api prefixed routes (Vercel Serverless & Express server)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Health check & root endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    system: 'V-TACS (Venom Treatment & Ambulance Coordination System)',
    timestamp: new Date().toISOString()
  });
});

const PORT = config.port || 5000;
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` V-TACS Backend Server Running on Port ${PORT}`);
    console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Health Check: http://localhost:${PORT}/health`);
    console.log(`=======================================================`);
  });
}

export default app;
