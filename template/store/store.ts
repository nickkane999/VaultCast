import { configureStore } from '@reduxjs/toolkit';
import aiMessengerReducer from '@/lib/features/ai_messenger/store/aiMessengerSlice';

export const store = configureStore({
  reducer: {
    aiMessenger: aiMessengerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
