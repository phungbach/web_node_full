import mongoose from 'mongoose';
import Category from '../models/Category.model.js';

const seedCategories = [
  { _id: '1', name: 'Học lái ô tô', slug: 'hoc-lai-o-to' },
  { _id: '2', name: 'Học lái xe máy', slug: 'hoc-lai-xe-may' },
  { _id: '3', name: 'Kinh nghiệm', slug: 'kinh-nghiem' },
  { _id: '4', name: 'Thi sát hạch', slug: 'thi-sat-hach' },
  { _id: '5', name: 'Quy định', slug: 'quy-dinh' },
  { _id: '6', name: 'Tin tức', slug: 'tin-tuc' },
];

export const getCategories = async () => {
  if (mongoose.connection.readyState === 1) {
    return Category.find({}).sort({ createdAt: -1 });
  }

  return seedCategories;
};

export const createCategory = async (payload) => {
  if (mongoose.connection.readyState === 1) {
    return Category.create(payload);
  }

  const record = { _id: String(Date.now()), ...payload };
  seedCategories.unshift(record);
  return record;
};

export const updateCategory = async (id, payload) => {
  if (mongoose.connection.readyState === 1) {
    return Category.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  }

  const index = seedCategories.findIndex((category) => category._id === id);
  if (index === -1) return null;

  seedCategories[index] = { ...seedCategories[index], ...payload };
  return seedCategories[index];
};

export const deleteCategory = async (id) => {
  if (mongoose.connection.readyState === 1) {
    return Category.findByIdAndDelete(id);
  }

  const index = seedCategories.findIndex((category) => category._id === id);
  if (index === -1) return null;

  const [deleted] = seedCategories.splice(index, 1);
  return deleted;
};
