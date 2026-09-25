import mongoose from 'mongoose';
import Registration from '../models/Registration.model.js';

const seedRegistrations = [];
const applyStatusUpdate = (record, status) => ({ ...record, status, updatedAt: new Date() });

export const createRegistration = async (payload) => {
  if (mongoose.connection.readyState === 1) return Registration.create(payload);
  const record = { _id: String(Date.now()), ...payload, status: 'new', source: 'website', createdAt: new Date(), updatedAt: new Date() };
  seedRegistrations.unshift(record);
  return record;
};

export const getRegistrations = async () => {
  if (mongoose.connection.readyState === 1) return Registration.find({}).sort({ createdAt: -1 });
  return [...seedRegistrations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const updateRegistrationStatus = async (id, status) => {
  if (mongoose.connection.readyState === 1) return Registration.findByIdAndUpdate(id, { status }, { new: true });
  const index = seedRegistrations.findIndex((item) => item._id === id);
  if (index === -1) return null;
  const updated = applyStatusUpdate(seedRegistrations[index], status);
  seedRegistrations[index] = updated;
  return updated;
};

export const deleteRegistration = async (id) => {
  if (mongoose.connection.readyState === 1) return Registration.findByIdAndDelete(id);
  const index = seedRegistrations.findIndex((item) => item._id === id);
  if (index === -1) return null;
  const [deleted] = seedRegistrations.splice(index, 1);
  return deleted;
};

export const getRegistrationStats = async () => {
  const registrations = await getRegistrations();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const days = 7;
  const dailyNewRegistrations = Array.from({ length: days }, (_, index) => {
    const date = new Date(startOfToday);
    date.setDate(startOfToday.getDate() - (days - 1 - index));
    return { date, count: 0 };
  });

  registrations.forEach((item) => {
    const createdAt = new Date(item.createdAt);
    dailyNewRegistrations.forEach((bucket) => {
      const nextDate = new Date(bucket.date);
      nextDate.setDate(bucket.date.getDate() + 1);
      if (createdAt >= bucket.date && createdAt < nextDate) bucket.count += 1;
    });
  });

  const todayNewCount = registrations.filter((item) => new Date(item.createdAt) >= startOfToday).length;
  const unprocessedCount = registrations.filter((item) => (item.status || 'new') === 'new').length;

  return {
    totalRegistrations: registrations.length,
    unprocessedCount,
    todayNewCount,
    dailyNewRegistrations: dailyNewRegistrations.map((bucket) => ({
      date: [bucket.date.getFullYear(), String(bucket.date.getMonth() + 1).padStart(2, '0'), String(bucket.date.getDate()).padStart(2, '0')].join('-'),
      count: bucket.count,
    })),
  };
};
