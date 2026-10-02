import { createWriteStream } from 'node:fs';
import { mkdir, readFile, readdir, rename, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { ZipArchive } from 'archiver';
import unzipper from 'unzipper';
import { env } from '../config/env.js';
import { pool } from '../config/database.js';

const tables = ['categories', 'posts', 'registrations', 'users', 'media', 'settings', 'analytics_events', 'contacts', 'quiz_questions', 'backup_schedules'];
const requiredBackupTables = tables.filter((table) => !['quiz_questions', 'backup_schedules'].includes(table));
const restoreTables = [...tables].reverse();
const maxBackups = 5;
const backupDirectory = path.resolve(process.cwd(), env.BACKUP_DIR);
const filenamePattern = /^website-backup-\d{8}-\d{6}-[a-f0-9]{8}\.zip$/;

const getMetadata = async (filename) => {
  const filePath = path.join(backupDirectory, filename);
  const fileStats = await stat(filePath);
  return {
    filename,
    size: fileStats.size,
    createdAt: fileStats.birthtime.toISOString(),
    destination: 'server',
  };
};

const getDatabaseSnapshot = async () => {
  const snapshot = {};
  for (const table of tables) {
    const [rows] = await pool.query(`SELECT * FROM \`${table}\``);
    snapshot[table] = rows;
  }
  return snapshot;
};

const dateTimeValue = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('Backup chứa ngày không hợp lệ.');
  const pad = (part) => String(part).padStart(2, '0');
  const milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}.${milliseconds}`;
};

const jsonValue = (value) => (typeof value === 'string' ? value : JSON.stringify(value ?? {}));
const keywordValue = (value) => (typeof value === 'string' ? value : JSON.stringify(value ?? []));

const restoreRows = {
  categories: {
    columns: ['id', 'name', 'slug', 'description', 'created_at', 'updated_at'],
    values: (row) => [row.id, row.name, row.slug, row.description, dateTimeValue(row.created_at), dateTimeValue(row.updated_at)],
  },
  posts: {
    columns: ['id', 'title', 'slug', 'excerpt', 'content', 'thumbnail', 'category_id', 'seo_title', 'seo_description', 'keywords', 'status', 'views', 'published_at', 'created_at', 'updated_at'],
    values: (row) => [row.id, row.title, row.slug, row.excerpt, row.content, row.thumbnail, row.category_id, row.seo_title, row.seo_description, keywordValue(row.keywords), row.status, row.views, dateTimeValue(row.published_at), dateTimeValue(row.created_at), dateTimeValue(row.updated_at)],
  },
  registrations: {
    columns: ['id', 'name', 'phone', 'course_type', 'area', 'note', 'status', 'source', 'created_at', 'updated_at'],
    values: (row) => [row.id, row.name, row.phone, row.course_type, row.area, row.note, row.status, row.source, dateTimeValue(row.created_at), dateTimeValue(row.updated_at)],
  },
  users: {
    columns: ['id', 'name', 'email', 'password', 'role', 'created_at', 'updated_at'],
    values: (row) => [row.id, row.name, row.email, row.password, row.role, dateTimeValue(row.created_at), dateTimeValue(row.updated_at)],
  },
  media: {
    columns: ['id', 'name', 'type', 'size', 'url', 'created_at', 'updated_at'],
    values: (row) => [row.id, row.name, row.type, row.size, row.url, dateTimeValue(row.created_at), dateTimeValue(row.updated_at)],
  },
  settings: {
    columns: ['id', 'settings_json', 'created_at', 'updated_at'],
    values: (row) => [row.id, jsonValue(row.settings_json), dateTimeValue(row.created_at), dateTimeValue(row.updated_at)],
  },
  analytics_events: {
    columns: ['id', 'event_key', 'type', 'visitor_id', 'path', 'slug', 'date_key', 'created_at', 'updated_at'],
    values: (row) => [row.id, row.event_key, row.type, row.visitor_id, row.path, row.slug, row.date_key, dateTimeValue(row.created_at), dateTimeValue(row.updated_at)],
  },
  contacts: {
    columns: ['id', 'name', 'phone', 'message', 'status', 'created_at', 'updated_at'],
    values: (row) => [row.id, row.name, row.phone, row.message, row.status, dateTimeValue(row.created_at), dateTimeValue(row.updated_at)],
  },
  quiz_questions: {
    columns: ['id', 'vehicle_type', 'license_type', 'question', 'options', 'correct_option', 'explanation', 'status', 'created_at', 'updated_at'],
    values: (row) => [row.id, row.vehicle_type, row.license_type || (row.vehicle_type === 'motorbike' ? 'A1' : 'B1'), row.question, keywordValue(row.options), row.correct_option, row.explanation, row.status, dateTimeValue(row.created_at), dateTimeValue(row.updated_at)],
  },
  backup_schedules: {
    columns: ['id', 'enabled', 'frequency', 'run_time', 'weekday', 'month_day', 'last_run_key', 'created_at', 'updated_at'],
    values: (row) => [row.id, row.enabled, row.frequency, row.run_time, row.weekday, row.month_day, row.last_run_key, dateTimeValue(row.created_at), dateTimeValue(row.updated_at)],
  },
};

const parseBackupBuffer = async (buffer) => {
  let directory;
  try {
    directory = await unzipper.Open.buffer(buffer);
  } catch {
    const error = new Error('File restore không phải là ZIP hợp lệ.');
    error.statusCode = 400;
    throw error;
  }

  const manifestEntry = directory.files.find((entry) => entry.path === 'manifest.json');
  const databaseEntry = directory.files.find((entry) => entry.path === 'database.json');
  if (!manifestEntry || !databaseEntry) {
    const error = new Error('Gói restore thiếu manifest.json hoặc database.json.');
    error.statusCode = 400;
    throw error;
  }

  let manifest;
  let snapshot;
  try {
    manifest = JSON.parse((await manifestEntry.buffer()).toString('utf8'));
    snapshot = JSON.parse((await databaseEntry.buffer()).toString('utf8'));
  } catch {
    const error = new Error('Dữ liệu trong gói restore không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }

  if (manifest.format !== 1 || !Array.isArray(manifest.tables) || !requiredBackupTables.every((table) => manifest.tables.includes(table))) {
    const error = new Error('Phiên bản hoặc cấu trúc gói restore không được hỗ trợ.');
    error.statusCode = 400;
    throw error;
  }
  if (requiredBackupTables.some((table) => !Array.isArray(snapshot[table]))) {
    const error = new Error('Gói restore thiếu dữ liệu của một hoặc nhiều bảng.');
    error.statusCode = 400;
    throw error;
  }
  if (!Array.isArray(snapshot.quiz_questions)) snapshot.quiz_questions = [];
  if (!Array.isArray(snapshot.backup_schedules)) snapshot.backup_schedules = [];
  return snapshot;
};

const restoreSnapshot = async (snapshot) => {
  const connection = await pool.getConnection();
  const counts = {};
  try {
    await connection.beginTransaction();
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of restoreTables) await connection.query(`DELETE FROM \`${table}\``);
    for (const table of tables) {
      const definition = restoreRows[table];
      const placeholders = definition.columns.map(() => '?').join(', ');
      const statement = `INSERT INTO \`${table}\` (${definition.columns.map((column) => `\`${column}\``).join(', ')}) VALUES (${placeholders})`;
      for (const row of snapshot[table]) {
        await connection.execute(statement, definition.values(row));
      }
      counts[table] = snapshot[table].length;
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    try {
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (restoreConstraintError) {
      console.error(restoreConstraintError);
    }
    throw error;
  } finally {
    connection.release();
  }
  return counts;
};

const writeZip = (filePath, snapshot, manifest) => new Promise((resolve, reject) => {
  const output = createWriteStream(filePath);
  const archive = new ZipArchive({ zlib: { level: 9 } });

  output.on('close', resolve);
  output.on('error', reject);
  archive.on('error', reject);
  archive.pipe(output);
  archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });
  archive.append(
    'This backup contains MySQL application data. Environment variables and source credentials are intentionally excluded.\n',
    { name: 'README.txt' },
  );
  archive.append(JSON.stringify(snapshot, null, 2), { name: 'database.json' });
  archive.finalize().catch(reject);
});

const assertSafeFilename = (filename) => {
  if (typeof filename !== 'string' || !filenamePattern.test(filename)) {
    const error = new Error('Tên gói backup không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }
};

export const createBackup = async ({ destination = 'server' } = {}) => {
  if (!['server', 'download'].includes(destination)) {
    const error = new Error('Nơi lưu backup không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }

  await mkdir(backupDirectory, { recursive: true, mode: 0o700 });
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replaceAll('-', '');
  const timePart = now.toISOString().slice(11, 19).replaceAll(':', '');
  const filename = `website-backup-${datePart}-${timePart}-${randomUUID().slice(0, 8)}.zip`;
  const temporaryPath = path.join(backupDirectory, `.${filename}.tmp`);
  const filePath = path.join(backupDirectory, filename);
  const snapshot = await getDatabaseSnapshot();
  const manifest = {
    format: 1,
    createdAt: now.toISOString(),
    database: env.MYSQL_DATABASE,
    tables,
    rowCounts: Object.fromEntries(tables.map((table) => [table, snapshot[table].length])),
  };

  try {
    await writeZip(temporaryPath, snapshot, manifest);
    await rename(temporaryPath, filePath);
  } catch (error) {
    try {
      await rm(temporaryPath, { force: true });
    } catch {
      console.error(`Không thể dọn file backup tạm: ${temporaryPath}`);
    }
    throw error;
  }

  const metadata = await getMetadata(filename);
  if (destination === 'server') await pruneBackups();
  return destination === 'download'
    ? { destination, filename, path: filePath, metadata }
    : { destination, metadata };
};

const getStoredBackups = async () => {
  await mkdir(backupDirectory, { recursive: true, mode: 0o700 });
  const entries = await readdir(backupDirectory, { withFileTypes: true });
  const backups = [];
  for (const entry of entries) {
    if (!entry.isFile() || !filenamePattern.test(entry.name)) continue;
    backups.push(await getMetadata(entry.name));
  }
  return backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const pruneBackups = async () => {
  const backups = await getStoredBackups();
  const expiredBackups = backups.slice(maxBackups);
  await Promise.all(expiredBackups.map(async (backup) => {
    await rm(path.join(backupDirectory, backup.filename), { force: true });
  }));
};

export const listBackups = async () => {
  await pruneBackups();
  return getStoredBackups();
};

export const getBackupPath = async (filename) => {
  assertSafeFilename(filename);
  const filePath = path.join(backupDirectory, filename);
  try {
    await stat(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      error.statusCode = 404;
      error.message = 'Không tìm thấy gói backup.';
    }
    throw error;
  }
  return filePath;
};

export const deleteBackup = async (filename) => {
  const filePath = await getBackupPath(filename);
  const metadata = await getMetadata(filename);
  await rm(filePath);
  return metadata;
};

export const restoreBackupFromBuffer = async (buffer) => {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    const error = new Error('Chưa chọn file backup để restore.');
    error.statusCode = 400;
    throw error;
  }
  const snapshot = await parseBackupBuffer(buffer);
  return restoreSnapshot(snapshot);
};

export const restoreBackupFromServer = async (filename) => {
  const filePath = await getBackupPath(filename);
  return restoreBackupFromBuffer(await readFile(filePath));
};

const scheduleDefaults = {
  enabled: false,
  frequency: 'daily',
  runTime: '02:00',
  weekday: 1,
  monthDay: 1,
  lastRunKey: null,
};

const normalizeSchedule = (row) => ({
  enabled: Boolean(row?.enabled),
  frequency: row?.frequency || scheduleDefaults.frequency,
  runTime: row?.run_time || scheduleDefaults.runTime,
  weekday: Number(row?.weekday ?? scheduleDefaults.weekday),
  monthDay: Number(row?.month_day ?? scheduleDefaults.monthDay),
  lastRunKey: row?.last_run_key || null,
  updatedAt: row?.updated_at || null,
});

const validateSchedule = (payload) => {
  const frequency = payload.frequency || scheduleDefaults.frequency;
  const runTime = payload.runTime || scheduleDefaults.runTime;
  const weekday = Number(payload.weekday ?? scheduleDefaults.weekday);
  const monthDay = Number(payload.monthDay ?? scheduleDefaults.monthDay);
  if (!['daily', 'weekly', 'monthly'].includes(frequency)) throw new Error('Chu kỳ backup không hợp lệ.');
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(runTime)) throw new Error('Giờ backup không hợp lệ.');
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) throw new Error('Thứ backup không hợp lệ.');
  if (!Number.isInteger(monthDay) || monthDay < 1 || monthDay > 28) throw new Error('Ngày trong tháng phải từ 1 đến 28.');
  return { enabled: Boolean(payload.enabled), frequency, runTime, weekday, monthDay };
};

export const getBackupSchedule = async () => {
  const [rows] = await pool.execute('SELECT * FROM backup_schedules WHERE id = 1 LIMIT 1');
  return normalizeSchedule(rows[0]);
};

export const saveBackupSchedule = async (payload) => {
  const schedule = validateSchedule(payload);
  await pool.execute(
    `UPDATE backup_schedules
     SET enabled = ?, frequency = ?, run_time = ?, weekday = ?, month_day = ?, updated_at = CURRENT_TIMESTAMP(3)
     WHERE id = 1`,
    [schedule.enabled, schedule.frequency, schedule.runTime, schedule.weekday, schedule.monthDay],
  );
  return getBackupSchedule();
};

const getVietnamNow = () => {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date()).map(({ type, value }) => [type, value]));
  const weekdays = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
    weekday: weekdays[parts.weekday],
    day: Number(parts.day),
  };
};

let scheduledBackupRunning = false;

export const runScheduledBackup = async () => {
  if (scheduledBackupRunning) return null;
  const schedule = await getBackupSchedule();
  if (!schedule.enabled) return null;

  const now = getVietnamNow();
  const targetMinutes = Number(schedule.runTime.slice(0, 2)) * 60 + Number(schedule.runTime.slice(3));
  const currentMinutes = Number(now.time.slice(0, 2)) * 60 + Number(now.time.slice(3));
  const matchesFrequency = schedule.frequency === 'daily'
    || (schedule.frequency === 'weekly' && schedule.weekday === now.weekday)
    || (schedule.frequency === 'monthly' && schedule.monthDay === now.day);
  if (currentMinutes < targetMinutes || !matchesFrequency || schedule.lastRunKey === now.date) return null;

  scheduledBackupRunning = true;
  try {
    const backup = await createBackup({ destination: 'server' });
    await pool.execute('UPDATE backup_schedules SET last_run_key = ?, updated_at = CURRENT_TIMESTAMP(3) WHERE id = 1', [now.date]);
    return backup.metadata;
  } finally {
    scheduledBackupRunning = false;
  }
};
