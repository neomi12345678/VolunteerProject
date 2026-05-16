import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export interface Needy {
  id: number;
  fullName: string;
  email: string;
  phone: string;
    city: string;
    street: string;
  userRole: 1;
  rating: number;
}

interface NeedyState {
  list: Needy[];
  loading: boolean;
  error: string | null;
}

const initialState: NeedyState = {
  list: [],
  loading: false,
  error: null,
};

export const fetchNeedy = createAsyncThunk("needy/fetchAll", async () => {
  const res = await api.get("/api/Users");
  return (res.data as Needy[]).filter((u) => u.userRole === 1);
});

export const addNeedy = createAsyncThunk(
  "needy/add",
  async (data: { fullName: string; email: string; password: string; phone: string; city: string; street : string }) => {
    const res = await api.post("/api/Register", {
      fullName:       data.fullName,
      email:          data.email,
      password:       data.password,
      phone:          data.phone,
      city:         data.city,
      street:       data.street,
      userRole:       1,
      categoryIds:    [],
      availabilities: [],
    });
    return res.data.user as Needy;
  }
);

export const updateNeedy = createAsyncThunk(
  "needy/update",
  async (data: Needy) => {
    await api.put(`/api/Users/${data.id}`, data);
    return data;
  }
);

export const deleteNeedy = createAsyncThunk(
  "needy/delete",
  async (id: number) => {
    await api.delete(`/api/Users/${id}`);
    return id;
  }
);

const needySlice = createSlice({
  name: "needy",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNeedy.pending,    (state) => { state.loading = true; state.error = null; })
      .addCase(fetchNeedy.fulfilled,  (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchNeedy.rejected,   (state, action) => { state.loading = false; state.error = action.error.message ?? "שגיאה"; })
      .addCase(addNeedy.fulfilled,    (state, action) => { state.list.push(action.payload); })
      .addCase(updateNeedy.fulfilled, (state, action) => {
        const idx = state.list.findIndex((n) => n.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(deleteNeedy.fulfilled, (state, action) => {
        state.list = state.list.filter((n) => n.id !== action.payload);
      });
  },
});

export default needySlice.reducer;
