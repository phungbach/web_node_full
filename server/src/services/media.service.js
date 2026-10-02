import { randomUUID } from 'node:crypto';
import { pool } from '../config/database.js';

const fromRow = (row) => row && ({
  _id: row.id,
  name: row.name,
  type: row.type,
  size: row.size,
  url: row.url,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getMedia = async () => {
  const [rows] = await pool.query('SELECT * FROM media ORDER BY created_at DESC');
  return rows.map(fromRow);
};

export const createMedia = async ({ name, type, size, url }) => {
  const id = randomUUID();
  await pool.execute('INSERT INTO media (id, name, type, size, url) VALUES (?, ?, ?, ?, ?)', [id, name, type, size, url]);
  const [rows] = await pool.execute('SELECT * FROM media WHERE id = ?', [id]);
  return fromRow(rows[0]);
};

export const deleteMedia = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM media WHERE id = ?', [id]);
  if (!rows.length) return null;
  await pool.execute('DELETE FROM media WHERE id = ?', [id]);
  return fromRow(rows[0]);
};
