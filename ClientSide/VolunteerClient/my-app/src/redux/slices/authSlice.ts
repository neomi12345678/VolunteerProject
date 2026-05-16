import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CategoryType } from '../../types/categories.types';
import type { AvailabilityType } from '../../types/availabilities.types';
import { UserRole } from '../../types/enums.types';

interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  street?: string;
  userRole: UserRole;
  categories: CategoryType[];
  availabilities: AvailabilityType[];
  rating: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isInitialized = true;
      state.error = null;
    },
    authFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    initializationComplete: (state) => {
      state.isInitialized = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      state.error = null;
    },
    // ← חדש: עדכון שדות פרופיל בלבד
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const {
  authStart,
  authSuccess,
  authFailure,
  clearError,
  initializationComplete,
  logout,
  updateUser,   // ← ייצוא החדש
} = authSlice.actions;

export default authSlice.reducer;

