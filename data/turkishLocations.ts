// Turkish cities and districts with their approximate center coordinates
export interface District {
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface City {
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  districts: District[];
}

export const turkishCities: City[] = [
  {
    name: "İstanbul",
    coordinates: {
      latitude: 41.0082,
      longitude: 28.9784
    },
    districts: [
      {
        name: "Adalar",
        coordinates: { latitude: 40.8730, longitude: 29.0851 }
      },
      {
        name: "Arnavutköy",
        coordinates: { latitude: 41.1839, longitude: 28.7411 }
      },
      {
        name: "Ataşehir",
        coordinates: { latitude: 40.9830, longitude: 29.1273 }
      },
      {
        name: "Avcılar",
        coordinates: { latitude: 40.9793, longitude: 28.7216 }
      },
      {
        name: "Bağcılar",
        coordinates: { latitude: 41.0357, longitude: 28.8590 }
      },
      {
        name: "Bahçelievler",
        coordinates: { latitude: 40.9982, longitude: 28.8525 }
      },
      {
        name: "Bakırköy",
        coordinates: { latitude: 40.9806, longitude: 28.8772 }
      },
      {
        name: "Başakşehir",
        coordinates: { latitude: 41.0935, longitude: 28.8016 }
      },
      {
        name: "Bayrampaşa",
        coordinates: { latitude: 41.0423, longitude: 28.9068 }
      },
      {
        name: "Beşiktaş",
        coordinates: { latitude: 41.0484, longitude: 29.0101 }
      },
      {
        name: "Beykoz",
        coordinates: { latitude: 41.1288, longitude: 29.0986 }
      },
      {
        name: "Beylikdüzü",
        coordinates: { latitude: 40.9821, longitude: 28.6284 }
      },
      {
        name: "Beyoğlu",
        coordinates: { latitude: 41.0318, longitude: 28.9744 }
      },
      {
        name: "Büyükçekmece",
        coordinates: { latitude: 41.0193, longitude: 28.5946 }
      },
      {
        name: "Çatalca",
        coordinates: { latitude: 41.1442, longitude: 28.4570 }
      },
      {
        name: "Çekmeköy",
        coordinates: { latitude: 41.0359, longitude: 29.1772 }
      },
      {
        name: "Esenler",
        coordinates: { latitude: 41.0432, longitude: 28.8746 }
      },
      {
        name: "Esenyurt",
        coordinates: { latitude: 41.0296, longitude: 28.6735 }
      },
      {
        name: "Eyüpsultan",
        coordinates: { latitude: 41.0478, longitude: 28.9240 }
      },
      {
        name: "Fatih",
        coordinates: { latitude: 41.0179, longitude: 28.9395 }
      },
      {
        name: "Gaziosmanpaşa",
        coordinates: { latitude: 41.0658, longitude: 28.9139 }
      },
      {
        name: "Güngören",
        coordinates: { latitude: 41.0183, longitude: 28.8823 }
      },
      {
        name: "Kadıköy",
        coordinates: { latitude: 40.9928, longitude: 29.0264 }
      },
      {
        name: "Kağıthane",
        coordinates: { latitude: 41.0852, longitude: 28.9735 }
      },
      {
        name: "Kartal",
        coordinates: { latitude: 40.8918, longitude: 29.1866 }
      },
      {
        name: "Küçükçekmece",
        coordinates: { latitude: 41.0045, longitude: 28.7781 }
      },
      {
        name: "Maltepe",
        coordinates: { latitude: 40.9353, longitude: 29.1311 }
      },
      {
        name: "Pendik",
        coordinates: { latitude: 40.8781, longitude: 29.2509 }
      },
      {
        name: "Sancaktepe",
        coordinates: { latitude: 41.0033, longitude: 29.2303 }
      },
      {
        name: "Sarıyer",
        coordinates: { latitude: 41.1670, longitude: 29.0572 }
      },
      {
        name: "Silivri",
        coordinates: { latitude: 41.0792, longitude: 28.2438 }
      },
      {
        name: "Sultanbeyli",
        coordinates: { latitude: 40.9608, longitude: 29.2714 }
      },
      {
        name: "Sultangazi",
        coordinates: { latitude: 41.1077, longitude: 28.8671 }
      },
      {
        name: "Şile",
        coordinates: { latitude: 41.1769, longitude: 29.6143 }
      },
      {
        name: "Şişli",
        coordinates: { latitude: 41.0606, longitude: 28.9877 }
      },
      {
        name: "Tuzla",
        coordinates: { latitude: 40.8161, longitude: 29.2997 }
      },
      {
        name: "Ümraniye",
        coordinates: { latitude: 41.0263, longitude: 29.0978 }
      },
      {
        name: "Üsküdar",
        coordinates: { latitude: 41.0231, longitude: 29.0148 }
      },
      {
        name: "Zeytinburnu",
        coordinates: { latitude: 40.9934, longitude: 28.9055 }
      }
    ]
  },
  {
    name: "İzmir",
    coordinates: {
      latitude: 38.4192,
      longitude: 27.1287
    },
    districts: [
      {
        name: "Aliağa",
        coordinates: { latitude: 38.8006, longitude: 26.9715 }
      },
      {
        name: "Balçova",
        coordinates: { latitude: 38.3866, longitude: 27.0575 }
      },
      {
        name: "Bayındır",
        coordinates: { latitude: 38.2195, longitude: 27.6462 }
      },
      {
        name: "Bayraklı",
        coordinates: { latitude: 38.4627, longitude: 27.1691 }
      },
      {
        name: "Bergama",
        coordinates: { latitude: 39.1069, longitude: 27.1743 }
      },
      {
        name: "Beydağ",
        coordinates: { latitude: 38.0837, longitude: 28.2093 }
      },
      {
        name: "Bornova",
        coordinates: { latitude: 38.4702, longitude: 27.2151 }
      },
      {
        name: "Buca",
        coordinates: { latitude: 38.3857, longitude: 27.1783 }
      },
      {
        name: "Çeşme",
        coordinates: { latitude: 38.3235, longitude: 26.3746 }
      },
      {
        name: "Çiğli",
        coordinates: { latitude: 38.5131, longitude: 27.0811 }
      },
      {
        name: "Dikili",
        coordinates: { latitude: 39.0728, longitude: 26.8896 }
      },
      {
        name: "Foça",
        coordinates: { latitude: 38.6697, longitude: 26.7563 }
      },
      {
        name: "Gaziemir",
        coordinates: { latitude: 38.3245, longitude: 27.1335 }
      },
      {
        name: "Güzelbahçe",
        coordinates: { latitude: 38.3660, longitude: 26.8920 }
      },
      {
        name: "Karabağlar",
        coordinates: { latitude: 38.3696, longitude: 27.1345 }
      },
      {
        name: "Karaburun",
        coordinates: { latitude: 38.6376, longitude: 26.5123 }
      },
      {
        name: "Karşıyaka",
        coordinates: { latitude: 38.4613, longitude: 27.1107 }
      },
      {
        name: "Kemalpaşa",
        coordinates: { latitude: 38.4260, longitude: 27.4249 }
      },
      {
        name: "Kınık",
        coordinates: { latitude: 39.0845, longitude: 27.3891 }
      },
      {
        name: "Kiraz",
        coordinates: { latitude: 38.2318, longitude: 28.2045 }
      },
      {
        name: "Konak",
        coordinates: { latitude: 38.4127, longitude: 27.1384 }
      },
      {
        name: "Menderes",
        coordinates: { latitude: 38.2546, longitude: 27.1300 }
      },
      {
        name: "Menemen",
        coordinates: { latitude: 38.6056, longitude: 27.0661 }
      },
      {
        name: "Narlıdere",
        coordinates: { latitude: 38.3943, longitude: 27.0064 }
      },
      {
        name: "Ödemiş",
        coordinates: { latitude: 38.2254, longitude: 27.9684 }
      },
      {
        name: "Seferihisar",
        coordinates: { latitude: 38.1968, longitude: 26.8387 }
      },
      {
        name: "Selçuk",
        coordinates: { latitude: 37.9504, longitude: 27.3680 }
      },
      {
        name: "Tire",
        coordinates: { latitude: 38.0943, longitude: 27.7346 }
      },
      {
        name: "Torbalı",
        coordinates: { latitude: 38.1572, longitude: 27.3606 }
      },
      {
        name: "Urla",
        coordinates: { latitude: 38.3232, longitude: 26.7649 }
      }
    ]
  },
  {
    name: "Ankara",
    coordinates: {
      latitude: 39.9334,
      longitude: 32.8597
    },
    districts: [
      {
        name: "Akyurt",
        coordinates: { latitude: 40.1316, longitude: 33.0833 }
      },
      {
        name: "Altındağ",
        coordinates: { latitude: 39.9770, longitude: 32.9864 }
      },
      {
        name: "Ayaş",
        coordinates: { latitude: 40.0179, longitude: 32.3326 }
      },
      {
        name: "Bala",
        coordinates: { latitude: 39.5581, longitude: 32.9969 }
      },
      {
        name: "Beypazarı",
        coordinates: { latitude: 40.1675, longitude: 31.9212 }
      },
      {
        name: "Çamlıdere",
        coordinates: { latitude: 40.4928, longitude: 32.5032 }
      },
      {
        name: "Çankaya",
        coordinates: { latitude: 39.9208, longitude: 32.8541 }
      },
      {
        name: "Çubuk",
        coordinates: { latitude: 40.2380, longitude: 33.0294 }
      },
      {
        name: "Elmadağ",
        coordinates: { latitude: 39.9196, longitude: 33.2478 }
      },
      {
        name: "Etimesgut",
        coordinates: { latitude: 39.9590, longitude: 32.6868 }
      },
      {
        name: "Evren",
        coordinates: { latitude: 39.0280, longitude: 33.7978 }
      },
      {
        name: "Gölbaşı",
        coordinates: { latitude: 39.7935, longitude: 32.8161 }
      },
      {
        name: "Güdül",
        coordinates: { latitude: 40.2139, longitude: 32.2479 }
      },
      {
        name: "Haymana",
        coordinates: { latitude: 39.4326, longitude: 32.4954 }
      },
      {
        name: "Kahramankazan",
        coordinates: { latitude: 40.2318, longitude: 32.6852 }
      },
      {
        name: "Kalecik",
        coordinates: { latitude: 40.0996, longitude: 33.4077 }
      },
      {
        name: "Keçiören",
        coordinates: { latitude: 40.0000, longitude: 32.8740 }
      },
      {
        name: "Kızılcahamam",
        coordinates: { latitude: 40.4719, longitude: 32.6500 }
      },
      {
        name: "Mamak",
        coordinates: { latitude: 39.9344, longitude: 32.9633 }
      },
      {
        name: "Nallıhan",
        coordinates: { latitude: 40.1869, longitude: 31.3411 }
      },
      {
        name: "Polatlı",
        coordinates: { latitude: 39.5840, longitude: 32.1461 }
      },
      {
        name: "Pursaklar",
        coordinates: { latitude: 40.0329, longitude: 32.8990 }
      },
      {
        name: "Sincan",
        coordinates: { latitude: 39.9744, longitude: 32.5819 }
      },
      {
        name: "Şereflikoçhisar",
        coordinates: { latitude: 38.9416, longitude: 33.5394 }
      },
      {
        name: "Yenimahalle",
        coordinates: { latitude: 39.9767, longitude: 32.7966 }
      }
    ]
  }
];

/**
 * Normalize Turkish text for searching (handles special characters)
 * @param text Text to normalize
 * @returns Normalized text with Turkish characters converted to English equivalents
 */
function normalizeTurkishText(text: string): string {
  return text.toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/İ/g, 'i');
}

/**
 * Search for locations by name, handling Turkish characters
 * @param query The search query
 * @returns Array of search results with city and district information
 */
export function searchLocations(query: string) {
  if (!query || query.length < 2) {
    return [];
  }

  const normalizedQuery = normalizeTurkishText(query.trim());
  const results: { city: string; district?: string; coordinates: { latitude: number; longitude: number } }[] = [];

  turkishCities.forEach(city => {
    // Check if query matches city name
    if (normalizeTurkishText(city.name).includes(normalizedQuery)) {
      results.push({
        city: city.name,
        coordinates: city.coordinates
      });
    }

    // Check if query matches any district name
    city.districts.forEach(district => {
      if (normalizeTurkishText(district.name).includes(normalizedQuery)) {
        results.push({
          city: city.name,
          district: district.name,
          coordinates: district.coordinates
        });
      }
    });
  });

  return results.slice(0, 5); // Limit to 5 results
}
