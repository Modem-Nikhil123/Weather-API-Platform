import mongoose, { Schema, Document } from "mongoose";

export interface IUsage extends Document {
  userId: mongoose.Types.ObjectId;
  apiKey: string;
  endpoint: string;
  date: string; // YYYY-MM-DD
  count: number;
}

const UsageSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  apiKey: { type: String, required: true },
  endpoint: { type: String, required: true },
  date: { type: String, required: true },
  count: { type: Number, default: 0 },
});

// Compound index for apiKey, endpoint and date
UsageSchema.index({ apiKey: 1, endpoint: 1, date: 1 }, { unique: true });

export default mongoose.models.Usage || mongoose.model<IUsage>("Usage", UsageSchema);