import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert, ScrollView, ActivityIndicator, TouchableOpacity, Linking, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LocationService } from '../../services/LocationService';
import { AddressInput } from '../../components/AddressInput';
import { PharmacyService, Pharmacy } from '../../services/PharmacyService';

type LocationState = {
  latitude: number;
  longitude: number;
  permissionGranted: boolean;
  isLoading: boolean;
};

export default function HomeScreen() {
  const [location, setLocation] = useState<LocationState>({
    latitude: 0,
    longitude: 0,
    permissionGranted: false,
    isLoading: true,
  });

  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  // Check if location permissions are granted
  const checkLocationPermission = async () => {
    try {
      const hasPermission = await LocationService.checkLocationPermission();

      if (hasPermission) {
        // If permission granted, get current location
        getUserLocation();
      } else {
        // If no permission, check for saved coordinates
        const savedCoords = await LocationService.getSavedCoordinates();
        if (savedCoords) {
          setLocation({
            ...savedCoords,
            permissionGranted: false,
            isLoading: false,
          });
          // Use saved coordinates to find pharmacies
          findPharmacies(savedCoords);
        } else {
          // No saved coordinates, user will need to input address
          setLocation(prev => ({ ...prev, isLoading: false }));
        }
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      setLocation(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Request location permission from user
  const requestLocationPermission = async () => {
    try {
      setLocation(prev => ({ ...prev, isLoading: true }));
      const granted = await LocationService.requestLocationPermission();

      if (granted) {
        getUserLocation();
      } else {
        Alert.alert(
          'Location Access Denied',
          'Please enter your address manually to find pharmacies near you.',
          [{ text: 'OK' }]
        );
        setLocation(prev => ({
          ...prev,
          permissionGranted: false,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      setLocation(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Get user's current location
  const getUserLocation = async () => {
    try {
      const coords = await LocationService.getCurrentLocation();
      setLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        permissionGranted: true,
        isLoading: false,
      });

      // Find pharmacies using the user's location
      findPharmacies(coords);
    } catch (error) {
      console.error('Error getting location:', error);
      setLocation(prev => ({ ...prev, isLoading: false }));
      Alert.alert(
        'Location Error',
        'Unable to get your location. Please try again or enter your address manually.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle address saved from AddressInput component
  const handleAddressSaved = (coords: { latitude: number; longitude: number }) => {
    setLocation({
      ...coords,
      permissionGranted: false,
      isLoading: false,
    });

    // Find pharmacies using the provided address coordinates
    findPharmacies(coords);
  };

  // Find pharmacies using the local data
  const findPharmacies = async (coords: { latitude: number; longitude: number }) => {
    setIsSearching(true);

    try {
      const nearbyPharmacies = await PharmacyService.getNearbyPharmacies(
        coords.latitude,
        coords.longitude
      );

      setPharmacies(nearbyPharmacies);
      setIsSearching(false);
    } catch (error) {
      console.error('Error finding pharmacies:', error);
      setIsSearching(false);
      Alert.alert('Error', 'Failed to find nearby pharmacies. Please try again.');
    }
  };

  // Open phone dialer with pharmacy phone number
  const callPharmacy = (phoneNumber: string) => {
    let phoneUrl = `tel:${phoneNumber}`;
    Linking.canOpenURL(phoneUrl)
      .then(supported => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'Phone dialer is not available on this device');
        }
      })
      .catch(err => console.error('Error opening phone dialer:', err));
  };

  // Open maps app with directions to pharmacy
  const getDirections = (pharmacy: Pharmacy) => {
    const scheme = Platform.select({ ios: 'maps:', android: 'geo:' });
    const latLng = `${pharmacy.LokasyonX},${pharmacy.LokasyonY}`;
    const label = encodeURIComponent(pharmacy.Adi);
    const url = Platform.select({
      ios: `${scheme}?q=${label}&ll=${latLng}`,
      android: `${scheme}0,0?q=${latLng}(${label})`
    });

    if (url) {
      Linking.openURL(url)
        .catch(err => {
          console.error('Error opening maps app:', err);
          Alert.alert('Error', 'Could not open maps application');
        });
    }
  };

  // Format distance to be more readable
  const formatDistance = (meters: number | undefined): string => {
    if (meters === undefined) return 'Distance unknown';
    if (meters < 1000) return `${meters.toFixed(0)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  // Render pharmacy list item
  const renderPharmacyItem = (pharmacy: Pharmacy) => (
    <View key={pharmacy.Adi + pharmacy.Adres} style={styles.pharmacyItem}>
      <Text style={styles.pharmacyName}>{pharmacy.Adi}</Text>
      <Text style={styles.pharmacyDistance}>
        {formatDistance(pharmacy.distanceInMeters)}
      </Text>
      <Text style={styles.pharmacyAddress}>{pharmacy.Adres}</Text>
      <Text style={styles.pharmacyRegion}>{pharmacy.Bolge} {pharmacy.BolgeAciklama ? `- ${pharmacy.BolgeAciklama}` : ''}</Text>

      <View style={styles.pharmacyActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => callPharmacy(pharmacy.Telefon)}
        >
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => getDirections(pharmacy)}
        >
          <Text style={styles.actionButtonText}>Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (location.isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text style={styles.loadingText}>Getting location...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <StatusBar style="auto" />

      <View style={styles.header}>
        <Text style={styles.title}>Nearby Pharmacies</Text>
        <Text style={styles.subtitle}>Izmir, Turkey</Text>
      </View>

      {!location.permissionGranted && (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            We need your location to find pharmacies near you.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestLocationPermission}
          >
            <Text style={styles.permissionButtonText}>
              Allow Location Access
            </Text>
          </TouchableOpacity>
          <Text style={styles.orText}>- OR -</Text>
        </View>
      )}

      {!location.permissionGranted && (
        <AddressInput onAddressSaved={handleAddressSaved} />
      )}

      {isSearching ? (
        <View style={styles.searchingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text style={styles.searchingText}>Finding nearby pharmacies in Izmir...</Text>
        </View>
      ) : pharmacies.length > 0 ? (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>
            Found {pharmacies.length} pharmacies near you
          </Text>
          {pharmacies.map(renderPharmacyItem)}
        </View>
      ) : (location.latitude !== 0 && location.longitude !== 0) ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No pharmacies found nearby.</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => findPharmacies({
              latitude: location.latitude,
              longitude: location.longitude
            })}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  permissionContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  orText: {
    marginVertical: 16,
    color: '#666',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  searchingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  searchingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  resultsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  pharmacyItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 8,
  },
  pharmacyName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  pharmacyDistance: {
    fontSize: 14,
    color: '#0a7ea4',
    marginBottom: 4,
  },
  pharmacyAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  pharmacyRegion: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  pharmacyActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginRight: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
