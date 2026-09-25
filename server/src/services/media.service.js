import mongoose from 'mongoose';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Media from '../models/Media.model.js';

const mediaFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../data/media.json');
const loadLocalMedia = () => {
  try {
    if (fs.existsSync(mediaFile)) {
      const media = JSON.parse(fs.readFileSync(mediaFile, 'utf8'));
      return media.map((item, index) => ({
        ...item,
        _id: item._id || `local-media-${index + 1}`,
      }));
    }
  } catch (error) {
    console.warn('Could not load local media fallback.');
  }
  return [];
};

const localMedia = loadLocalMedia();
const persistLocalMedia = () => {
  fs.mkdirSync(path.dirname(mediaFile), { recursive: true });
  fs.writeFileSync(mediaFile, JSON.stringify(localMedia, null, 2));
};

export const getMedia = async () => {
  if (mongoose.connection.readyState === 1) return Media.find({}).sort({ createdAt: -1 });
  return localMedia.slice().sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
};

export const createMedia = async (payload) => {
  if (mongoose.connection.readyState === 1) return Media.create(payload);

  const media = { ...payload, _id: String(Date.now()), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  localMedia.unshift(media);
  persistLocalMedia();
  return media;
};

export const deleteMedia = async (id) => {
  if (mongoose.connection.readyState === 1) return Media.findByIdAndDelete(id);

  const index = localMedia.findIndex((media) => media._id === id);
  if (index === -1) return null;
  const [deleted] = localMedia.splice(index, 1);
  persistLocalMedia();
  return deleted;
};
