import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';

export interface Pharmacy {
  EczaneId: number;
  Adi: string;
  Adres: string;
  Telefon: string;
  Bolge: string;
  BolgeAciklama?: string;
  LokasyonX: string;
  LokasyonY: string;
  distanceInMeters?: number; // Added after distance calculation
  isOnDuty?: boolean; // Flag for duty pharmacies
}

// Cache keys
const PHARMACY_CACHE_KEY = 'PHARMACY_DATA_CACHE';
const PHARMACY_CACHE_TIMESTAMP_KEY = 'PHARMACY_DATA_TIMESTAMP';
const PHARMACY_CACHE_REGION_KEY = 'PHARMACY_DATA_REGION';
const CACHE_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

export class PharmacyService {
  private static readonly dummyPharmacies: Pharmacy[] = [
    // ... existing pharmacy data ...
  ];

  // Check if we're in Izmir region
  static async isInIzmirRegion(latitude: number, longitude: number): Promise<boolean> {
    try {
      const geocodeResult = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (geocodeResult && geocodeResult.length > 0) {
        const { city, region, subregion } = geocodeResult[0]; // Added subregion
        const izmirLower = 'izmir';
        return (
          city?.toLowerCase() === izmirLower ||
          region?.toLowerCase() === izmirLower ||
          subregion?.toLowerCase() === izmirLower // Added check for subregion
        );
      }
      return false;
    } catch (error) {
      console.error('Error checking region:', error);
      return false;
    }
  }

  // Get all pharmacies with caching
  static async getAllPharmacies(): Promise<Pharmacy[]> {
    try {
      // Try to get cached data
      const cachedData = await SecureStore.getItemAsync(PHARMACY_CACHE_KEY);
      const cachedTimestampStr = await SecureStore.getItemAsync(PHARMACY_CACHE_TIMESTAMP_KEY);

      // If we have cached data, check if it's still valid
      if (cachedData && cachedTimestampStr) {
        const cachedTimestamp = parseInt(cachedTimestampStr, 10);
        const now = Date.now();

        // If cache is less than 3 hours old, use it
        // if (now - cachedTimestamp < CACHE_DURATION_MS) {
        //   console.log('Using cached pharmacy data');
        //   return JSON.parse(cachedData);
        // }
        console.log('Using cached pharmacy data');

      }

      // If no valid cache, fetch fresh data
      console.log('Fetching fresh pharmacy data');

      // In a real app, this would be an API call
      // For now, we'll use our dummy data but simulate a network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Cache the data for future use
      await SecureStore.setItemAsync(PHARMACY_CACHE_KEY, JSON.stringify(this.dummyPharmacies));
      await SecureStore.setItemAsync(PHARMACY_CACHE_TIMESTAMP_KEY, Date.now().toString());
      await SecureStore.setItemAsync(PHARMACY_CACHE_REGION_KEY, 'izmir');

      return this.dummyPharmacies;
    } catch (error) {
      console.error('Error getting pharmacy data:', error);
      throw error;
    }
  }

  // Get nearby pharmacies based on user location
  static async getNearbyPharmacies(latitude: number, longitude: number): Promise<Pharmacy[]> {
    try {
      // Check if the location is in Izmir
      const inIzmir = await this.isInIzmirRegion(latitude, longitude);
      if (!inIzmir) {
        throw new Error("We only have data for Izmir region at the moment");
      }

      // Get cached region to check if we need to fetch new data
      const cachedRegion = await SecureStore.getItemAsync(PHARMACY_CACHE_REGION_KEY);

      // If the cached region is different, force refresh the data
      if (cachedRegion && cachedRegion.toLowerCase() !== 'izmir') {
        // Clear cache to force a refresh
        await SecureStore.deleteItemAsync(PHARMACY_CACHE_KEY);
        await SecureStore.deleteItemAsync(PHARMACY_CACHE_TIMESTAMP_KEY);
        await SecureStore.deleteItemAsync(PHARMACY_CACHE_REGION_KEY);
      }

      // Get all pharmacies (this uses caching internally)
      const pharmacies = await this.getAllPharmacies();

      // Calculate distances and sort by proximity
      const pharmaciesWithDistance = pharmacies.map(pharmacy => {
        const pharmacyLat = parseFloat(pharmacy.LokasyonX);
        const pharmacyLon = parseFloat(pharmacy.LokasyonY);

        const distance = this.calculateDistance(
          latitude,
          longitude,
          pharmacyLat,
          pharmacyLon
        );

        return {
          ...pharmacy,
          distanceInMeters: distance
        };
      });

      // Sort pharmacies by distance (closest first)
      return pharmaciesWithDistance.sort((a, b) => {
        if (!a.distanceInMeters) return 1;
        if (!b.distanceInMeters) return -1;
        return a.distanceInMeters - b.distanceInMeters;
      });
    } catch (error) {
      console.error('Error getting nearby pharmacies:', error);
      throw error;
    }
  }

  // Get duty pharmacies
  static async getDutyPharmacies(latitude: number, longitude: number): Promise<Pharmacy[]> {
    try {
      // Get nearby pharmacies first (this uses caching)
      const nearbyPharmacies = await this.getNearbyPharmacies(latitude, longitude);

      // In a real app, you would fetch duty pharmacies from an API
      // For now, we'll simulate by marking random pharmacies as on duty
      const dutyPharmacies = nearbyPharmacies
        .filter((_, index) => index % 5 === 0) // Every 5th pharmacy is on duty
        .map(pharmacy => ({
          ...pharmacy,
          isOnDuty: true
        }));

      return dutyPharmacies;
    } catch (error) {
      console.error('Error getting duty pharmacies:', error);
      throw error;
    }
  }

  // Calculate distance between two coordinates in meters
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    // Haversine formula to calculate distance between two points on Earth
    const R = 6371e3; // Earth's radius in meters
    const φ1 = this.toRadians(lat1);
    const φ2 = this.toRadians(lat2);
    const Δφ = this.toRadians(lat2 - lat1);
    const Δλ = this.toRadians(lon2 - lon1);

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  private static toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }
}
