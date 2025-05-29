import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PharmacyService } from '@/services/PharmacyService';

// Define types for our slice state
interface PharmacyState {
  pharmacies: any[]; // Replace with a proper type if available
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

// Initial state
const initialState: PharmacyState = {
  pharmacies: [],
  loading: false,
  error: null,
  initialized: false
};

// Async thunk for fetching pharmacies
export const fetchPharmacies = createAsyncThunk(
  'pharmacy/fetchPharmacies',
  async (_, { rejectWithValue }) => {
    try {
      const pharmacies = await PharmacyService.getAllPharmacies();
      return pharmacies;
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      return rejectWithValue('Failed to load pharmacies');
    }
  }
);

// Create the pharmacy slice
const pharmacySlice = createSlice({
  name: 'pharmacy',
  initialState,
  reducers: {
    resetPharmacies: (state) => {
      state.pharmacies = [];
      state.initialized = false;
    },
    setInitialized: (state) => {
      state.initialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPharmacies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPharmacies.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loading = false;
        state.pharmacies = action.payload;
        state.initialized = true;
      })
      .addCase(fetchPharmacies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetPharmacies, setInitialized } = pharmacySlice.actions;
export default pharmacySlice.reducer;
