import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { getDatabaseStatus } from './config/database.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import blogRoutes from './routes/blog.routes.js';
import categoryRoutes from './routes/category.routes.js';
import registrationRoutes from './routes/registration.routes.js';
import contactRoutes from './routes/contact.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import mediaRoutes from './routes/media.routes.js';
import backupRoutes from './routes/backup.routes.js';
import restoreRoutes from './routes/restore.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import sitemapRoutes from './routes/sitemap.routes.js';
import { sitemap } from './controllers/sitemap.controller.js';

const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/api/health', async (req, res) => {
  const database = await getDatabaseStatus();
  res.status(database.connected ? 200 : 503).json({
    success: database.connected,
    message: database.connected ? 'Server and MySQL are running' : 'MySQL is unavailable',
    data: { status: database.connected ? 'ok' : 'degraded', database: database.status },
  });
});
app.get('/sitemap.xml', sitemap);

app.use('/api/auth', authRoutes);
app.use('/api/posts', blogRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/backups', backupRoutes);
app.use('/api/restore', restoreRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/settings/sitemap', sitemapRoutes);

app.use(errorMiddleware);

export default app;
