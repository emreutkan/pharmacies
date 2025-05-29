import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  ActivityIndicator,
  Animated,
  TextInput,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { LocationService } from '../services/LocationService';
import { useAppTheme } from '@/theme/ThemeProvider';
import { createThemedStyles } from '@/theme/themeUtils';
import { searchLocations } from '@/data/turkishLocations';

interface AddressBarProps {
  address: string;
  province?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
  onChangeAddressPress: () => void;
  onAddressSelected: (address: string, coordinates: { latitude: number; longitude: number }) => void;
}

export const AddressBar: React.FC<AddressBarProps> = ({
  address,
  province = 'Izmir',
  coordinates,
  onChangeAddressPress,
  onAddressSelected
}) => {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  const [modalVisible, setModalVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: coordinates?.latitude || 38.4192,
    longitude: coordinates?.longitude || 27.1287,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [selectedCoordinates, setSelectedCoordinates] = useState(coordinates || null);
  const [selectedAddress, setSelectedAddress] = useState(address);
  const [isLoading, setIsLoading] = useState(false);
  const [locationDetails, setLocationDetails] = useState<{
    street?: string;
    district?: string;
    city?: string;
    country?: string;
  }>({});
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const mapRef = useRef<MapView>(null);
  const searchInputRef = useRef<TextInput>(null);
  const buttonAnimation = useRef(new Animated.Value(100)).current;
  const markerFloatAnimation = useRef(new Animated.Value(0)).current;
  const markerScaleAnimation = useRef(new Animated.Value(1)).current;
  const locationDetailsAnimation = useRef(new Animated.Value(70)).current;

  useEffect(() => {
    if (modalVisible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(markerFloatAnimation, {
            toValue: -15,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(markerFloatAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.sequence([
        Animated.timing(markerScaleAnimation, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(markerScaleAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      markerFloatAnimation.setValue(0);
      markerScaleAnimation.setValue(1);
    }
  }, [modalVisible, markerFloatAnimation, markerScaleAnimation]);

  useEffect(() => {
    if (coordinates) {
      setMapRegion(prev => ({
        ...prev,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      }));
      setSelectedCoordinates(coordinates);
    }
  }, [coordinates]);

  useEffect(() => {
    if (modalVisible) {
      Animated.timing(buttonAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
    } else {
      buttonAnimation.setValue(100);
    }
  }, [modalVisible, buttonAnimation]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = searchLocations(searchQuery);
      setSearchResults(results);
      setShowResults(results.length > 0);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  const handleAddressPress = () => {
    setModalVisible(true);
  };

  const handleMapDragStart = () => {
    setIsDragging(true);

    Animated.timing(locationDetailsAnimation, {
      toValue: 70,
      duration: 200,
      useNativeDriver: true
    }).start();

    Animated.sequence([
      Animated.timing(markerScaleAnimation, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(markerScaleAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleConfirmLocation = async () => {
    if (selectedCoordinates) {
      setIsLoading(true);
      try {
        const result = await Location.reverseGeocodeAsync({
          latitude: selectedCoordinates.latitude,
          longitude: selectedCoordinates.longitude
        });

        if (result && result.length > 0) {
          const location = result[0];
          const formattedAddress = [
            location.street,
            location.district,
            location.city
          ].filter(Boolean).join(', ');

          setSelectedAddress(formattedAddress);

          await LocationService.saveUserAddress(formattedAddress);

          onAddressSelected(formattedAddress, selectedCoordinates);
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error);
      } finally {
        setIsLoading(false);
        setModalVisible(false);
      }
    }
  };

  const handleMapRegionChange = (region: any) => {
    if (!isDragging) {
      handleMapDragStart();
    }
  };

  const handleMapRegionChangeComplete = async (region: any) => {
    setMapRegion(region);
    setIsDragging(false);

    const newCoordinates = {
      latitude: region.latitude,
      longitude: region.longitude
    };

    setSelectedCoordinates(newCoordinates);

    setIsLoading(true);
    try {
      const result = await Location.reverseGeocodeAsync(newCoordinates);

      if (result && result.length > 0) {
        const location = result[0];
        setLocationDetails({
          street: location.street,
          district: location.district,
          city: location.city,
          country: location.country
        });

        Animated.timing(locationDetailsAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }).start();

        Animated.sequence([
          Animated.timing(markerScaleAnimation, {
            toValue: 1.4,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(markerScaleAnimation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMyLocationPress = async () => {
    setIsLoading(true);
    try {
      const hasPermission = await LocationService.checkLocationPermission();

      if (!hasPermission) {
        const granted = await LocationService.requestLocationPermission();
        if (!granted) {
          console.log('Location permission denied');
          setIsLoading(false);
          return;
        }
      }

      const userLocation = await LocationService.getCurrentLocation();

      if (userLocation && mapRef.current) {
        setSelectedCoordinates(userLocation);
        handleMapDragStart();

        mapRef.current.animateToRegion({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005
        }, 500);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSearchItemPress = (item: any) => {
    setMapRegion({
      latitude: item.coordinates.latitude,
      longitude: item.coordinates.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });

    setSelectedCoordinates(item.coordinates);

    const locationName = item.district
      ? `${item.district}, ${item.city}`
      : item.city;

    setLocationDetails({
      district: item.district,
      city: item.city,
      country: 'Türkiye'
    });

    Animated.timing(locationDetailsAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start();

    Animated.sequence([
      Animated.timing(markerScaleAnimation, {
        toValue: 1.4,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(markerScaleAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setSearchQuery('');
    setShowResults(false);
    Keyboard.dismiss();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    if (searchResults.length === 0) {
      setShowResults(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={handleAddressPress}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <MaterialIcons name="location-on" size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.addressText} numberOfLines={1}>
            {address}
          </Text>
          <Text style={styles.provinceText}>{province}</Text>
        </View>
        <MaterialIcons name="keyboard-arrow-right" size={24} color={theme.colors.text.tertiary} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.fullScreenContainer}>
            <MapView
              ref={mapRef}
              style={styles.fullScreenMap}
              region={mapRegion}
              onRegionChange={handleMapRegionChange}
              onRegionChangeComplete={handleMapRegionChangeComplete}
              showsUserLocation={true}
              showsMyLocationButton={false}
              rotateEnabled={true}
              pitchEnabled={true}
              moveOnMarkerPress={false}
              loadingEnabled={true}
            />

            <View style={styles.headerContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleCloseModal}
              >
                <MaterialIcons name="arrow-back" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>

              <View style={styles.searchContainer}>
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Search city or district..."
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={() => setShowResults(true)}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => {
                      setSearchQuery('');
                      setShowResults(false);
                    }}
                  >
                    <MaterialIcons name="close" size={20} color={theme.colors.text.tertiary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {showResults && (
              <View style={styles.searchResultsContainer}>
                <FlatList
                  data={searchResults}
                  keyboardShouldPersistTaps="handled"
                  keyExtractor={(item, index) => `location-${index}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.searchResultItem}
                      onPress={() => handleSearchItemPress(item)}
                    >
                      <MaterialIcons name="location-on" size={20} color={theme.colors.primary} />
                      <View style={styles.searchResultTextContainer}>
                        <Text style={styles.searchResultText}>
                          {item.district ? `${item.district}, ${item.city}` : item.city}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    searchQuery.length >= 2 ? (
                      <Text style={styles.noResultsText}>No locations found</Text>
                    ) : null
                  }
                />
              </View>
            )}

            <Animated.View
              style={[
                styles.markerFixed,
                {
                  transform: [
                    { translateY: markerFloatAnimation },
                    { scale: markerScaleAnimation }
                  ]
                }
              ]}
            >
              <View style={styles.markerShadow} />
              <MaterialIcons name="location-pin" size={50} color={theme.colors.primary} />
            </Animated.View>

            <Animated.View
              style={[
                styles.locationDetailsCard,
                { transform: [{ translateY: locationDetailsAnimation }] }
              ]}
            >
              {locationDetails.street && (
                <Text style={styles.locationStreet}>{locationDetails.street}</Text>
              )}
              <Text style={styles.locationRegion}>
                {[locationDetails.district, locationDetails.city, locationDetails.country]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
            </Animated.View>

            <TouchableOpacity
              style={styles.myLocationButton}
              onPress={handleMyLocationPress}
              disabled={isLoading}
            >
              <MaterialIcons name="my-location" size={24} color={theme.colors.primary} />
            </TouchableOpacity>

            <Animated.View
              style={[
                styles.bottomSheet,
                { transform: [{ translateY: buttonAnimation }] }
              ]}
            >
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmLocation}
                disabled={isLoading || !selectedCoordinates}
              >
                <Text style={styles.confirmButtonText}>
                  {isLoading ? 'Confirming...' : 'Confirm This Location'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const getStyles = createThemedStyles((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.radius.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: theme.spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  addressText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  provinceText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  fullScreenContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: theme.colors.background,
  },
  fullScreenMap: {
    ...StyleSheet.absoluteFillObject,
  },
  headerContainer: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.circle,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginRight: theme.spacing.sm,
  },
  searchContainer: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  searchResultsContainer: {
    position: 'absolute',
    top: 95,
    left: theme.spacing.md,
    right: theme.spacing.md,
    maxHeight: 200,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 20,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  searchResultTextContainer: {
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  searchResultText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  noResultsText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    padding: theme.spacing.md,
    textAlign: 'center',
  },
  markerFixed: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -50,
    zIndex: 2,
    alignItems: 'center',
  },
  markerShadow: {
    position: 'absolute',
    bottom: -5,
    backgroundColor: theme.colors.shadow,
    width: 20,
    height: 6,
    borderRadius: theme.radius.pill,
    zIndex: 1,
  },
  locationDetailsCard: {
    position: 'absolute',
    top: '50%',
    left: '10%',
    right: '10%',
    marginTop: 15,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    alignItems: 'center',
    zIndex: 3,
  },
  locationStreet: {
    ...theme.typography.subtitle,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  locationRegion: {
    ...theme.typography.bodySmall,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  myLocationButton: {
    position: 'absolute',
    right: theme.spacing.md,
    bottom: 100,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.circle,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 5,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    paddingBottom: 36,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 5,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  confirmButtonText: {
    ...theme.typography.button,
    color: theme.colors.text.inverse,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.overlay,
    zIndex: 10,
  },
}));
