import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'Học lái xe Tuyên Quang' },
    phone: { type: String, default: '0900000000' },
    zalo: { type: String, default: '0900000000' },
    email: { type: String, default: 'info@hoclaixetq.com' },
    address: { type: String, default: 'Tuyên Quang, Việt Nam' },
    facebook: { type: String, default: '' },
    logo: { type: String, default: '' },
    logoWidth: { type: Number, default: 180, min: 120, max: 300 },
    logoHeight: { type: Number, default: 80, min: 40, max: 160 },
    favicon: { type: String, default: '' },
    googleAnalyticsId: { type: String, default: '' },
    googleAnalyticsEnabled: { type: Boolean, default: false },
    seoTitle: { type: String, default: 'Học lái xe Tuyên Quang | Trường lái xe uy tín' },
    seoDescription: { type: String, default: 'Học lái xe ô tô và xe máy tại Tuyên Quang với lộ trình rõ ràng, học phí hợp lý và đội ngũ tận tâm.' },
    seoKeywords: { type: String, default: 'học lái xe Tuyên Quang, học lái ô tô, học lái xe máy' },
    canonicalUrl: { type: String, default: 'https://hoclaixetuyenquang.com' },
    ogTitle: { type: String, default: 'Học lái xe Tuyên Quang' },
    ogDescription: { type: String, default: 'Tư vấn khóa học lái xe ô tô và xe máy tại Tuyên Quang.' },
    ogImage: { type: String, default: '' },
    robotsIndex: { type: Boolean, default: true },
    robotsFollow: { type: Boolean, default: true },
    schemaJson: { type: String, default: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      additionalType: 'https://schema.org/DrivingSchool',
      name: 'Học lái xe Tuyên Quang',
      url: 'https://hoclaixetuyenquang.com',
      telephone: '+84857034780',
      address: { '@type': 'PostalAddress', addressLocality: 'Tuyên Quang', addressCountry: 'VN' },
      areaServed: 'Tuyên Quang',
    }) },
    heroTitle: { type: String, default: 'Học lái xe ô tô & xe máy tại Tuyên Quang' },
    heroDescription: { type: String, default: 'Tư vấn lộ trình, thủ tục và khóa học phù hợp với nhu cầu của bạn.' },
  },
  { timestamps: true },
);

export default mongoose.models.Setting || mongoose.model('Setting', settingSchema);
