import mongoose from 'mongoose';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Setting from '../models/Setting.model.js';

const defaultSettings = {
  _id: 'settings',
  siteName: 'Học lái xe Tuyên Quang',
  phone: '0900000000',
  zalo: '0900000000',
  email: 'info@hoclaixetq.com',
  address: 'Tuyên Quang, Việt Nam',
  facebook: '',
  logo: '',
  logoWidth: 180,
  logoHeight: 80,
  favicon: '',
  googleAnalyticsId: '',
  googleAnalyticsEnabled: false,
  seoTitle: 'Học lái xe Tuyên Quang | Trường lái xe uy tín',
  seoDescription: 'Học lái xe ô tô và xe máy tại Tuyên Quang với lộ trình rõ ràng, học phí hợp lý và đội ngũ tận tâm.',
  seoKeywords: 'học lái xe Tuyên Quang, học lái ô tô, học lái xe máy',
  canonicalUrl: 'https://hoclaixetuyenquang.com',
  ogTitle: 'Học lái xe Tuyên Quang',
  ogDescription: 'Tư vấn khóa học lái xe ô tô và xe máy tại Tuyên Quang.',
  ogImage: '',
  robotsIndex: true,
  robotsFollow: true,
  schemaJson: JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    additionalType: 'https://schema.org/DrivingSchool',
    name: 'Học lái xe Tuyên Quang',
    url: 'https://hoclaixetuyenquang.com',
    telephone: '+84857034780',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Tuyên Quang',
      addressCountry: 'VN',
    },
    areaServed: 'Tuyên Quang',
  }, null, 2),
  heroTitle: 'Học lái xe ô tô & xe máy tại Tuyên Quang',
  heroDescription: 'Tư vấn lộ trình, thủ tục và khóa học phù hợp với nhu cầu của bạn.',
};

const settingsFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../data/settings.json');

const loadRuntimeSettings = () => {
  try {
    if (fs.existsSync(settingsFile)) {
      return { ...defaultSettings, ...JSON.parse(fs.readFileSync(settingsFile, 'utf8')) };
    }
  } catch (error) {
    console.warn('Could not load local settings fallback. Using defaults.');
  }

  return { ...defaultSettings };
};

const persistRuntimeSettings = (settings) => {
  try {
    fs.mkdirSync(path.dirname(settingsFile), { recursive: true });
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.warn('Could not persist local settings fallback.');
  }
};

let runtimeSettings = loadRuntimeSettings();

export const getSettings = async () => {
  if (mongoose.connection.readyState === 1) {
    const setting = await Setting.findOne({});
    return setting || defaultSettings;
  }

  return runtimeSettings;
};

export const updateSettings = async (payload) => {
  if (mongoose.connection.readyState === 1) {
    const existing = await Setting.findOne({});
    if (existing) {
      return Setting.findByIdAndUpdate(existing._id, payload, { new: true });
    }

    return Setting.create(payload);
  }

  runtimeSettings = { ...runtimeSettings, ...payload };
  persistRuntimeSettings(runtimeSettings);
  return runtimeSettings;
};
