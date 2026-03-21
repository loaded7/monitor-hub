import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import authRoutes from './routes/authRoutes';
import checkRoutes from './routes/checkRoutes';
import userRoutes from './routes/userRoutes';
import statsRoutes from './routes/statsRoutes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json());

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/checks', checkRoutes);
app.use('/api/user', userRoutes);
app.use('/api/stats', statsRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
  });
});

// Error handler
app.use((err: any, req: Request, res: Response) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();

    // Inicializar scheduler
    const { SchedulerService } = await import('./services/SchedulerService');
    await SchedulerService.initialize();
    await SchedulerService.scheduleAllChecks();

    const server = app.listen(PORT, () => {
      console.log('✅ Server running on port ' + PORT);
      console.log('📝 API: http://localhost:' + PORT);
      console.log('🏥 Health: http://localhost:' + PORT + '/api/health');
      console.log('🔐 Auth: http://localhost:' + PORT + '/api/auth/register');
      console.log('📅 Job scheduler started');
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;