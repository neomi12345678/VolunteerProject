// authSlice.ts
import { createSlice } from "@reduxjs/toolkit";

interface User {
  id: number;
  email: string;
  role: string;
  token: string;
  fullName: string;
}

interface AuthState {
  user: User | null;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem("adminUser") || "null"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authSuccess(state, action: { payload: User }) {
      state.user = action.payload;
      localStorage.setItem("adminUser", JSON.stringify(action.payload)); // שמירת ה-token
    },
    logout(state) {
      state.user = null;
      localStorage.removeItem("adminUser");
    },
  },
});

export const { authSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
