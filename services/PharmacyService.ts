// Types for pharmacy data from the API
export interface Pharmacy {
  Tarih: string;           // Date
  LokasyonY: string;       // Longitude
  LokasyonX: string;       // Latitude
  BolgeAciklama: string;   // Region description
  Adi: string;             // Pharmacy name
  Telefon: string;         // Phone number
  Adres: string;           // Address
  BolgeId: number;         // Region ID
  Bolge: string;           // Region name
  distanceInMeters?: number; // Added field for distance calculation
}

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// PharmacyService to fetch and manage pharmacy data
export const PharmacyService = {
  // API endpoint for pharmacies
  API_URL: 'https://openapi.izmir.bel.tr/api/ibb/eczaneler',

  // Cache for pharmacy data
  cachedPharmacies: null as Pharmacy[] | null,
  lastFetchTime: 0,

  // Get all pharmacies from API
  getAllPharmacies: async (): Promise<Pharmacy[]> => {
    try {
      // Check if we have cached data that's less than 1 hour old
      const now = Date.now();
      if (PharmacyService.cachedPharmacies &&
          (now - PharmacyService.lastFetchTime) < 3600000) { // 1 hour in milliseconds
        return PharmacyService.cachedPharmacies;
      }

      // Fetch pharmacies from API
      const response = await fetch(PharmacyService.API_URL);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const pharmacies = await response.json() as Pharmacy[];

      // Update cache
      PharmacyService.cachedPharmacies = pharmacies;
      PharmacyService.lastFetchTime = now;

      return pharmacies;
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      // If API fetch fails and we have cached data, return that
      if (PharmacyService.cachedPharmacies) {
        return PharmacyService.cachedPharmacies;
      }
      // Otherwise throw the error
      throw error;
    }
  },

  // Get pharmacies ordered by distance from user location
  getNearbyPharmacies: async (userLat: number, userLon: number): Promise<Pharmacy[]> => {
    try {
      const pharmacies = await PharmacyService.getAllPharmacies();

      // Add distance to each pharmacy
      const pharmaciesWithDistance = pharmacies.map(pharmacy => {
        const lat = parseFloat(pharmacy.LokasyonX);
        const lon = parseFloat(pharmacy.LokasyonY);

        // Calculate distance in km
        const distance = calculateDistance(userLat, userLon, lat, lon);

        // Convert to meters for better display
        return {
          ...pharmacy,
          distanceInMeters: distance * 1000
        };
      });

      // Sort by distance
      return pharmaciesWithDistance.sort((a, b) =>
        (a.distanceInMeters || 0) - (b.distanceInMeters || 0)
      );
    } catch (error) {
      console.error('Error getting nearby pharmacies:', error);
      throw error;
    }
  }
};

