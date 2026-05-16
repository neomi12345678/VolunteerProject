import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export type CategoryType = {
  id: number;
  name: string;
  description: string;
  icon: string;
};

// GET
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async () => {
    const res = await api.get<CategoryType[]>("/api/Categories");
    return res.data;
  }
);

// ADD
export const addCategoryAsync = createAsyncThunk(
  "categories/addCategory",
  async (category: Omit<CategoryType, "id">) => {
    const res = await api.post<CategoryType>("/api/Categories", category);
    return res.data;
  }
);

// UPDATE
export const updateCategoryAsync = createAsyncThunk(
  "categories/updateCategory",
  async (category: CategoryType) => {
    await api.put(`/api/Categories/${category.id}`, category);
    return category;
  }
);

// DELETE
export const deleteCategoryAsync = createAsyncThunk(
  "categories/deleteCategory",
  async (id: number) => {
    await api.delete(`/api/Categories/${id}`);
    return id;
  }
);

type CategoriesState = {
  items: CategoryType[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: CategoriesState = {
  items: [],
  status: "idle",
  error: null,
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // FETCH
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to load";
      })

      // ADD
      .addCase(addCategoryAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      // UPDATE
      .addCase(updateCategoryAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      // DELETE
      .addCase(deleteCategoryAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c.id !== action.payload);
      });
  },
});

export default categoriesSlice.reducer;
