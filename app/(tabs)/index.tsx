import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Alert, TouchableOpacity, Linking, Platform, Dimensions, ActivityIndicator, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { LocationService } from '@/services/LocationService';
import { AddressBar } from '@/components/AddressBar';
import { PharmacyService, Pharmacy } from '@/services/PharmacyService';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchPharmacies } from '@/store/slices/pharmacySlice';
import { loadAddressData } from '@/store/slices/localStorageSlice';

type LocationState = {
  latitude: number;
  longitude: number;
  permissionGranted: boolean;
  isLoading: boolean;
  region?: string;
};

export default function HomeScreen() {
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<LocationState>({
    latitude: 0,
    longitude: 0,
    permissionGranted: false,
    isLoading: true,
  });

  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [showDutyOnly, setShowDutyOnly] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const { loading, initialized } = useAppSelector(state => state.pharmacy);
  const { userAddress: reduxUserAddress, userCoordinates } = useAppSelector(state => state.localStorage);

  // Function to handle address selection from AddressBar
  const handleAddressConfirmedFromBar = async (address: string, coords: { latitude: number; longitude: number }) => {
    setLocation({
      latitude: coords.latitude,
      longitude: coords.longitude,
      permissionGranted: false, // Address was manually selected/confirmed
      isLoading: false,
    });
    // Update with the simplified address format
    setUserAddress(address);
    await LocationService.saveCoordinates(coords);
    await checkRegionAndLoadPharmacies(coords); // Reload pharmacies for the new location
  };

  useEffect(() => {
    checkLocationPermission();
    loadSavedAddress();
    // Load address data into Redux store
    dispatch(loadAddressData());
  }, [dispatch]);

  // Update local state when Redux state changes (if needed)
  useEffect(() => {
    if (reduxUserAddress && !location.isLoading) {
      setUserAddress(reduxUserAddress);
    }
  }, [reduxUserAddress]);

  // Load saved address from storage
  const loadSavedAddress = async () => {
    const address = await LocationService.getUserAddress();
    if (address) {
      setUserAddress(address);
    }
  };

  // Check if location permissions are granted
  const checkLocationPermission = async () => {
    try {
      const hasPermission = await LocationService.checkLocationPermission();

      if (hasPermission) {
        // If permission granted, get current location
        await getUserLocation(); // Added await
      } else {
        // If no permission, check for saved coordinates
        const savedCoords = await LocationService.getSavedCoordinates();
        if (savedCoords) {
          setLocation({
            ...savedCoords,
            permissionGranted: false,
            isLoading: false,
          });

          // Check the region before loading pharmacies
          await checkRegionAndLoadPharmacies(savedCoords); // Added await
        } else {
          // No saved coordinates, user will need to use AddressBar
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

  // Check region and load pharmacies if region is Izmir
  const checkRegionAndLoadPharmacies = async (coords: { latitude: number; longitude: number }) => {
    try {
      setErrorMessage(null);
      // First, determine the region
      const geocodeResult = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude
      });

      let regionName = null;
      if (geocodeResult && geocodeResult.length > 0) {
        regionName = geocodeResult[0].city || geocodeResult[0].region;
      }

      // Store the normalized region name for comparison
      const normalizedRegionName = regionName?.toLowerCase();

      // Only update the region state if it's different to avoid unnecessary re-renders
      if (normalizedRegionName !== currentRegion?.toLowerCase()) {
        setCurrentRegion(regionName);
      }

      // Check if we're in Izmir
      const isIzmir = await PharmacyService.isInIzmirRegion(coords.latitude, coords.longitude);

      if (isIzmir) {
        // Only load pharmacies if they haven't been initialized yet from the store
        // AND we are not currently in the process of searching.
        if (!initialized && !isSearching) {
          await findPharmacies(coords);
        }
      } else {
        setErrorMessage(`We only have pharmacy data for Izmir. Current region: ${regionName || 'Unknown'}`);
        if (pharmacies.length > 0) {
          setPharmacies([]);
        }
      }
    } catch (error) {
      console.error('Error checking region:', error);
      setErrorMessage('Error determining your region. Please try again.');
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

      // Try to get address from coordinates via reverse geocoding
      try {
        const addressResult = await Location.reverseGeocodeAsync({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });

        if (addressResult && addressResult.length > 0) {
          const addressInfo = addressResult[0];
          const formattedAddress = [
            addressInfo.street,
            addressInfo.district,
            addressInfo.city
          ]
            .filter(Boolean)
            .join(', ');

          if (formattedAddress) {
            setUserAddress(formattedAddress);
            await LocationService.saveUserAddress(formattedAddress);
          }
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
      }

      // Check region before finding pharmacies
      await checkRegionAndLoadPharmacies(coords);
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

  // Find pharmacies using the local data
  const findPharmacies = async (coords: { latitude: number; longitude: number }) => {
    setIsSearching(true);
    setErrorMessage(null);
    dispatch(fetchPharmacies());

    try {
      // Get pharmacies based on the current filter setting
      let nearbyPharmacies: Pharmacy[] = [];

      if (showDutyOnly) {
        nearbyPharmacies = await PharmacyService.getDutyPharmacies(
          coords.latitude,
          coords.longitude
        );
      } else {
        nearbyPharmacies = await PharmacyService.getNearbyPharmacies(
          coords.latitude,
          coords.longitude
        );
      }

      setPharmacies(nearbyPharmacies);

      // Fit map to show all markers
      if (nearbyPharmacies.length > 0 && mapRef.current) {
        fitMapToMarkers(nearbyPharmacies);
      }

      setIsSearching(false);
    } catch (error) {
      console.error('Error finding pharmacies:', error);
      setIsSearching(false);

      // Handle region-specific errors
      if (error instanceof Error && error.message.includes('only have data for Izmir')) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Failed to find nearby pharmacies. Please try again.');
      }
    }
  };

  // Fit map to show all pharmacy markers
  const fitMapToMarkers = (pharmaciesToFit: Pharmacy[]) => {
    if (pharmaciesToFit.length === 0 || !mapRef.current) return;

    const coordinates = pharmaciesToFit.map(pharmacy => ({
      latitude: parseFloat(pharmacy.LokasyonX),
      longitude: parseFloat(pharmacy.LokasyonY),
    }));

    // Add user's location to the coordinates
    if (location.latitude !== 0 && location.longitude !== 0) {
      coordinates.push({
        latitude: location.latitude,
        longitude: location.longitude
      });
    }

    mapRef.current.fitToCoordinates(coordinates, {
      edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
      animated: true,
    });
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

  // Handle map region change
  const onRegionChange = (region: Region) => {
    // You can update visible area if needed
  };

  // Handle marker press
  const onMarkerPress = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
  };

  // Toggle duty pharmacies
  const toggleDutyPharmacies = () => {
    setShowDutyOnly(!showDutyOnly);

    // Reload pharmacies with duty filter if we have a valid location
    if (location.latitude !== 0 && location.longitude !== 0) {
      findPharmacies({
        latitude: location.latitude,
        longitude: location.longitude
      });
    }
  };

  // Get filtered pharmacies
  const getFilteredPharmacies = () => {
    return pharmacies;
  };

  if (location.isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text style={styles.loadingText}>Getting location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.header}>
        <Text style={styles.title}>Nearby Pharmacies</Text>
        <Text style={styles.subtitle}>Izmir, Turkey</Text>

        <View style={styles.dutyContainer}>
          <Text style={styles.dutyText}>Duty Pharmacies Only</Text>
          <Switch
            value={showDutyOnly}
            onValueChange={toggleDutyPharmacies}
            trackColor={{ false: "#d3d3d3", true: "#0a7ea4" }}
            thumbColor={showDutyOnly ? "#ffffff" : "#f4f3f4"}
          />
        </View>
      </View>

      {!location.isLoading && (
        <AddressBar
          address={userAddress || "Tap to set your address"}
          province={currentRegion || (userAddress ? "Unknown" : "")}
          coordinates={(location.latitude && location.longitude) ? {
            latitude: location.latitude,
            longitude: location.longitude,
          } : null}
          onAddressSelected={handleAddressConfirmedFromBar}
        />
      )}

      {!location.permissionGranted && !location.isLoading && (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            To see pharmacies based on your current location, please grant access.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestLocationPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Location Access</Text>
          </TouchableOpacity>
          {!userAddress && (
            <Text style={styles.permissionOr}>
              Alternatively, tap the address bar above to set your address manually.
            </Text>
          )}
        </View>
      )}

      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text style={styles.loadingText}>Searching for pharmacies...</Text>
        </View>
      ) : (
        <View style={styles.mapContainer}>
          {location.latitude !== 0 && location.longitude !== 0 && (
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              onRegionChange={onRegionChange}
              showsUserLocation={location.permissionGranted}
            >
              {getFilteredPharmacies().map((pharmacy, index) => (
                <Marker
                  key={`marker-${pharmacy.EczaneId || index}`}
                  coordinate={{
                    latitude: parseFloat(pharmacy.LokasyonX),
                    longitude: parseFloat(pharmacy.LokasyonY),
                  }}
                  title={pharmacy.Adi}
                  description={pharmacy.Adres}
                  pinColor={pharmacy.isOnDuty ? "#ff4500" : "#0a7ea4"}
                  onPress={() => onMarkerPress(pharmacy)}
                >
                  <Callout tooltip>
                    <View style={styles.calloutContainer}>
                      <Text style={styles.calloutTitle}>{pharmacy.Adi}</Text>
                      {pharmacy.isOnDuty && (
                        <Text style={styles.calloutDuty}>On Duty</Text>
                      )}
                      <Text style={styles.calloutDistance}>{formatDistance(pharmacy.distanceInMeters)}</Text>
                      <Text style={styles.calloutAddress}>{pharmacy.Adres}</Text>
                    </View>
                  </Callout>
                </Marker>
              ))}
            </MapView>
          )}
        </View>
      )}

      {selectedPharmacy && (
        <View style={styles.pharmacyDetailContainer}>
          <View style={styles.pharmacyDetailHeader}>
            <Text style={styles.pharmacyDetailName}>{selectedPharmacy.Adi}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedPharmacy(null)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          {selectedPharmacy.isOnDuty && (
            <View style={styles.dutyBadge}>
              <Text style={styles.dutyBadgeText}>On Duty</Text>
            </View>
          )}
          <Text style={styles.pharmacyDetailDistance}>
            {formatDistance(selectedPharmacy.distanceInMeters)}
          </Text>
          <Text style={styles.pharmacyDetailAddress}>{selectedPharmacy.Adres}</Text>
          <Text style={styles.pharmacyDetailRegion}>
            {selectedPharmacy.Bolge} {selectedPharmacy.BolgeAciklama ? `- ${selectedPharmacy.BolgeAciklama}` : ''}
          </Text>

          <View style={styles.pharmacyDetailActions}>
            <TouchableOpacity
              style={styles.detailActionButton}
              onPress={() => callPharmacy(selectedPharmacy.Telefon)}
            >
              <Text style={styles.detailActionButtonText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.detailActionButton}
              onPress={() => getDirections(selectedPharmacy)}
            >
              <Text style={styles.detailActionButtonText}>Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {pharmacies.length === 0 && !isSearching && !errorMessage && location.latitude !== 0 && location.longitude !== 0 && (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No pharmacies found nearby.</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => checkRegionAndLoadPharmacies({
              latitude: location.latitude,
              longitude: location.longitude
            })}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  dutyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    padding: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  dutyText: {
    fontSize: 14,
    color: '#333',
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    height: Dimensions.get('window').height * 0.7,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
  },
  permissionContainer: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  permissionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#0a7ea4',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  permissionOr: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginVertical: 15,
  },
  calloutContainer: {
    width: 200,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 6,
    borderColor: '#ccc',
    borderWidth: 0.5,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  calloutDuty: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ff4500',
    marginTop: 2,
  },
  calloutDistance: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  calloutAddress: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
  },
  pharmacyDetailContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  pharmacyDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pharmacyDetailName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a7ea4',
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  dutyBadge: {
    backgroundColor: '#ff4500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginVertical: 5,
  },
  dutyBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pharmacyDetailDistance: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  pharmacyDetailAddress: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
  },
  pharmacyDetailRegion: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  pharmacyDetailActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  detailActionButton: {
    flex: 1,
    backgroundColor: '#0a7ea4',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 8,
  },
  detailActionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  noResultsContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 8,
    margin: 16,
  },
  noResultsText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    transform: [{ translateY: -50 }],
    backgroundColor: 'rgba(255, 200, 200, 0.9)',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderColor: '#d88',
    borderWidth: 1,
  },
  errorText: {
    color: '#800',
    fontSize: 15,
    textAlign: 'center',
  },
});
