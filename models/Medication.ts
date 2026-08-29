import { Schema, model, models } from 'mongoose';

const MedicationSchema = new Schema(
  {
    petId: { type: String, required: true },
    ownerId: { type: String },
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    type: { type: String, default: 'Tablet' },
    feedingRelation: { type: String, default: 'Any time' },
    frequency: { type: String, default: 'Once daily' },
    times: [{ type: String }],
    startDate: { type: String },
    endDate: { type: String },
    active: { type: Boolean, default: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default models.Medication || model('Medication', MedicationSchema);

