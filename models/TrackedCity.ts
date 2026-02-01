import mongoose, { Schema, models, model } from "mongoose";

const TrackedCitySchema = new Schema({
  name: { type: String, required: true, unique: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  country: { type: String },
  state: { type: String },
  addedBy: { type: String }, // User email who added it
  isActive: { type: Boolean, default: true },
  lastFetched: { type: Date },
  fetchCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for efficient lookups (removed duplicate index on 'name' since it's already unique)
TrackedCitySchema.index({ isActive: 1 });

export default models.TrackedCity || model("TrackedCity", TrackedCitySchema);