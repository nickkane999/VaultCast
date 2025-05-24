import { configureStore } from "@reduxjs/toolkit";
import aiEmailerReducer from "./aiEmailerSlice";
import aiMessengerReducer from "./aiMessengerSlice";
import decisionHelperReducer from "./decision_helper/decisionHelperSlice";

export const store = configureStore({
  reducer: {
    aiEmailer: aiEmailerReducer,
    aiMessenger: aiMessengerReducer,
    decisionHelper: decisionHelperReducer,
  },
});

// Define the RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
