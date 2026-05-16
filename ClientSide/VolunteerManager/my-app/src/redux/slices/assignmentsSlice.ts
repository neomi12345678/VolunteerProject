import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export type AssignmentStatus = "Active" | "Finished" | "Cancelled";

export type AssignmentType = {
  id: number;
  volunteerID: number;
  helpRequestID: number;
  assignedAt: string;
  status: AssignmentStatus | number;
  // שדות מועשרים (מגיעים מה-enriched endpoints)
  helpRequestTitle?: string;
  requesterName?: string;
  requesterCity?: string;
  volunteerName?: string;
};

const STATUS_MAP: Record<number, AssignmentStatus> = {
  0: "Active",
  1: "Finished",
  2: "Cancelled",
};

// GET כל ה-Assignments (מועשרים)
export const fetchAssignments = createAsyncThunk(
  "assignments/fetchAll",
  async () => {
    const res = await api.get<AssignmentType[]>("/api/Assignments");
    return res.data.map((a) => ({
      ...a,
      status:
        typeof a.status === "number"
          ? STATUS_MAP[a.status] ?? "Active"
          : a.status,
    }));
  }
);

// PUT סטטוס — דרך endpoint /status
export const updateAssignmentStatusAsync = createAsyncThunk(
  "assignments/updateStatus",
  async ({ id, status }: { id: number; status: number }) => {
    await api.put(`/api/Assignments/${id}/status`, { status });
    return { id, status };
  }
);

type AssignmentsState = {
  items: AssignmentType[];
  loading: boolean;
  error: string | null;
};

const initialState: AssignmentsState = {
  items: [],
  loading: false,
  error: null,
};

const assignmentsSlice = createSlice({
  name: "assignments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load";
      })
      .addCase(updateAssignmentStatusAsync.fulfilled, (state, action) => {
        // אחרי עדכון סטטוס — מסירים מהרשימה אם Cancelled (כי נמחק בשרת)
        // או מעדכנים אם Finished
        const { id, status } = action.payload;
        if (status === 3) {
          // Cancelled — נמחק בשרת, נסיר מה-store
          state.items = state.items.filter((a) => a.id !== id);
        } else if (status === 1) {
          // Finished
          const idx = state.items.findIndex((a) => a.id === id);
          if (idx !== -1) state.items[idx].status = "Finished";
        }
      });
  },
});

export default assignmentsSlice.reducer;