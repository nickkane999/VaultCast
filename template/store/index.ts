// Redux store configuration
import { configureStore } from '@reduxjs/toolkit';

// Import feature slices here as you add them
// Example: import exampleSlice from '../lib/features/example/exampleSlice';

export const store = configureStore({
  reducer: {
    // Add your feature reducers here
    // example: exampleSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
