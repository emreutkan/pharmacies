import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';

// Keys for secure storage
const STORAGE_KEYS = {
  USER_ADDRESS: 'user_address', // Will store "Region, District" format only
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

  // Get the user's current location and save coordinates
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

  // Format address to "Region, District" format and save it
  formatAndSaveAddress: async (location: Location.LocationGeocodedAddress): Promise<string> => {
    // Extract region (city) and district
    const region = location.city || location.region || '';
    const district = location.district || '';

    // Format as "Region, District"
    let formattedAddress = '';

    if (region && district) {
      formattedAddress = `${region}, ${district}`;
    } else if (region) {
      formattedAddress = region;
    } else if (district) {
      formattedAddress = district;
    } else {
      formattedAddress = 'Unknown Location';
    }

    // Save formatted address
    await SecureStore.setItemAsync(STORAGE_KEYS.USER_ADDRESS, formattedAddress);
    return formattedAddress;
  },

  // Save user address in "Region, District" format
  saveUserAddress: async (region: string, district: string = '') => {
    try {
      let formattedAddress = district ? `${region}, ${district}` : region;
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_ADDRESS, formattedAddress);
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

  // Get address details from coordinates
  getAddressFromCoordinates: async (coords: { latitude: number; longitude: number }) => {
    try {
      const result = await Location.reverseGeocodeAsync(coords);

      if (result && result.length > 0) {
        const locationData = result[0];
        return await LocationService.formatAndSaveAddress(locationData);
      }

      return null;
    } catch (error) {
      console.error('Error getting address from coordinates:', error);
      return null;
    }
  }
};
