import { restoreBackupFromBuffer, restoreBackupFromServer } from '../services/backup.service.js';

const requireConfirmation = (value) => {
  if (value !== 'RESTORE') {
    const error = new Error('Hãy nhập đúng RESTORE để xác nhận ghi đè dữ liệu.');
    error.statusCode = 400;
    throw error;
  }
};

export const restoreServerBackup = async (req, res, next) => {
  try {
    requireConfirmation(req.body?.confirmation);
    const counts = await restoreBackupFromServer(req.body?.filename);
    res.json({ success: true, message: 'Đã restore dữ liệu từ backup trên máy chủ.', data: { counts } });
  } catch (error) {
    next(error);
  }
};

export const restoreUploadedBackup = async (req, res, next) => {
  try {
    requireConfirmation(req.body?.confirmation);
    if (!req.file) {
      const error = new Error('Chưa chọn file backup từ máy.');
      error.statusCode = 400;
      throw error;
    }
    const counts = await restoreBackupFromBuffer(req.file.buffer);
    res.json({ success: true, message: 'Đã restore dữ liệu từ file trên máy.', data: { counts } });
  } catch (error) {
    next(error);
  }
};
