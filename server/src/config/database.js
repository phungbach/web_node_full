import { randomUUID } from 'node:crypto';
import mysql from 'mysql2/promise';
import { env } from './env.js';

const requiredSettings = ['MYSQL_HOST', 'MYSQL_DATABASE', 'MYSQL_USER', 'MYSQL_PASSWORD'];
const missingSettings = requiredSettings.filter((name) => env[name] === undefined || env[name] === '');

if (missingSettings.length) {
  throw new Error(`Missing required MySQL configuration: ${missingSettings.join(', ')}`);
}
if (!env.JWT_SECRET) throw new Error('JWT_SECRET must be configured.');
if (Boolean(env.ADMIN_EMAIL) !== Boolean(env.ADMIN_PASSWORD_HASH)) {
  throw new Error('Configure both ADMIN_EMAIL and ADMIN_PASSWORD_HASH, or leave both unset.');
}
if (env.ADMIN_PASSWORD_HASH && !/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(env.ADMIN_PASSWORD_HASH)) {
  throw new Error('ADMIN_PASSWORD_HASH must be a bcrypt hash.');
}

export const pool = mysql.createPool({
  host: env.MYSQL_HOST,
  port: Number(env.MYSQL_PORT || 3306),
  database: env.MYSQL_DATABASE,
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: 'Z',
  decimalNumbers: true,
});

const schema = [
  `CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_categories_created_at (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    content LONGTEXT NOT NULL,
    thumbnail LONGTEXT NOT NULL,
    category_id VARCHAR(64) NULL,
    seo_title VARCHAR(500) NOT NULL,
    seo_description TEXT NOT NULL,
    keywords JSON NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'published',
    views BIGINT UNSIGNED NOT NULL DEFAULT 0,
    published_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_posts_created_at (created_at),
    INDEX idx_posts_status_published (status, published_at),
    INDEX idx_posts_category (category_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS registrations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(64) NOT NULL,
    course_type VARCHAR(32) NOT NULL DEFAULT 'unknown',
    area VARCHAR(255) NOT NULL,
    note TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'new',
    source VARCHAR(255) NOT NULL DEFAULT 'website',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_registrations_created_at (created_at),
    INDEX idx_registrations_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(320) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'admin',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS media (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    type VARCHAR(255) NOT NULL,
    size BIGINT UNSIGNED NOT NULL DEFAULT 0,
    url LONGTEXT NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_media_created_at (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS settings (
    id VARCHAR(64) PRIMARY KEY,
    settings_json JSON NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS analytics_events (
    id VARCHAR(64) PRIMARY KEY,
    event_key VARCHAR(512) NOT NULL UNIQUE,
    type VARCHAR(32) NOT NULL,
    visitor_id VARCHAR(128) NOT NULL,
    path VARCHAR(500) NOT NULL DEFAULT '',
    slug VARCHAR(180) NOT NULL DEFAULT '',
    date_key CHAR(10) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_analytics_type_date (type, date_key),
    INDEX idx_analytics_created_at (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS contacts (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(64) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'new',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_contacts_created_at (created_at),
    INDEX idx_contacts_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS quiz_questions (
    id VARCHAR(64) PRIMARY KEY,
    vehicle_type VARCHAR(32) NOT NULL DEFAULT 'car',
    license_type VARCHAR(16) NOT NULL DEFAULT 'B1',
    question TEXT NOT NULL,
    options JSON NOT NULL,
    correct_option TINYINT UNSIGNED NOT NULL,
    explanation TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'published',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_quiz_vehicle_status (vehicle_type, status),
    INDEX idx_quiz_created_at (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS backup_schedules (
    id TINYINT UNSIGNED PRIMARY KEY,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    frequency VARCHAR(16) NOT NULL DEFAULT 'daily',
    run_time CHAR(5) NOT NULL DEFAULT '02:00',
    weekday TINYINT UNSIGNED NOT NULL DEFAULT 1,
    month_day TINYINT UNSIGNED NOT NULL DEFAULT 1,
    last_run_key VARCHAR(32) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

export const initializeDatabase = async ({ seedAdmin = true } = {}) => {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    for (const statement of schema) await connection.query(statement);
    await connection.execute(
      `INSERT IGNORE INTO backup_schedules
        (id, enabled, frequency, run_time, weekday, month_day)
       VALUES (1, FALSE, 'daily', '02:00', 1, 1)`,
    );
    try {
      await connection.query('ALTER TABLE quiz_questions ADD COLUMN license_type VARCHAR(16) NOT NULL DEFAULT \'B1\' AFTER vehicle_type');
    } catch (error) {
      if (error?.code !== 'ER_DUP_FIELDNAME') throw error;
    }
    await connection.query("UPDATE quiz_questions SET license_type = 'A1' WHERE vehicle_type = 'motorbike' AND license_type = 'B1'");

    if (seedAdmin && env.ADMIN_EMAIL && env.ADMIN_PASSWORD_HASH) {
      await connection.execute(
        `INSERT IGNORE INTO users (id, name, email, password, role)
         VALUES (?, ?, ?, ?, 'admin')`,
        [randomUUID(), env.ADMIN_NAME, env.ADMIN_EMAIL, env.ADMIN_PASSWORD_HASH],
      );
    }
  } finally {
    connection.release();
  }
};

export const getDatabaseStatus = async () => {
  try {
    await pool.query('SELECT 1');
    return { connected: true, status: 'connected' };
  } catch {
    return { connected: false, status: 'disconnected' };
  }
};

export const closeDatabase = () => pool.end();
