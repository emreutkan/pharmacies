import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { LocationService } from '@/services/LocationService';

// Define types for our slice state
interface LocalStorageState {
  userAddress: string | null;
  userCoordinates: {
    latitude: number;
    longitude: number;
  } | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: LocalStorageState = {
  userAddress: null,
  userCoordinates: null,
  loading: false,
  error: null
};

// Async thunk for loading address data
export const loadAddressData = createAsyncThunk(
  'localStorage/loadAddressData',
  async (_, { rejectWithValue }) => {
    try {
      // Load both address and coordinates from storage
      const [address, coordinates] = await Promise.all([
        LocationService.getUserAddress(),
        LocationService.getSavedCoordinates()
      ]);

      return { address, coordinates };
    } catch (error) {
      console.error('Error loading address data:', error);
      return rejectWithValue('Failed to load address data');
    }
  }
);

// Create the localStorage slice
const localStorageSlice = createSlice({
  name: 'localStorage',
  initialState,
  reducers: {
    // This reducer will be called when address is updated in the app
    updateAddress: (state, action: PayloadAction<string>) => {
      state.userAddress = action.payload;
    },
    // This reducer will be called when coordinates are updated in the app
    updateCoordinates: (state, action: PayloadAction<{latitude: number; longitude: number}>) => {
      state.userCoordinates = action.payload;
    },
    // Reset all data
    resetAddressData: (state) => {
      state.userAddress = null;
      state.userCoordinates = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAddressData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadAddressData.fulfilled, (state, action) => {
        state.loading = false;
        state.userAddress = action.payload.address;
        state.userCoordinates = action.payload.coordinates;
      })
      .addCase(loadAddressData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// Export the actions
export const { updateAddress, updateCoordinates, resetAddressData } = localStorageSlice.actions;

// Export the reducer
export default localStorageSlice.reducer;
