import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, default: '' },
    content: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    keywords: [{ type: String }],
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    views: { type: Number, default: 0, min: 0 },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.models.Post || mongoose.model('Post', postSchema);
