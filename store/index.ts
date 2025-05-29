import { configureStore } from '@reduxjs/toolkit';
import pharmacyReducer from './slices/pharmacySlice';

export const store = configureStore({
  reducer: {
    pharmacy: pharmacyReducer,
    // Add other reducers here as needed
  },
});

// Infer the RootState and AppDispatch types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export typed hooks for use in components
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
