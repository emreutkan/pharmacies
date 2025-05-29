import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';

// Keys for secure storage
const STORAGE_KEYS = {
  USER_ADDRESS: 'user_address',
  USER_COORDS: 'user_coords'
};

// Location service to handle permissions and getting user location
export const LocationService = {
  // Request location permissions from the user
  requestLocationPermission: async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  },

  // Check current location permission status
  checkLocationPermission: async (): Promise<boolean> => {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  },

  // Get the user's current location
  getCurrentLocation: async () => {
    try {
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      // Save coordinates to secure storage
      await SecureStore.setItemAsync(
        STORAGE_KEYS.USER_COORDS, 
        JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude
        })
      );
      
      return {
        latitude: coords.latitude,
        longitude: coords.longitude,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  },

  // Save user address to secure storage
  saveUserAddress: async (address: string) => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_ADDRESS, address);
      return true;
    } catch (error) {
      console.error('Error saving address:', error);
      return false;
    }
  },

  // Get user address from secure storage
  getUserAddress: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.USER_ADDRESS);
    } catch (error) {
      console.error('Error getting address:', error);
      return null;
    }
  },

  // Save coordinates to secure storage (replacing any previous coordinates)
  saveCoordinates: async (coordinates: {latitude: number, longitude: number}) => {
    try {
      await SecureStore.setItemAsync(
        STORAGE_KEYS.USER_COORDS,
        JSON.stringify(coordinates)
      );
      return true;
    } catch (error) {
      console.error('Error saving coordinates:', error);
      return false;
    }
  },

  // Get saved coordinates from secure storage
  getSavedCoordinates: async (): Promise<{latitude: number, longitude: number} | null> => {
    try {
      const coordsString = await SecureStore.getItemAsync(STORAGE_KEYS.USER_COORDS);
      if (coordsString) {
        return JSON.parse(coordsString);
      }
      return null;
    } catch (error) {
      console.error('Error getting saved coordinates:', error);
      return null;
    }
  },

  // Geocode an address to get coordinates
  geocodeAddress: async (address: string) => {
    try {
      const results = await Location.geocodeAsync(address);
      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        
        // Save coordinates to secure storage
        await SecureStore.setItemAsync(
          STORAGE_KEYS.USER_COORDS, 
          JSON.stringify({
            latitude,
            longitude
          })
        );
        
        return { latitude, longitude };
      }
      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }
};
