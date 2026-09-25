import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.PORT || 5001,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hoclaixetq',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH || '',
  ADMIN_NAME: process.env.ADMIN_NAME || 'Quản trị viên',
  GA_PROPERTY_ID: process.env.GA_PROPERTY_ID || '',
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
};
