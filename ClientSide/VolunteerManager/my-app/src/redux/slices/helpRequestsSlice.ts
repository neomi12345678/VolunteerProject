import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export type HelpRequestStatus = "Open" | "Matched" | "Completed" | "Cancelled";

export type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type AvailabilityType = {
  id?: number;
  userId: number;
  day: Day;
  from_Time: string;
  to_Time: string;
};

export type HelpRequestType = {
  id: number;
  needyID: number;
  categoryID: number;
  description: string;
  status: HelpRequestStatus;
  createdAt: string;
  availability?: AvailabilityType; // ✅ אופציונלי כדי שלא יפיל
};

// GET
export const fetchHelpRequests = createAsyncThunk(
  "helpRequests/fetchHelpRequests",
  async () => {
    const res = await api.get<HelpRequestType[]>("/api/HelpRequests");
    return res.data;
  }
);

// ADD
export const addRequestAsync = createAsyncThunk(
  "helpRequests/addRequest",
  async (request: Omit<HelpRequestType, "id">) => {
    const res = await api.post<HelpRequestType>("/api/HelpRequests", request);
    return res.data;
  }
);

// UPDATE (כולל סטטוס)
export const updateRequestAsync = createAsyncThunk(
  "helpRequests/updateRequest",
  async (request: HelpRequestType) => {
    await api.put(`/api/HelpRequests/${request.id}`, request);
    return request;
  }
);

// DELETE
export const deleteRequestAsync = createAsyncThunk(
  "helpRequests/deleteRequest",
  async (id: number) => {
    await api.delete(`/api/HelpRequests/${id}`);
    return id;
  }
);

type HelpRequestsState = {
  items: HelpRequestType[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: HelpRequestsState = {
  items: [],
  status: "idle",
  error: null,
};

const helpRequestsSlice = createSlice({
  name: "helpRequests",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // FETCH
      .addCase(fetchHelpRequests.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchHelpRequests.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchHelpRequests.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to load";
      })

      // ADD
      .addCase(addRequestAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      // UPDATE (כולל סטטוס)
      .addCase(updateRequestAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (r) => r.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      // DELETE
      .addCase(deleteRequestAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload);
      });
  },
});

export default helpRequestsSlice.reducer;
