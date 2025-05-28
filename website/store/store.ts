import { configureStore } from "@reduxjs/toolkit";
import aiEmailerReducer from "./aiEmailerSlice";
import aiMessengerReducer from "./aiMessengerSlice";
import decisionHelperReducer from "./decision_helper/decisionHelperSlice";
import moviesReducer from "./moviesSlice";
import tvShowsReducer from "./tvShowsSlice";
import videosReducer from "./videosSlice";
import imageAnalyzerReducer from "./imageAnalyzerSlice";

export const store = configureStore({
  reducer: {
    aiEmailer: aiEmailerReducer,
    aiMessenger: aiMessengerReducer,
    decisionHelper: decisionHelperReducer,
    movies: moviesReducer,
    tvShows: tvShowsReducer,
    videos: videosReducer,
    imageAnalyzer: imageAnalyzerReducer,
  },
});

// Define the RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
