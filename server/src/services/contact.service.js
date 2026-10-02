import { randomUUID } from 'node:crypto';
import { pool } from '../config/database.js';

const fromRow = (row) => ({
  _id: row.id,
  name: row.name,
  phone: row.phone,
  message: row.message,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const createContactRecord = async ({ name, phone, message }) => {
  const id = randomUUID();
  await pool.execute(
    'INSERT INTO contacts (id, name, phone, message, status) VALUES (?, ?, ?, ?, ?)',
    [id, name, phone, message, 'new'],
  );
  const [rows] = await pool.execute('SELECT * FROM contacts WHERE id = ?', [id]);
  return fromRow(rows[0]);
};

export const getContactRecords = async () => {
  const [rows] = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
  return rows.map(fromRow);
};
