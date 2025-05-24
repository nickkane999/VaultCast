import { configureStore } from "@reduxjs/toolkit";
import aiEmailerReducer from "./aiEmailerSlice";
import aiMessengerReducer from "./aiMessengerSlice";
import decisionHelperReducer from "./decision_helper/decisionHelperSlice";
import videosReducer from "./videosSlice";

export const store = configureStore({
  reducer: {
    aiEmailer: aiEmailerReducer,
    aiMessenger: aiMessengerReducer,
    decisionHelper: decisionHelperReducer,
    videos: videosReducer,
  },
});

// Define the RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
