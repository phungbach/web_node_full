import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import { env } from '../config/env.js';

const formatUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role || 'admin',
});

export const loginAdmin = async ({ email, password }) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ? AND role = ?', [email, 'admin']);
  const user = rows[0];
  const validPassword = user && typeof password === 'string' && await bcrypt.compare(password, user.password);
  if (!validPassword) return { success: false, message: 'Sai tài khoản hoặc mật khẩu.', data: null };

  const token = jwt.sign({ username: user.email, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' });
  return { success: true, message: 'Đăng nhập thành công.', data: { token, user: formatUser(user) } };
};

export const changeAdminPassword = async ({ currentPassword, newPassword, email }) => {
  if (!currentPassword || !newPassword) {
    return { success: false, message: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.' };
  }
  if (newPassword.length < 8) {
    return { success: false, message: 'Mật khẩu mới phải có ít nhất 8 ký tự.' };
  }
  if (currentPassword === newPassword) {
    return { success: false, message: 'Mật khẩu mới phải khác mật khẩu hiện tại.' };
  }

  const adminEmail = email || env.ADMIN_EMAIL;
  if (!adminEmail) return { success: false, message: 'Không tìm thấy tài khoản quản trị.' };
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ? AND role = ?', [adminEmail, 'admin']);
  const user = rows[0];
  if (!user || !await bcrypt.compare(currentPassword, user.password)) {
    return { success: false, message: 'Mật khẩu hiện tại không đúng.' };
  }

  const password = await bcrypt.hash(newPassword, 10);
  await pool.execute('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?', [password, user.id]);
  return { success: true, message: 'Đã cập nhật mật khẩu quản trị.', data: formatUser({ ...user, password }) };
};
