import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

type UserState = {
  name: string | null;
  email: string | null;
  plan: string;
  apiKey: string | null;
  loading: boolean;
  usageToday: number;
  usageMonthly: number;
  usageLimit: number;
};

const initialState: UserState = {
  name: null,
  email: null,
  plan: "FREE",
  apiKey: null,
  loading: false,
  usageToday: 0,
  usageMonthly: 0,
  usageLimit: 1000,
};

export const fetchUser = createAsyncThunk(
  "user/fetch",
  async () => {
    const res = await axios.get("/api/user/me");
    return res.data;
  }
);

export const generateApiKey = createAsyncThunk(
  "user/generateApiKey",
  async () => {
    const res = await axios.post("/api/apikey");
    return res.data.apiKey;
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(_, action: PayloadAction<UserState>) {
      return action.payload;
    },
    clearUser() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.name = action.payload.name;
        state.email = action.payload.email;
        state.plan = action.payload.plan;
        state.apiKey = action.payload.apiKey;
        state.usageToday = action.payload.usage.today;
        state.usageMonthly = action.payload.usage.monthly || 0;
        state.usageLimit = action.payload.dailyQuota || 1000;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.loading = false;
      })
      .addCase(generateApiKey.fulfilled, (state, action) => {
        state.apiKey = action.payload;
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
