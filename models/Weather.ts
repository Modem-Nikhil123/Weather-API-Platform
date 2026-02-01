import { Schema, model, models } from "mongoose";

const WeatherSchema = new Schema({
  city: { type: String, required: true },
  lat: Number,
  lon: Number,
  temperature: Number,
  humidity: Number,
  pressure: Number,
  windSpeed: Number,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default models.Weather || model("Weather", WeatherSchema);
