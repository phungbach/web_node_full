import { createMedia, deleteMedia, getMedia } from '../services/media.service.js';

export const listMedia = async (req, res, next) => {
  try {
    res.json({ success: true, message: 'Success', data: await getMedia() });
  } catch (error) {
    next(error);
  }
};

export const uploadMedia = async (req, res, next) => {
  try {
    const { name, type, size, url } = req.body;
    if (!name || !type || !url || !type.startsWith('image/')) {
      return res.status(400).json({ success: false, message: 'Ảnh không hợp lệ', data: null });
    }
    if (url.length > 8 * 1024 * 1024) {
      return res.status(413).json({ success: false, message: 'Ảnh sau mã hoá vượt quá 8MB', data: null });
    }

    const media = await createMedia({ name, type, size: Number(size) || 0, url });
    res.status(201).json({ success: true, message: 'Media uploaded', data: media });
  } catch (error) {
    next(error);
  }
};

export const removeMedia = async (req, res, next) => {
  try {
    const media = await deleteMedia(req.params.id);
    if (!media) return res.status(404).json({ success: false, message: 'Media not found', data: null });
    res.json({ success: true, message: 'Media deleted', data: media });
  } catch (error) {
    next(error);
  }
};
