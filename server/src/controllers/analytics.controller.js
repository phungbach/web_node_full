import { getDashboardStats } from '../services/analytics.service.js';

export const getAnalyticsOverview = async (req, res, next) => {
  try {
    const stats = await getDashboardStats();
    res.json({ success: true, message: 'Analytics overview', data: stats });
  } catch (error) {
    next(error);
  }
};
