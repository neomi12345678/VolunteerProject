import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export type MatchResult = {
  helpRequestId:  number;
  needyId:        number;
  needyName:      string;
  volunteerId:    number;
  volunteerName:  string;
  distanceKm:     number;
  score:          number;
  matchedDay:     string;
  timeFrom:       string;
  timeTo:         string;
  categoryName:   string;
};

type MatchingState = {
  results:  MatchResult[];
  loading:  boolean;
  error:    string | null;
  lastRun:  string | null;
};

const initialState: MatchingState = {
  results:  [],
  loading:  false,
  error:    null,
  lastRun:  null,
};

export const runMatching = createAsyncThunk(
  "matching/run",
  async () => {
    const res = await api.post<{ message: string; matches: MatchResult[] }>(
      "/api/Matching/run"
    );
    return res.data;
  }
);

const matchingSlice = createSlice({
  name: "matching",
  initialState,
  reducers: {
    clearResults(state) {
      state.results = [];
      state.error   = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runMatching.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(runMatching.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.matches;
        state.lastRun = new Date().toLocaleString("he-IL");
      })
      .addCase(runMatching.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.error.message ?? "Matching failed";
      });
  },
});

export const { clearResults } = matchingSlice.actions;
export default matchingSlice.reducer;