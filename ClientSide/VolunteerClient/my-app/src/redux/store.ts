// src/redux/store.ts
import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import categoriesReducer from './slices/categoriesSlice';
import volunteerReducer from './slices/volunteerSlice';
import helpRequestsReducer from './slices/helpRequestsSlice';
import assignmentsReducer from './slices/assignmentsSlice';

// ── Load state מה-localStorage (ללא auth!)
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('reduxState');
    if (!serializedState) return undefined;
    const parsed = JSON.parse(serializedState);
    // מוודאים שאף פעם לא טוענים auth מה-localStorage
    const { auth: _auth, ...rest } = parsed;
    return rest;
  } catch {
    return undefined;
  }
};

// ── Save state ל-localStorage (ללא auth!)
const saveState = (state: any) => {
  try {
    const { auth: _auth, ...rest } = state;
    const serializedState = JSON.stringify(rest);
    localStorage.setItem('reduxState', serializedState);
  } catch {}
};

const rootReducer = combineReducers({
  auth: authReducer,
  categories: categoriesReducer,
  volunteer: volunteerReducer,
  helpRequests: helpRequestsReducer,
  assignments: assignmentsReducer,
});

const preloadedState = loadState();

export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
});

// ── שמירה אוטומטית בכל שינוי ב-store (ללא auth)
store.subscribe(() => saveState(store.getState()));

// ── טיפוסים ל-TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
