import { pool } from '../config/database.js';

const defaultSettings = {
  _id: 'settings',
  siteName: 'Học lái xe Tuyên Quang',
  phone: '0987499141',
  zalo: '0987499141',
  email: 'info@hoclaixetq.com',
  address: 'Tuyên Quang, Việt Nam',
  facebook: '',
  logo: '',
  logoWidth: 180,
  logoHeight: 80,
  favicon: '',
  seoTitle: 'Học lái xe Tuyên Quang | Học ô tô, xe máy uy tín',
  seoDescription: 'Học lái xe ô tô B1, B2 và xe máy A1, A2 tại Tuyên Quang. Lộ trình rõ ràng, giáo viên tận tâm, tư vấn nhanh qua 0987499141.',
  seoKeywords: 'học lái xe Tuyên Quang, học lái xe B1, học lái xe B2, học lái xe A1, học lái xe A2, thi bằng lái xe Tuyên Quang',
  canonicalUrl: 'https://hoclaixetq.com',
  ogTitle: 'Học lái xe Tuyên Quang | B1, B2, A1, A2',
  ogDescription: 'Tư vấn học lái ô tô B1, B2 và xe máy A1, A2 tại Tuyên Quang. Gọi 0987499141 để được hỗ trợ.',
  ogImage: 'https://hoclaixetq.com/logo.svg',
  robotsIndex: true,
  robotsFollow: true,
  schemaJson: JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    additionalType: 'https://schema.org/DrivingSchool',
    name: 'Học lái xe Tuyên Quang',
    url: 'https://hoclaixetq.com',
    logo: 'https://hoclaixetq.com/logo.svg',
    image: 'https://hoclaixetq.com/logo.svg',
    telephone: '+84987499141',
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

export const getSettings = async () => {
  const [rows] = await pool.execute('SELECT settings_json FROM settings WHERE id = ?', ['settings']);
  if (!rows.length) return defaultSettings;
  const settings = typeof rows[0].settings_json === 'string' ? JSON.parse(rows[0].settings_json) : rows[0].settings_json;
  return { ...defaultSettings, ...settings, _id: 'settings' };
};

export const updateSettings = async (payload) => {
  const existing = await getSettings();
  const settings = { ...existing, ...payload, _id: 'settings' };
  await pool.execute(
    `INSERT INTO settings (id, settings_json) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE settings_json = VALUES(settings_json), updated_at = CURRENT_TIMESTAMP(3)`,
    ['settings', JSON.stringify(settings)],
  );
  return settings;
};
