import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { HelpRequestType } from '../../types/helpRequests.types';

interface HelpRequestsState {
  list: HelpRequestType[];
  loading: boolean;
  error: string | null;
}

const initialState: HelpRequestsState = {
  list: [],
  loading: false,
  error: null,
};

const helpRequestsSlice = createSlice({
  name: 'helpRequests',
  initialState,
  reducers: {
    fetchStart: (state) => { state.loading = true; },
    fetchSuccess: (state, action: PayloadAction<HelpRequestType[]>) => {
      state.loading = false;
      state.list = action.payload;
    },
    addRequestSuccess: (state, action: PayloadAction<HelpRequestType>) => {
      state.list.push(action.payload);
      state.loading = false;
    },
    fetchFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchStart, fetchSuccess, addRequestSuccess, fetchFailure } = helpRequestsSlice.actions;
export default helpRequestsSlice.reducer;