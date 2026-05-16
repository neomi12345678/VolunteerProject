import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AvailabilityType } from '../../types/availabilities.types';

interface VolunteerState {
  slots: AvailabilityType[];
  peopleHelped: number;
}

const initialState: VolunteerState = {
  slots: [],
  peopleHelped: 0,
};

const volunteerSlice = createSlice({
  name: 'volunteer',
  initialState,
  reducers: {
    setSlots: (state, action: PayloadAction<AvailabilityType[]>) => {
      state.slots = action.payload;
    },
    setPeopleHelped: (state, action: PayloadAction<number>) => {
      state.peopleHelped = action.payload;
    },
  },
});

export const { setSlots, setPeopleHelped } = volunteerSlice.actions;
export default volunteerSlice.reducer;



