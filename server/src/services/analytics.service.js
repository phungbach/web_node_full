import { randomUUID } from 'node:crypto';
import { pool } from '../config/database.js';
import { getPosts, incrementPostView } from './blog.service.js';
import { getRegistrationStats } from './registration.service.js';

const dateKey = (date = new Date()) => date.toISOString().slice(0, 10);
const validVisitorId = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{8,100}$/.test(value);
const validPath = (value) => typeof value === 'string' && value.length <= 500;

const recordEvent = async ({ type, visitorId, path = '', slug = '' }) => {
  const today = dateKey();
  const key = type === 'visitor' ? `${type}:${visitorId}:${randomUUID()}` : `${type}:${visitorId}:${slug}:${today}`;
  try {
    await pool.execute(
      `INSERT INTO analytics_events (id, event_key, type, visitor_id, path, slug, date_key)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [randomUUID(), key, type, visitorId, path, slug, today],
    );
    return true;
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') return false;
    throw error;
  }
};

export const recordVisitor = async ({ visitorId, path }) => {
  if (!validVisitorId(visitorId) || !validPath(path) || !path.startsWith('/')) {
    const error = new Error('Dữ liệu lượt truy cập không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }
  return recordEvent({ type: 'visitor', visitorId, path });
};

export const recordPostView = async ({ visitorId, slug }) => {
  if (!validVisitorId(visitorId) || typeof slug !== 'string' || !/^[a-z0-9-]{1,180}$/.test(slug)) {
    const error = new Error('Dữ liệu lượt xem bài viết không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }
  const recorded = await recordEvent({ type: 'post_view', visitorId, slug });
  if (!recorded) return { recorded: false };
  const post = await incrementPostView(slug);
  if (!post) return { recorded: false, notFound: true };
  return { recorded: true, post };
};

export const getDashboardStats = async () => {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 29);
  const start = dateKey(since);
  const [eventsResult, posts, registrations] = await Promise.all([
    pool.execute('SELECT type, date_key AS dateKey FROM analytics_events WHERE date_key >= ?', [start]),
    getPosts(),
    getRegistrationStats(),
  ]);
  const [events] = eventsResult;
  const dailyVisitors = new Map();
  const dailyPostViews = new Map();
  events.filter((event) => event.dateKey >= start).forEach((event) => {
    const target = event.type === 'visitor' ? dailyVisitors : dailyPostViews;
    target.set(event.dateKey, (target.get(event.dateKey) || 0) + 1);
  });
  const chart = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(since);
    date.setUTCDate(since.getUTCDate() + index);
    const key = dateKey(date);
    return { date: key, visitors: dailyVisitors.get(key) || 0, postViews: dailyPostViews.get(key) || 0 };
  });
  return {
    posts: posts.filter((post) => post.status === 'published').length,
    totalVisitors: chart.reduce((sum, day) => sum + day.visitors, 0),
    totalPostViews: chart.reduce((sum, day) => sum + day.postViews, 0),
    dailyAnalytics: chart,
    message: 'Dữ liệu lượt truy cập và lượt xem bài viết trong 30 ngày gần nhất.',
    ...registrations,
  };
};
