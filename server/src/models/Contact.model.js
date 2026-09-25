import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['new', 'contacted', 'completed'],
      default: 'new',
    },
  },
  { timestamps: true },
);

export default mongoose.models.Contact || mongoose.model('Contact', contactSchema);
