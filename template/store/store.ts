import { configureStore } from "@reduxjs/toolkit";
import aiEmailerReducer from '@/lib/features/ai_emailer/store/aiEmailerSlice';
import aiMessengerReducer from "@/lib/features/ai_messenger/store/aiMessengerSlice";

export const store = configureStore({
  reducer: {
    aiMessenger: aiMessengerReducer,
  
    aiEmailer: aiEmailerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
