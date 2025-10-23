import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import posReducer from './posSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pos: posReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
