import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeNav: "Dashboard",
};

const homeSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setActiveNav(state, action) {
      state.activeNav = action.payload;
    },
  },
});

export const { setActiveNav } = homeSlice.actions;
export default homeSlice.reducer;
