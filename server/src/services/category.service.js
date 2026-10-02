import { randomUUID } from 'node:crypto';
import { pool } from '../config/database.js';

const fromRow = (row) => row && ({
  _id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getCategories = async () => {
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY created_at DESC');
  return rows.map(fromRow);
};

export const createCategory = async ({ name, slug, description = '' }) => {
  const id = randomUUID();
  await pool.execute(
    'INSERT INTO categories (id, name, slug, description) VALUES (?, ?, ?, ?)',
    [id, name, slug, description],
  );
  const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [id]);
  return fromRow(rows[0]);
};

export const updateCategory = async (id, payload) => {
  const allowed = ['name', 'slug', 'description'];
  const entries = Object.entries(payload).filter(([key]) => allowed.includes(key));
  if (entries.length) {
    const columns = { name: 'name', slug: 'slug', description: 'description' };
    await pool.execute(
      `UPDATE categories SET ${entries.map(([key]) => `${columns[key]} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?`,
      [...entries.map(([, value]) => value), id],
    );
  }
  const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [id]);
  return fromRow(rows[0]);
};

export const deleteCategory = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [id]);
  if (!rows.length) return null;
  await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
  return fromRow(rows[0]);
};
