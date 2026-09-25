import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';
import { env } from '../config/env.js';

const adminAuthFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../data/admin-auth.json');
const adminIdentity = {
  email: env.ADMIN_EMAIL || '',
  name: env.ADMIN_NAME || 'Quản trị viên',
  role: 'admin',
};

const failMissingAdminConfig = () => {
  const error = new Error('Thiếu cấu hình quản trị. Vui lòng thiết lập ADMIN_EMAIL và ADMIN_PASSWORD_HASH trong biến môi trường.');
  error.statusCode = 500;
  error.code = 'ADMIN_AUTH_CONFIG_MISSING';
  throw error;
};

const ensureAdminConfig = () => {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD_HASH) {
    failMissingAdminConfig();
  }
};

const loadLocalAdmin = () => {
  ensureAdminConfig();

  const baseAdmin = {
    email: adminIdentity.email,
    name: adminIdentity.name,
    role: adminIdentity.role,
    passwordHash: env.ADMIN_PASSWORD_HASH,
  };

  try {
    if (fs.existsSync(adminAuthFile)) {
      const parsed = JSON.parse(fs.readFileSync(adminAuthFile, 'utf8'));
      if (parsed?.passwordHash && typeof parsed.passwordHash === 'string') {
        return {
          ...baseAdmin,
          ...parsed,
          passwordHash: parsed.passwordHash,
          email: parsed.email || baseAdmin.email,
          name: parsed.name || baseAdmin.name,
          role: parsed.role || baseAdmin.role,
        };
      }
    }
  } catch {
    // ignore and fall back to env hash
  }

  return baseAdmin;
};

let localAdmin = loadLocalAdmin();

const persistLocalAdmin = () => {
  try {
    fs.mkdirSync(path.dirname(adminAuthFile), { recursive: true });
    fs.writeFileSync(adminAuthFile, JSON.stringify({
      email: localAdmin.email,
      name: localAdmin.name,
      role: localAdmin.role,
      passwordHash: localAdmin.passwordHash,
    }, null, 2));
  } catch {
    // ignore
  }
};

const ensureMongoAdmin = async () => {
  ensureAdminConfig();
  let admin = await User.findOne({ email: adminIdentity.email, role: 'admin' });
  if (!admin) {
    admin = await User.create({
      name: adminIdentity.name,
      email: adminIdentity.email,
      password: env.ADMIN_PASSWORD_HASH,
      role: 'admin',
    });
  }
  return admin;
};

const formatUser = (user) => ({
  id: user._id || user.id,
  name: user.name,
  email: user.email,
  role: user.role || 'admin',
});

export const loginAdmin = async ({ email, password }) => {
  ensureAdminConfig();

  if (mongoose.connection.readyState === 1) {
    const user = await ensureMongoAdmin();
    const ok = email === user.email && await bcrypt.compare(password, user.password);
    if (!ok) {
      return { success: false, message: 'Sai tài khoản hoặc mật khẩu.', data: null };
    }

    const token = jwt.sign({ username: user.email, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' });
    return { success: true, message: 'Đăng nhập thành công.', data: { token, user: formatUser(user) } };
  }

  const ok = email === localAdmin.email && await bcrypt.compare(password, localAdmin.passwordHash);
  if (!ok) return { success: false, message: 'Sai tài khoản hoặc mật khẩu.', data: null };

  const token = jwt.sign({ username: localAdmin.email, role: localAdmin.role }, env.JWT_SECRET, { expiresIn: '7d' });
  return { success: true, message: 'Đăng nhập thành công.', data: { token, user: formatUser(localAdmin) } };
};

export const changeAdminPassword = async ({ currentPassword, newPassword }) => {
  ensureAdminConfig();

  if (!currentPassword || !newPassword) {
    return { success: false, message: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.' };
  }

  if (newPassword.length < 8) {
    return { success: false, message: 'Mật khẩu mới phải có ít nhất 8 ký tự.' };
  }

  if (currentPassword === newPassword) {
    return { success: false, message: 'Mật khẩu mới phải khác mật khẩu hiện tại.' };
  }

  if (mongoose.connection.readyState === 1) {
    const user = await ensureMongoAdmin();
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return { success: false, message: 'Mật khẩu hiện tại không đúng.' };
    const password = await bcrypt.hash(newPassword, 10);
    const updated = await User.findByIdAndUpdate(user._id, { password }, { new: true });
    return { success: true, message: 'Đã cập nhật mật khẩu quản trị.', data: formatUser(updated) };
  }

  const ok = await bcrypt.compare(currentPassword, localAdmin.passwordHash);
  if (!ok) return { success: false, message: 'Mật khẩu hiện tại không đúng.' };

  localAdmin = {
    ...localAdmin,
    passwordHash: await bcrypt.hash(newPassword, 10),
  };
  persistLocalAdmin();
  return { success: true, message: 'Đã cập nhật mật khẩu quản trị.', data: formatUser(localAdmin) };
};
