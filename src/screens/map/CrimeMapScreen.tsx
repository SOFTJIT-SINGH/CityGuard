import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';

// This turns Google Maps / Apple Maps into a "Dark Mode" hacker grid!
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
];

export default function CrimeMapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const mockHotspots = [
    { id: 1, latitude: 31.6340, longitude: 74.8723, title: "Theft", type: "danger" },
    { id: 2, latitude: 31.6310, longitude: 74.8750, title: "Suspicious", type: "warning" },
  ];

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  if (!location) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-950">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="mt-4 text-emerald-500 font-mono tracking-widest text-xs uppercase">Acquiring GPS Signal...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-950">
      <MapView
        className="w-full h-full"
        showsUserLocation={true}
        showsMyLocationButton={true}
        customMapStyle={darkMapStyle}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {mockHotspots.map((spot) => (
          <Marker key={spot.id} coordinate={{ latitude: spot.latitude, longitude: spot.longitude }} title={spot.title} pinColor={spot.type === 'danger' ? 'red' : 'yellow'} />
        ))}
        {mockHotspots.map((spot) => (
          <Circle key={`circle-${spot.id}`} center={{ latitude: spot.latitude, longitude: spot.longitude }} radius={500} fillColor={spot.type === 'danger' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'} strokeColor={spot.type === 'danger' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(245, 158, 11, 0.5)'} />
        ))}
      </MapView>

      <View className="absolute top-12 left-4 right-4 bg-gray-900/90 p-4 rounded-2xl shadow-lg border border-gray-800 backdrop-blur-md flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-black text-white tracking-tight">Live Radar</Text>
          <Text className="text-[10px] uppercase font-bold text-gray-400 mt-1 tracking-widest">Active Scanning</Text>
        </View>
        <View className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse border-2 border-emerald-900" />
      </View>
    </View>
  );
}