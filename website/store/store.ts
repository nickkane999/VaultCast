import { configureStore } from "@reduxjs/toolkit";
import aiEmailerReducer from "./aiEmailerSlice";
import aiMessengerReducer from "./aiMessengerSlice";

export const store = configureStore({
  reducer: {
    aiEmailer: aiEmailerReducer,
    aiMessenger: aiMessengerReducer,
  },
});

// Define the RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
