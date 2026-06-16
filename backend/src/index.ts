import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';

// Load Env variables
dotenv.config();

// Middlewares and Handlers
import { initSocket } from './socket/socket.handler';
import { errorHandler } from './middlewares/error.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import examRoutes from './routes/exam.routes';
import questionRoutes from './routes/question.routes';
import resultRoutes from './routes/result.routes';
import proctorRoutes from './routes/proctor.routes';
import analyticsRoutes from './routes/analytics.routes';
import userRoutes from './routes/user.routes';

const app = express();
const httpServer = createServer(app);

// Initialize WebSockets
initSocket(httpServer);

// Configure CORS
app.use(
  cors({
    origin: '*', // For demo compatibility. In prod, lock this to the frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' })); // Allow larger payloads for base64 screenshots
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check API
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Register Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/proctor', proctorRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('SecurePariksha API Engine is online.');
});

// Error handling middleware
app.use(errorHandler as any);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`SECUREPARIKSHA API RUNNING ON PORT ${PORT}`);
  console.log(`========================================`);
});
