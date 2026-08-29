import { Schema, model, models } from 'mongoose';

const TrashSchema = new Schema(
  {
    petId: { type: String, required: true },
    originalActivityId: { type: String, required: true },
    activitySnapshot: { type: Schema.Types.Mixed },
    deletedByUid: { type: String },
    deletedByName: { type: String, default: 'User' },
    deletedAt: { type: Date, default: Date.now },
    permanent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Trash || model('Trash', TrashSchema);
