import { Schema, model, models } from 'mongoose';

const HealthRecordSchema = new Schema(
  {
    petId: { type: String, required: true },
    ownerId: { type: String },
    recordType: { type: String, enum: ['weight', 'vaccination', 'general'], default: 'general' },
    weightKg: { type: Number },
    vaccinationName: { type: String },
    administeredOn: { type: String },
    nextDueOn: { type: String },
    notes: { type: String, default: '' },
    recordedByUid: { type: String },
    recordedByName: { type: String, default: 'User' },
    date: { type: String },
  },
  { timestamps: true }
);

export default models.HealthRecord || model('HealthRecord', HealthRecordSchema);

