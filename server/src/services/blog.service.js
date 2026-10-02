import { randomUUID } from 'node:crypto';
import { pool } from '../config/database.js';
import { refreshSitemapFile } from './sitemap.service.js';

const toMySqlDateTime = (value) => {
  if (!value) return null;

  const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(String(value))
    ? `${value}T12:00:00+07:00`
    : value;
  const date = normalizedValue instanceof Date ? normalizedValue : new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    throw new Error('publishedAt must be a valid date.');
  }

  const pad = (part) => String(part).padStart(2, '0');
  const milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}.${milliseconds}`;
};

const fromRow = (row) => row && ({
  _id: row.id,
  title: row.title,
  slug: row.slug,
  excerpt: row.excerpt,
  content: row.content,
  thumbnail: row.thumbnail,
  category: row.category_id,
  seoTitle: row.seo_title,
  seoDescription: row.seo_description,
  keywords: typeof row.keywords === 'string' ? JSON.parse(row.keywords) : row.keywords,
  status: row.status,
  views: row.views,
  publishedAt: row.published_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const attachCategory = async (post) => {
  if (!post?.category) return post;
  const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [post.category]);
  if (rows.length) {
    const category = rows[0];
    post.category = {
      _id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      createdAt: category.created_at,
      updatedAt: category.updated_at,
    };
  } else {
    post.category = null;
  }
  return post;
};

export const getPosts = async () => {
  const [rows] = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
  const categoriesById = new Map();
  const categoryIds = [...new Set(rows.map((row) => row.category_id).filter(Boolean))];
  if (categoryIds.length) {
    const placeholders = categoryIds.map(() => '?').join(', ');
    const [categories] = await pool.query(`SELECT * FROM categories WHERE id IN (${placeholders})`, categoryIds);
    categories.forEach((category) => categoriesById.set(category.id, {
      _id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      createdAt: category.created_at,
      updatedAt: category.updated_at,
    }));
  }
  return rows.map((row) => {
    const post = fromRow(row);
    post.category = categoriesById.get(row.category_id) || null;
    return post;
  });
};

export const getPostBySlug = async (slug) => {
  const [rows] = await pool.execute('SELECT * FROM posts WHERE slug = ? LIMIT 1', [slug]);
  return attachCategory(fromRow(rows[0]));
};

export const incrementPostView = async (slug) => {
  const [result] = await pool.execute(
    "UPDATE posts SET views = views + 1 WHERE slug = ? AND status = 'published'",
    [slug],
  );
  if (!result.affectedRows) return null;
  const [rows] = await pool.execute('SELECT * FROM posts WHERE slug = ? LIMIT 1', [slug]);
  return fromRow(rows[0]);
};

export const createPost = async (payload) => {
  const id = randomUUID();
  const fields = {
    title: payload.title,
    slug: payload.slug,
    excerpt: payload.excerpt || '',
    content: payload.content,
    thumbnail: payload.thumbnail || '',
    category_id: payload.category || null,
    seo_title: payload.seoTitle || '',
    seo_description: payload.seoDescription || '',
    keywords: JSON.stringify(payload.keywords || []),
    status: payload.status || 'published',
    views: Number(payload.views) || 0,
    published_at: toMySqlDateTime(payload.publishedAt || new Date()),
  };
  await pool.execute(
    `INSERT INTO posts
      (id, title, slug, excerpt, content, thumbnail, category_id, seo_title, seo_description, keywords, status, views, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, ...Object.values(fields)],
  );
  const [rows] = await pool.execute('SELECT * FROM posts WHERE id = ?', [id]);
  await refreshSitemapFile();
  return attachCategory(fromRow(rows[0]));
};

export const updatePost = async (id, payload) => {
  const columns = {
    title: 'title',
    slug: 'slug',
    excerpt: 'excerpt',
    content: 'content',
    thumbnail: 'thumbnail',
    category: 'category_id',
    seoTitle: 'seo_title',
    seoDescription: 'seo_description',
    keywords: 'keywords',
    status: 'status',
    views: 'views',
    publishedAt: 'published_at',
  };
  const entries = Object.entries(payload).filter(([key]) => columns[key]);
  if (entries.length) {
    const values = entries.map(([key, value]) => {
      if (key === 'keywords') return JSON.stringify(value || []);
      if (key === 'publishedAt') return toMySqlDateTime(value);
      return value;
    });
    await pool.execute(
      `UPDATE posts SET ${entries.map(([key]) => `${columns[key]} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?`,
      [...values, id],
    );
  }
  const [rows] = await pool.execute('SELECT * FROM posts WHERE id = ?', [id]);
  await refreshSitemapFile();
  return attachCategory(fromRow(rows[0]));
};

export const deletePost = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM posts WHERE id = ?', [id]);
  if (!rows.length) return null;
  await pool.execute('DELETE FROM posts WHERE id = ?', [id]);
  await refreshSitemapFile();
  return fromRow(rows[0]);
};
