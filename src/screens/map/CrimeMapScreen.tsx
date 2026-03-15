import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

export default function CrimeMapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Mock data for hotspots (We will fetch this from Supabase tomorrow)
  const mockHotspots = [
    { id: 1, latitude: 31.6340, longitude: 74.8723, title: "Theft Reported", type: "danger" }, // Near Golden Temple area
    { id: 2, latitude: 31.6310, longitude: 74.8750, title: "Suspicious Activity", type: "warning" },
  ];

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  if (!location) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#EF4444" />
        <Text className="mt-4 text-gray-500 font-medium">Locating you...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <MapView
        className="w-full h-full"
        // provider={PROVIDER_GOOGLE} // Uncomment this if testing on Android to force Google Maps
        showsUserLocation={true}
        showsMyLocationButton={true}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05, // Zoom level
          longitudeDelta: 0.05,
        }}
      >
        {/* Render Hotspot Markers */}
        {mockHotspots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
            title={spot.title}
            pinColor={spot.type === 'danger' ? 'red' : 'orange'}
          />
        ))}

        {/* Draw a danger zone circle */}
        {mockHotspots.map((spot) => (
          <Circle
            key={`circle-${spot.id}`}
            center={{ latitude: spot.latitude, longitude: spot.longitude }}
            radius={500} // 500 meters
            fillColor={spot.type === 'danger' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}
            strokeColor={spot.type === 'danger' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(245, 158, 11, 0.5)'}
          />
        ))}
      </MapView>

      {/* Floating Header */}
      <View className="absolute top-12 left-4 right-4 bg-white/90 p-4 rounded-2xl shadow-lg border border-gray-100">
        <Text className="text-xl font-black text-gray-900 text-center">Live Safety Map</Text>
        <Text className="text-xs text-center text-gray-500 mt-1">Showing real-time incident reports</Text>
      </View>
    </View>
  );
}