import { Schema, model, models } from 'mongoose';

const MemorySchema = new Schema(
  {
    petId: { type: String, required: true },
    title: { type: String, required: true },
    caption: { type: String, default: '' },
    date: { type: String, required: true }, // e.g. "YYYY-MM-DD"
    photoUrl: { type: String, default: '' },
    createdByUid: { type: String },
    createdByName: { type: String, default: 'User' },
  },
  { timestamps: true }
);

export default models.Memory || model('Memory', MemorySchema);
