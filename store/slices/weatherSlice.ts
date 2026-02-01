import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface WeatherData {
  city: string;
  lat?: number;
  lon?: number;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  timestamp: string;
}

export const fetchWeather = createAsyncThunk(
  "weather/fetch",
  async ({ city, apiKey }: { city: string; apiKey: string }) => {
    const res = await axios.get(
      `/api/weather/current?city=${city}`,
      {
        headers: { "x-api-key": apiKey },
      }
    );
    return res.data;
  }
);

export const fetchWeatherHistory = createAsyncThunk(
  "weather/fetchHistory",
  async ({ city, apiKey, hours = 24 }: { city: string; apiKey: string; hours?: number }) => {
    const res = await axios.get(
      `/api/weather/history?city=${city}&hours=${hours}`,
      {
        headers: { "x-api-key": apiKey },
      }
    );
    return res.data;
  }
);

const weatherSlice = createSlice({
  name: "weather",
  initialState: {
    data: null as WeatherData | null,
    history: [] as WeatherData[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeather.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeather.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchWeather.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to fetch weather";
      })
      .addCase(fetchWeatherHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeatherHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
        state.error = null;
      })
      .addCase(fetchWeatherHistory.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to fetch weather history";
      });
  },
});

export default weatherSlice.reducer;
