import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config/env.js';
import { pool } from '../config/database.js';

const staticPaths = ['/', '/hoc-lai-xe-o-to', '/hoc-lai-xe-may', '/kinh-nghiem', '/quiz', '/cau-hoi', '/lien-he', '/dang-ky'];

const escapeXml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const formatLastModified = (value) => {
  if (!value) return new Date().toISOString().slice(0, 10);
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString().slice(0, 10) : date.toISOString().slice(0, 10);
};

export const getSitemapXml = async () => {
  const [posts] = await pool.query(
    "SELECT slug, published_at, updated_at FROM posts WHERE status = 'published' ORDER BY published_at DESC, created_at DESC",
  );
  const urls = [
    ...staticPaths.map((pathName) => ({ path: pathName })),
    ...posts.map((post) => ({ path: `/kinh-nghiem/${post.slug}`, lastmod: post.updated_at || post.published_at })),
  ];
  const body = urls.map(({ path: urlPath, lastmod }) => `  <url><loc>${escapeXml(`${env.SITE_URL}${urlPath}`)}</loc>${lastmod ? `<lastmod>${formatLastModified(lastmod)}</lastmod>` : ''}</url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
};

export const refreshSitemapFile = async () => {
  const xml = await getSitemapXml();
  const filePath = path.resolve(process.cwd(), env.SITEMAP_PATH);
  try {
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, xml, 'utf8');
  } catch (error) {
    console.error(`Không thể ghi sitemap tại ${filePath}.`, error);
  }
  return xml;
};
