import { getDatabaseStatus } from '../config/database.js';
import { getDashboardStats, recordPostView, recordVisitor } from '../services/analytics.service.js';

export const getAnalyticsOverview = async (req, res, next) => {
  try {
    const stats = await getDashboardStats();
    res.json({ success: true, message: 'Analytics overview', data: stats });
  } catch (error) {
    next(error);
  }
};

export const databaseStatus = async (req, res) => {
  const database = await getDatabaseStatus();
  res.status(database.connected ? 200 : 503).json({
    success: database.connected,
    data: { ...database, checkedAt: new Date().toISOString() },
  });
};

export const trackVisitor = async (req, res, next) => {
  try {
    await recordVisitor(req.body || {});
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const trackPostView = async (req, res, next) => {
  try {
    const result = await recordPostView(req.body || {});
    if (result.notFound) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: { recorded: result.recorded, views: result.post?.views } });
  } catch (error) {
    next(error);
  }
};
