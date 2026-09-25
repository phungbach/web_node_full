import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.models.Media || mongoose.model('Media', mediaSchema);
