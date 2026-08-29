import { Schema, model, models } from 'mongoose';

const PetSchema = new Schema(
  {
    ownerId: { type: String, required: true },
    caretakerIds: [{ type: String }],
    name: { type: String, required: true },
    species: { type: String, default: 'dog' },
    type: { type: String, default: 'dog' },
    breed: { type: String, default: 'Other' },
    age: { type: String },
    weight: { type: String },
    avatar: { type: String, default: '🐾' },
    allergies: [{ type: String }],
    conditions: [{ type: String }],
    feedingSchedule: {
      times: [{ type: String }], // e.g. ["08:00", "13:00", "19:00"]
      notes: { type: String, default: '' },
    },
    dailyTargets: {
      feeding: { type: Number, default: 3 },
    },
    vetInfo: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      emergencyPhone: { type: String, default: '' },
    },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
    joinCode: { type: String },
  },
  { timestamps: true }
);

export default models.Pet || model('Pet', PetSchema);

