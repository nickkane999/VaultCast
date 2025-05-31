import { configureStore } from "@reduxjs/toolkit";
import aiEmailerReducer from "./aiEmailerSlice";
import aiMessengerReducer from "@/lib/features/ai_messenger/store/aiMessengerSlice";
import decisionHelperReducer from "./decision_helper/decisionHelperSlice";
import moviesReducer from "./moviesSlice";
import tvShowsReducer from "./tvShowsSlice";
import videosReducer from "./videosSlice";
import imageAnalyzerReducer from "./imageAnalyzerSlice";
import marketingLinksReducer from "@/lib/features/marketing_links/store/marketingLinksSlice";

export const store = configureStore({
  reducer: {
    aiEmailer: aiEmailerReducer,
    aiMessenger: aiMessengerReducer,
    decisionHelper: decisionHelperReducer,
    movies: moviesReducer,
    tvShows: tvShowsReducer,
    videos: videosReducer,
    imageAnalyzer: imageAnalyzerReducer,
    marketingLinks: marketingLinksReducer,
  },
});

// Define the RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
