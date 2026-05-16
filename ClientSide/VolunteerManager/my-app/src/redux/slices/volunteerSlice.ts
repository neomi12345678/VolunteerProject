import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export interface Volunteer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  street: string;
  userRole: 0;
  rating: number;
}

interface VolunteersState {
  list: Volunteer[];
  loading: boolean;
  error: string | null;
}

const initialState: VolunteersState = {
  list: [],
  loading: false,
  error: null,
};

// GET /api/Users → סינון לפי userRole === 0
export const fetchVolunteers = createAsyncThunk("volunteers/fetchAll", async () => {
  const res = await api.get("/api/Users");
  return (res.data as Volunteer[]).filter((u) => u.userRole === 0);
});

// POST /api/Register — בדיוק כמו RegisterDto בשרת
export const addVolunteer = createAsyncThunk(
  "volunteers/add",
  async (data: { fullName: string; email: string; password: string; phone: string; city: string; street: string }) => {
    const res = await api.post("/api/Register", {
      fullName:       data.fullName,
      email:          data.email,
      password:       data.password,
      phone:          data.phone,
      city:         data.city,
      street:       data.street,
      userRole:       0,          // Volunteer
      categoryIds:    [],
      availabilities: [],
    });
    // Register מחזיר { token, user } — אנחנו רוצים רק את ה-user
    return res.data.user as Volunteer;
  }
);

// PUT /api/Users/{id}
export const updateVolunteer = createAsyncThunk(
  "volunteers/update",
  async (data: Volunteer) => {
    await api.put(`/api/Users/${data.id}`, data);
    return data;
  }
);

// DELETE /api/Users/{id}
export const deleteVolunteer = createAsyncThunk(
  "volunteers/delete",
  async (id: number) => {
    await api.delete(`/api/Users/${id}`);
    return id;
  }
);

const volunteersSlice = createSlice({
  name: "volunteers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVolunteers.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchVolunteers.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchVolunteers.rejected,  (state, action) => { state.loading = false; state.error = action.error.message ?? "שגיאה"; })
      .addCase(addVolunteer.fulfilled,    (state, action) => { state.list.push(action.payload); })
      .addCase(updateVolunteer.fulfilled, (state, action) => {
        const idx = state.list.findIndex((v) => v.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(deleteVolunteer.fulfilled, (state, action) => {
        state.list = state.list.filter((v) => v.id !== action.payload);
      });
  },
});

export default volunteersSlice.reducer;
