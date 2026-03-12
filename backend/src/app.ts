import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js"
import { paperRouter } from "./routes/paper.routes.js";
import { analyticsRouter } from "./routes/analytics.routes.js";
import { authRouter } from './routes/auth.routes.js';

// Load environment variables
dotenv.config();

const app: Application = express();

// 1. Database Connection
connectDB();

// 2. Middlewares
app.use(helmet()); // Security headers
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(",") ?? "*",
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json()); // Body parser for JSON
app.use(express.urlencoded({ extended: true }));

// 3. Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// 4. API Routes
app.use('/api/auth', authRouter);
app.use('/api/papers', paperRouter);
 app.use("/api/analytics", analyticsRouter);

// ── 404 & global error handling ───────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\x1b[35m%s\x1b[0m`, `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app;