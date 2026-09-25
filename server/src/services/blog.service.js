import mongoose from 'mongoose';
import Post from '../models/Post.model.js';

const seedPosts = [
  {
    _id: '1',
    title: 'Học lái xe ô tô tại Tuyên Quang cần những gì?',
    slug: 'hoc-lai-xe-o-to-tai-tuyen-quang',
    excerpt: 'Tìm hiểu điều kiện, hồ sơ, thời gian học và những lưu ý quan trọng khi đăng ký học lái xe ô tô tại Tuyên Quang.',
    content: '<p>Học lái xe ô tô cần sự chuẩn bị về hồ sơ, thời gian học và kỹ năng cơ bản.</p><p>Để học tốt, bạn nên chọn lộ trình phù hợp với khả năng và mục tiêu cá nhân.</p>',
    thumbnail: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80',
    category: null,
    seoTitle: 'Học lái xe ô tô tại Tuyên Quang | Lộ trình và điều kiện',
    seoDescription: 'Hướng dẫn chi tiết về học lái xe ô tô tại Tuyên Quang, điều kiện hồ sơ, quy trình và lộ trình học.',
    keywords: ['học lái xe ô tô Tuyên Quang', 'đăng ký học lái xe Tuyên Quang'],
    status: 'published',
    views: 0,
    publishedAt: new Date('2026-09-01'),
  },
  {
    _id: '2',
    title: 'Học lái xe máy tại Tuyên Quang: Lộ trình và kinh nghiệm cần biết',
    slug: 'hoc-lai-xe-may-tai-tuyen-quang',
    excerpt: 'Đối với người mới bắt đầu, việc hiểu rõ lộ trình học và cách ôn luyện là yếu tố quyết định thành công.',
    content: '<p>Với học lái xe máy, bạn cần nắm rõ hướng dẫn thực hành, an toàn và kỹ năng cơ bản.</p>',
    thumbnail: 'https://images.unsplash.com/photo-1558980664-10e7170b5df9?auto=format&fit=crop&w=1200&q=80',
    category: null,
    seoTitle: 'Học lái xe máy tại Tuyên Quang',
    seoDescription: 'Tổng hợp thông tin về điều kiện, lộ trình và kinh nghiệm học lái xe máy tại Tuyên Quang.',
    keywords: ['học lái xe máy Tuyên Quang'],
    status: 'published',
    views: 0,
    publishedAt: new Date('2026-09-04'),
  },
];

export const getPosts = async () => {
  if (mongoose.connection.readyState === 1) {
    return Post.find({}).populate('category').sort({ createdAt: -1 });
  }

  return seedPosts;
};

export const getPostBySlug = async (slug) => {
  if (mongoose.connection.readyState === 1) {
    return Post.findOneAndUpdate({ slug }, { $inc: { views: 1 } }, { new: true });
  }

  const post = seedPosts.find((item) => item.slug === slug);
  if (!post) return null;

  post.views = (post.views || 0) + 1;
  return post;
};

export const createPost = async (payload) => {
  if (mongoose.connection.readyState === 1) {
    return Post.create(payload);
  }

  seedPosts.unshift({ ...payload, _id: String(Date.now()) });
  return seedPosts[0];
};

export const updatePost = async (id, payload) => {
  if (mongoose.connection.readyState === 1) {
    return Post.findByIdAndUpdate(id, payload, { new: true });
  }

  const index = seedPosts.findIndex((post) => post._id === id);
  if (index === -1) return null;

  seedPosts[index] = { ...seedPosts[index], ...payload };
  return seedPosts[index];
};

export const deletePost = async (id) => {
  if (mongoose.connection.readyState === 1) {
    return Post.findByIdAndDelete(id);
  }

  const index = seedPosts.findIndex((post) => post._id === id);
  if (index === -1) return null;

  const [deleted] = seedPosts.splice(index, 1);
  return deleted;
};
