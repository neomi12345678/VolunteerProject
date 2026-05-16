import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CategoryType } from "../../types/categories.types";

interface CategoriesState {
  list: CategoryType[];
  selectedIds: number[];
  volunteersCounts: Record<number, number>;
}

const initialState: CategoriesState = {
  list: [],
  selectedIds: [],
  volunteersCounts: {},
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<CategoryType[]>) => {
      state.list = action.payload;
    },
    setVolunteersCounts: (state, action: PayloadAction<Record<number, number>>) => {
      state.volunteersCounts = action.payload;
    },
    setSelected: (state, action: PayloadAction<number[]>) => {
      state.selectedIds = action.payload;
    },
    addSelected: (state, action: PayloadAction<number>) => {
      if (!state.selectedIds.includes(action.payload)) {
        state.selectedIds.push(action.payload);
      }
    },
    removeSelected: (state, action: PayloadAction<number>) => {
      state.selectedIds = state.selectedIds.filter(id => id !== action.payload);
    },
    // פעולה חדשה לאיפוס קטגוריות
    resetSelected: (state) => {
      state.selectedIds = [];
    },
  },
});

export const {
  setCategories,
  setVolunteersCounts,
  setSelected,
  addSelected,
  removeSelected,
  resetSelected,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;

