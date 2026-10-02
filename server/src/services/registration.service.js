import { randomUUID } from 'node:crypto';
import { pool } from '../config/database.js';

const fromRow = (row) => row && ({
  _id: row.id,
  name: row.name,
  phone: row.phone,
  courseType: row.course_type,
  area: row.area,
  note: row.note,
  status: row.status,
  source: row.source,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const createRegistration = async (payload) => {
  const id = randomUUID();
  await pool.execute(
    `INSERT INTO registrations (id, name, phone, course_type, area, note, status, source)
     VALUES (?, ?, ?, ?, ?, ?, 'new', 'website')`,
    [id, payload.name, payload.phone, payload.courseType || 'unknown', payload.area || '', payload.note || ''],
  );
  const [rows] = await pool.execute('SELECT * FROM registrations WHERE id = ?', [id]);
  return fromRow(rows[0]);
};

export const getRegistrations = async () => {
  const [rows] = await pool.query('SELECT * FROM registrations ORDER BY created_at DESC');
  return rows.map(fromRow);
};

export const updateRegistrationStatus = async (id, status) => {
  await pool.execute('UPDATE registrations SET status = ?, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?', [status, id]);
  const [rows] = await pool.execute('SELECT * FROM registrations WHERE id = ?', [id]);
  return fromRow(rows[0]);
};

export const deleteRegistration = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM registrations WHERE id = ?', [id]);
  if (!rows.length) return null;
  await pool.execute('DELETE FROM registrations WHERE id = ?', [id]);
  return fromRow(rows[0]);
};

export const getRegistrationStats = async () => {
  const registrations = await getRegistrations();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const days = 7;
  const dailyNewRegistrations = Array.from({ length: days }, (_, index) => {
    const date = new Date(startOfToday);
    date.setDate(startOfToday.getDate() - (days - 1 - index));
    return { date, count: 0 };
  });

  registrations.forEach((item) => {
    const createdAt = new Date(item.createdAt);
    dailyNewRegistrations.forEach((bucket) => {
      const nextDate = new Date(bucket.date);
      nextDate.setDate(bucket.date.getDate() + 1);
      if (createdAt >= bucket.date && createdAt < nextDate) bucket.count += 1;
    });
  });

  const todayNewCount = registrations.filter((item) => new Date(item.createdAt) >= startOfToday).length;
  const unprocessedCount = registrations.filter((item) => (item.status || 'new') === 'new').length;
  return {
    totalRegistrations: registrations.length,
    unprocessedCount,
    todayNewCount,
    dailyNewRegistrations: dailyNewRegistrations.map((bucket) => ({
      date: [bucket.date.getFullYear(), String(bucket.date.getMonth() + 1).padStart(2, '0'), String(bucket.date.getDate()).padStart(2, '0')].join('-'),
      count: bucket.count,
    })),
  };
};
