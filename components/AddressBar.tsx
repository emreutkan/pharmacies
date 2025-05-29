import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform, ActivityIndicator, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { LocationService } from '../services/LocationService';

interface AddressBarProps {
  address: string;
  province?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
  onChangeAddressPress: () => void;
  onAddressSelected: (address: string, coordinates: {latitude: number, longitude: number}) => void;
}

export const AddressBar: React.FC<AddressBarProps> = ({
  address,
  province = 'Izmir',
  coordinates,
  onChangeAddressPress,
  onAddressSelected
}) => {
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
  const mapRef = useRef<MapView>(null);
  const buttonAnimation = useRef(new Animated.Value(100)).current;
  const markerFloatAnimation = useRef(new Animated.Value(0)).current;
  const markerScaleAnimation = useRef(new Animated.Value(1)).current;
  const locationDetailsAnimation = useRef(new Animated.Value(70)).current;

  // Start floating animation for marker
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

      // Initial scale animation when opened
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
      // Reset animations when modal is closed
      markerFloatAnimation.setValue(0);
      markerScaleAnimation.setValue(1);
    }
  }, [modalVisible, markerFloatAnimation, markerScaleAnimation]);

  // Update map region when coordinates change
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

  // Animate the confirm button to slide up when modal is visible
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

  const handleAddressPress = () => {
    setModalVisible(true);
  };

  // When dragging starts, show bounce animation and hide location details
  const handleMapDragStart = () => {
    setIsDragging(true);

    // Hide location details with animation
    Animated.timing(locationDetailsAnimation, {
      toValue: 70,
      duration: 200,
      useNativeDriver: true
    }).start();

    // Bounce animation for marker
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
        // Reverse geocode to get address from coordinates
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

          // Save the new address and coordinates
          await LocationService.saveUserAddress(formattedAddress);

          // Call the callback to update parent component
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
    // Start dragging if not already dragging
    if (!isDragging) {
      handleMapDragStart();
    }
  };

  const handleMapRegionChangeComplete = async (region: any) => {
    // Update state only when user stops dragging for smooth experience
    setMapRegion(region);
    setIsDragging(false);

    const newCoordinates = {
      latitude: region.latitude,
      longitude: region.longitude
    };

    setSelectedCoordinates(newCoordinates);

    // Get location details when scrolling stops
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

        // Show location details with animation
        Animated.timing(locationDetailsAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }).start();

        // Add bounce effect to marker when location is found
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
        handleMapDragStart(); // Trigger the animation

        // Animate map to user location
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

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={handleAddressPress}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <MaterialIcons name="location-on" size={24} color="#0a7ea4" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.addressText} numberOfLines={1}>
            {address}
          </Text>
          <Text style={styles.provinceText}>{province}</Text>
        </View>
        <MaterialIcons name="keyboard-arrow-right" size={24} color="#999" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
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

          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleCloseModal}
          >
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          {/* Animated floating marker */}
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
            <MaterialIcons name="location-pin" size={50} color="#0a7ea4" />
          </Animated.View>

          {/* Location details card (street, district, city, country) */}
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

          {/* My Location Button */}
          <TouchableOpacity
            style={styles.myLocationButton}
            onPress={handleMyLocationPress}
            disabled={isLoading}
          >
            <MaterialIcons name="my-location" size={24} color="#0a7ea4" />
          </TouchableOpacity>

          {/* Animated Confirm Button */}
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
              <ActivityIndicator size="large" color="#0a7ea4" />
            </View>
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  provinceText: {
    fontSize: 14,
    color: '#666',
  },
  fullScreenContainer: {
    flex: 1,
    position: 'relative',
  },
  fullScreenMap: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    backgroundColor: 'white',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
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
    backgroundColor: 'rgba(0,0,0,0.2)',
    width: 20,
    height: 6,
    borderRadius: 10,
    zIndex: 1,
  },
  locationDetailsCard: {
    position: 'absolute',
    top: '50%',
    left: '10%',
    right: '10%',
    marginTop: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    alignItems: 'center',
    zIndex: 3,
  },
  locationStreet: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  locationRegion: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  myLocationButton: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    backgroundColor: 'white',
    borderRadius: 30,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
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
    backgroundColor: 'white',
    padding: 20,
    paddingBottom: 36,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 5,
  },
  confirmButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
    zIndex: 10,
  },
});
