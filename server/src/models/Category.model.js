import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
  },
  { timestamps: true },
);

export default mongoose.models.Category || mongoose.model('Category', categorySchema);
