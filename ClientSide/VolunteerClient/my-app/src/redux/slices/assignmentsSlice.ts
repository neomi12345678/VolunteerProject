import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AssignmentType, ChatMessageType } from '../../types/assignments.types';

interface AssignmentsState {
  activeAssignments: AssignmentType[];
  currentAssignmentId: number | null;
  messages: ChatMessageType[];
  loadingMessages: boolean;
}

const initialState: AssignmentsState = {
  activeAssignments: [],
  currentAssignmentId: null,
  messages: [],
  loadingMessages: false,
};

const assignmentsSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {
    setActiveAssignments: (state, action: PayloadAction<AssignmentType[]>) => {
      state.activeAssignments = action.payload;
    },
    setCurrentAssignment: (state, action: PayloadAction<number | null>) => {
      state.currentAssignmentId = action.payload;
    },
    setMessages: (state, action: PayloadAction<ChatMessageType[]>) => {
      state.messages = action.payload;
      state.loadingMessages = false;
    },
    appendMessage: (state, action: PayloadAction<ChatMessageType>) => {
      const exists = state.messages.some(m => m.id === action.payload.id);
      if (!exists) state.messages.push(action.payload);
    },
    setLoadingMessages: (state, action: PayloadAction<boolean>) => {
      state.loadingMessages = action.payload;
    },
  },
});

export const {
  setActiveAssignments,
  setCurrentAssignment,
  setMessages,
  appendMessage,
  setLoadingMessages,
} = assignmentsSlice.actions;

export default assignmentsSlice.reducer;
