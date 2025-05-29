import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Switch, Platform } from 'react-native';
import { useAppSelector, useAppDispatch } from '@/store';
import { resetAddressData, loadAddressData } from '@/store/slices/localStorageSlice';
import * as SecureStore from 'expo-secure-store';
import { LocationService } from '@/services/LocationService';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/theme/ThemeProvider';
import { createThemedStyles } from '@/theme/themeUtils';

export default function ExploreScreen() {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  const dispatch = useAppDispatch();

  // Get data from Redux store
  const { userAddress, userCoordinates, loading } = useAppSelector(state => state.localStorage);
  const { pharmacies, initialized } = useAppSelector(state => state.pharmacy);

  const [allKeys, setAllKeys] = useState<string[]>([]);
  const [expandSections, setExpandSections] = useState({
    reduxState: true,
    localStorage: true,
    actions: true
  });
  const [showCoordinateJson, setShowCoordinateJson] = useState(false);

  // Load all SecureStore keys on component mount
  useEffect(() => {
    loadSecureStoreKeys();
  }, []);

  const loadSecureStoreKeys = async () => {
    try {
      const keys = ['user_address', 'user_coords']; // Known keys from LocationService
      setAllKeys(keys);
    } catch (error) {
      console.error('Error loading SecureStore keys:', error);
    }
  };

  const refreshData = () => {
    dispatch(loadAddressData());
    loadSecureStoreKeys();
    Alert.alert('Refreshed', 'Data has been refreshed from storage');
  };

  const clearAddressData = async () => {
    Alert.alert(
      'Clear Address Data',
      'Are you sure you want to clear all saved address data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync('user_address');
              await SecureStore.deleteItemAsync('user_coords');
              dispatch(resetAddressData());
              loadSecureStoreKeys();
              Alert.alert('Success', 'Address data has been cleared');
            } catch (error) {
              console.error('Error clearing address data:', error);
              Alert.alert('Error', 'Failed to clear address data');
            }
          }
        }
      ]
    );
  };

  const toggleSection = (section: keyof typeof expandSections) => {
    setExpandSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Debug & Developer Menu</Text>

      {/* Redux State Section */}
      <View style={styles.sectionContainer}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('reduxState')}
        >
          <Text style={styles.sectionTitle}>Redux State</Text>
          <MaterialIcons
            name={expandSections.reduxState ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>

        {expandSections.reduxState && (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionSubtitle}>Address Data:</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>User Address:</Text>
              <Text style={styles.infoValue}>{userAddress || 'Not set'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Has Coordinates:</Text>
              <Text style={styles.infoValue}>{userCoordinates ? 'Yes' : 'No'}</Text>
            </View>

            {userCoordinates && (
              <View>
                <View style={styles.coordinatesHeader}>
                  <Text style={styles.infoLabel}>Coordinates:</Text>
                  <Switch
                    value={showCoordinateJson}
                    onValueChange={setShowCoordinateJson}
                    trackColor={{ false: "#d3d3d3", true: "#0a7ea4" }}
                    thumbColor={showCoordinateJson ? "#ffffff" : "#f4f3f4"}
                  />
                </View>

                {showCoordinateJson ? (
                  <Text style={styles.jsonText}>
                    {JSON.stringify(userCoordinates, null, 2)}
                  </Text>
                ) : (
                  <>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Latitude:</Text>
                      <Text style={styles.infoValue}>
                        {userCoordinates.latitude.toFixed(6)}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Longitude:</Text>
                      <Text style={styles.infoValue}>
                        {userCoordinates.longitude.toFixed(6)}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            )}

            <Text style={styles.sectionSubtitle}>Pharmacy Data:</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Initialized:</Text>
              <Text style={styles.infoValue}>{initialized ? 'Yes' : 'No'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pharmacy Count:</Text>
              <Text style={styles.infoValue}>{pharmacies ? pharmacies.length : 0}</Text>
            </View>
          </View>
        )}
      </View>

      {/* LocalStorage Section */}
      <View style={styles.sectionContainer}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('localStorage')}
        >
          <Text style={styles.sectionTitle}>Local Storage</Text>
          <MaterialIcons
            name={expandSections.localStorage ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>

        {expandSections.localStorage && (
          <View style={styles.sectionContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Available Keys:</Text>
              <Text style={styles.infoValue}>{allKeys.length}</Text>
            </View>

            {allKeys.map((key) => (
              <View key={key} style={styles.storageKeyContainer}>
                <Text style={styles.storageKeyName}>{key}</Text>
                <TouchableOpacity
                  style={styles.storageViewButton}
                  onPress={async () => {
                    try {
                      const value = await SecureStore.getItemAsync(key);
                      Alert.alert(
                        `Key: ${key}`,
                        `Value: ${value || 'null'}`
                      );
                    } catch (error) {
                      console.error(`Error reading key ${key}:`, error);
                    }
                  }}
                >
                  <Text style={styles.storageViewButtonText}>View Value</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Actions Section */}
      <View style={styles.sectionContainer}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('actions')}
        >
          <Text style={styles.sectionTitle}>Actions</Text>
          <MaterialIcons
            name={expandSections.actions ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>

        {expandSections.actions && (
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={refreshData}
            >
              <MaterialIcons name="refresh" size={20} color={theme.colors.text.inverse} />
              <Text style={styles.actionButtonText}>Refresh Data</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton]}
              onPress={clearAddressData}
            >
              <MaterialIcons name="delete" size={20} color={theme.colors.text.inverse} />
              <Text style={styles.actionButtonText}>Clear Address Data</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.versionText}>App Version: 1.0.0</Text>
    </ScrollView>
  );
}

const getStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: 60,
    marginBottom: 24,
    textAlign: 'center'
  },
  sectionContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.cardHeader,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  sectionContent: {
    padding: theme.spacing.md,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  infoLabel: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    color: theme.colors.text.primary,
    fontWeight: '500',
    flex: 1,
  },
  coordinatesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  jsonText: {
    backgroundColor: theme.colors.codeBackground || '#f0f0f0',
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    color: theme.colors.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    marginVertical: theme.spacing.sm,
  },
  storageKeyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  storageKeyName: {
    fontSize: 15,
    color: theme.colors.text.primary,
  },
  storageViewButton: {
    backgroundColor: theme.colors.secondary || '#4a90e2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.sm,
  },
  storageViewButtonText: {
    color: theme.colors.text.inverse || '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: theme.colors.primary || '#0a7ea4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
  },
  dangerButton: {
    backgroundColor: theme.colors.error || '#e53935',
  },
  actionButtonText: {
    color: theme.colors.text.inverse || '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  versionText: {
    textAlign: 'center',
    color: theme.colors.text.tertiary || '#999',
    marginVertical: theme.spacing.lg,
  },
}));
