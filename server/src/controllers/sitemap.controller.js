import { getSitemapXml, refreshSitemapFile } from '../services/sitemap.service.js';

export const sitemap = async (req, res, next) => {
  try {
    res.type('application/xml').send(await getSitemapXml());
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    await refreshSitemapFile();
    res.json({ success: true, message: 'Đã cập nhật sitemap.xml.' });
  } catch (error) {
    next(error);
  }
};
