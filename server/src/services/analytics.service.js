import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getPosts } from './blog.service.js';
import { getRegistrationStats } from './registration.service.js';
import { env } from '../config/env.js';

const getPublishedPostCount = async () => {
  const posts = await getPosts();
  return posts.filter((post) => post.status === 'published').length;
};

const getGoogleAnalyticsMetrics = async () => {
  if (!env.GA_PROPERTY_ID || !env.GOOGLE_APPLICATION_CREDENTIALS) {
    return {
      connected: false,
      activeUsers: null,
      screenPageViews: null,
      message: 'Chưa cấu hình GA4 Data API.',
    };
  }

  try {
    const analyticsClient = new BetaAnalyticsDataClient();
    const [response] = await analyticsClient.runReport({
      property: `properties/${env.GA_PROPERTY_ID}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
    });
    const values = response.rows?.[0]?.metricValues || [];

    return {
      connected: true,
      activeUsers: Number(values[0]?.value || 0),
      screenPageViews: Number(values[1]?.value || 0),
      message: 'Dữ liệu 30 ngày gần nhất từ Google Analytics 4.',
    };
  } catch (error) {
    return {
      connected: false,
      activeUsers: null,
      screenPageViews: null,
      message: 'Không thể đọc dữ liệu GA4. Kiểm tra Property ID và quyền service account.',
    };
  }
};

export const getDashboardStats = async () => ({
  posts: await getPublishedPostCount(),
  ...(await getGoogleAnalyticsMetrics()),
  ...(await getRegistrationStats()),
});