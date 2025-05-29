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

// Mock pharmacy data based on the provided example
const MOCK_PHARMACIES: Pharmacy[] = [
  {
    "Tarih": "2025-05-28T08:00:00",
    "LokasyonY": "27.192230",
    "LokasyonX": "38.428350",
    "BolgeAciklama": "24:00DEN SONRA- ÇAMDİBİ",
    "Adi": "YENİ TUNCAY ECZANESİ",
    "Telefon": "02324356177",
    "Adres": "TUNA MAH. FAZIL PAŞA CAD. NO:35/A KOŞUKAVAK",
    "BolgeId": 4,
    "Bolge": "ALTINDAĞ"
  },
  {
    "Tarih": "2025-05-28T08:00:00",
    "LokasyonY": "27.057512",
    "LokasyonX": "38.394966",
    "BolgeAciklama": "",
    "Adi": "LOTUS ECZANESİ",
    "Telefon": "02322792666",
    "Adres": "ONUR MAH. MİTHATPAŞA CAD. NO:39/A",
    "BolgeId": 6,
    "Bolge": "BALÇOVA"
  },
  {
    "Tarih": "2025-05-28T08:00:00",
    "LokasyonY": "27.105400",
    "LokasyonX": "38.396900",
    "BolgeAciklama": "",
    "Adi": "KONYA ECZANESİ",
    "Telefon": "02322310457",
    "Adres": "177/5 SOK. NO:23/B BASINSITESI",
    "BolgeId": 7,
    "Bolge": "BASIN SİTESİ"
  },
  {
    "Tarih": "2025-05-28T08:00:00",
    "LokasyonY": "27.166658",
    "LokasyonX": "38.470375",
    "BolgeAciklama": "",
    "Adi": "GÜNDOĞDU ECZANESİ",
    "Telefon": "02323717739",
    "Adres": "ALPASLAN MAH. 1620/15 SOK. NO:11/A",
    "BolgeId": 9,
    "Bolge": "BAYRAKLI"
  },
  {
    "Tarih": "2025-05-28T08:00:00",
    "LokasyonY": "27.216400",
    "LokasyonX": "38.465200",
    "BolgeAciklama": "",
    "Adi": "BENLIOGLU ECZANESİ",
    "Telefon": "02323424557",
    "Adres": "ERGENE MAH. MUSTAFA KEMAL CAD. NO:26/D",
    "BolgeId": 10,
    "Bolge": "BORNOVA 1"
  },
  {
    "Tarih": "2025-05-28T08:00:00",
    "LokasyonY": "27.208600",
    "LokasyonX": "38.457500",
    "BolgeAciklama": "",
    "Adi": "BORNOVA EGE ECZANESİ",
    "Telefon": "02323435516",
    "Adres": "KAZIMDIRIK MAH. ÜNIVERSITE CAD. NO:32/B",
    "BolgeId": 11,
    "Bolge": "BORNOVA 2"
  },
  {
    "Tarih": "2025-05-28T08:00:00",
    "LokasyonY": "27.196900",
    "LokasyonX": "38.456600",
    "BolgeAciklama": "",
    "Adi": "YENI ISIL ECZANESİ",
    "Telefon": "02323472517",
    "Adres": "MANSUROGLU MAH. 266 SOKAK NO:10/C BAYRAKLI",
    "BolgeId": 12,
    "Bolge": "BORNOVA 3"
  },
  {
    "Tarih": "2025-05-28T08:00:00",
    "LokasyonY": "27.127800",
    "LokasyonX": "38.398200",
    "BolgeAciklama": "",
    "Adi": "ÖZHAYAT ECZANESİ",
    "Telefon": "02322503988",
    "Adres": "ESKIIZMIR CAD. NO:61/F ",
    "BolgeId": 14,
    "Bolge": "BOZYAKA"
  },
  {
    "Tarih": "2025-05-28T08:00:00",
    "LokasyonY": "27.166300",
    "LokasyonX": "38.385200",
    "BolgeAciklama": "",
    "Adi": "ERCİYAS ECZANESİ",
    "Telefon": "02324261577",
    "Adres": "ÖZMEN CAD. NO:126/A",
    "BolgeId": 15,
    "Bolge": "BUCA 1"
  },
  {
    "Tarih": "2025-05-28T08:00:00",
    "LokasyonY": "27.193653",
    "LokasyonX": "38.437074",
    "BolgeAciklama": "",
    "Adi": "GÜNGÖR ECZANESİ",
    "Telefon": "02324612616",
    "Adres": "BARBAROS MAH. 5234 SOK. NO:22/A",
    "BolgeId": 16,
    "Bolge": "ÇAMDİBİ"
  }
];

// Pharmacy service for API calls
export const PharmacyService = {
  // Fetch pharmacy data
  getPharmacies: async (): Promise<Pharmacy[]> => {
    try {
      // Since the API is returning HTML instead of JSON, use mock data for now
      return MOCK_PHARMACIES;
    } catch (error) {
      console.error('Error fetching pharmacy data:', error);
      throw error;
    }
  },

  // Get pharmacies sorted by distance from user location
  getNearbyPharmacies: async (
    latitude: number,
    longitude: number
  ): Promise<Pharmacy[]> => {
    try {
      const pharmacies = await PharmacyService.getPharmacies();

      // Calculate distance for each pharmacy and add it to the object
      const pharmaciesWithDistance = pharmacies.map(pharmacy => {
        const pharmLat = parseFloat(pharmacy.LokasyonX);
        const pharmLng = parseFloat(pharmacy.LokasyonY);

        // Calculate distance between user and pharmacy
        const distanceInKm = calculateDistance(
          latitude,
          longitude,
          pharmLat,
          pharmLng
        );

        // Convert to meters
        const distanceInMeters = distanceInKm * 1000;

        return {
          ...pharmacy,
          distanceInMeters
        };
      });

      // Sort pharmacies by distance
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
};

