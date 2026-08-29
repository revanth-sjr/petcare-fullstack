import { Schema, model, models } from 'mongoose';

const ActivitySchema = new Schema(
  {
    petId: { type: String, required: true },
    ownerId: { type: String },
    caretakerId: { type: String },
    activityType: {
      type: String,
      enum: ['feeding', 'medication', 'walk', 'exercise', 'grooming', 'appointment', 'other'],
      required: true,
    },
    title: { type: String, required: true },
    dayKey: { type: String }, // IST "YYYY-MM-DD"
    slot: { type: String },
    medicationId: { type: String },
    scheduledDate: { type: String },
    scheduledTime: { type: String },
    status: {
      type: String,
      enum: ['pending', 'completed', 'missed', 'overdue'],
      default: 'completed',
    },
    completionTime: { type: Date, default: Date.now },
    completedBy: { type: String },
    performedByUid: { type: String },
    performedByName: { type: String, default: 'User' },
    notes: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Activity || model('Activity', ActivitySchema);

