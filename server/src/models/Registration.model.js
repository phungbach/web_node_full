import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    courseType: {
      type: String,
      enum: ['car', 'motorbike', 'unknown'],
      default: 'unknown',
    },
    area: { type: String, default: '' },
    note: { type: String, default: '' },
    status: {
      type: String,
      enum: ['new', 'contacted', 'completed', 'cancelled'],
      default: 'new',
    },
    source: { type: String, default: 'website' },
  },
  { timestamps: true },
);

export default mongoose.models.Registration || mongoose.model('Registration', registrationSchema);
