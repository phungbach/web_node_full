import { unlink } from 'node:fs/promises';
import {
  createBackup,
  deleteBackup,
  getBackupPath,
  getBackupSchedule,
  listBackups,
  saveBackupSchedule,
} from '../services/backup.service.js';

export const list = async (req, res, next) => {
  try {
    res.json({ success: true, data: await listBackups() });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const backup = await createBackup({ destination: req.body?.destination });
    if (backup.destination === 'download') {
      return res.download(backup.path, backup.filename, async (error) => {
        try {
          await unlink(backup.path);
        } catch (cleanupError) {
          if (cleanupError.code !== 'ENOENT') console.error(cleanupError);
        }
        if (error && !res.headersSent) next(error);
      });
    }

    res.status(201).json({ success: true, data: backup.metadata });
  } catch (error) {
    next(error);
  }
};

export const download = async (req, res, next) => {
  try {
    const filePath = await getBackupPath(req.params.filename);
    res.download(filePath, req.params.filename);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const backup = await deleteBackup(req.params.filename);
    res.json({ success: true, data: backup });
  } catch (error) {
    next(error);
  }
};

export const schedule = async (req, res, next) => {
  try {
    res.json({ success: true, data: await getBackupSchedule() });
  } catch (error) {
    next(error);
  }
};

export const updateSchedule = async (req, res, next) => {
  try {
    res.json({ success: true, data: await saveBackupSchedule(req.body || {}) });
  } catch (error) {
    next(error);
  }
};
