import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';

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
  const [hotspots, setHotspots] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchMapData();
    }, [])
  );

  const fetchMapData = async () => {
    try {
      // Fetch dynamic reports from Supabase
      const { data, error } = await supabase.from('reports').select('*');
      if (data) {
         setHotspots(data);
      }
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocation({ coords: { latitude: 31.6340, longitude: 74.8723 } } as any);
          return;
        }
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } catch (e) {
        // Fallback for emulator hanging or location services disabled
        setLocation({ coords: { latitude: 31.6340, longitude: 74.8723 } } as any);
      }
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
        style={{ flex: 1, width: '100%', height: '100%' }}
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
        {hotspots.map((spot, index) => {
          // Generate a deterministic jitter around the user's location based on the report's UUID
          // This avoids needing raw lat/lon columns in Supabase for testing while making it dynamic
          const jitterLat = location.coords.latitude + ((index % 5) * 0.003 * (index % 2 === 0 ? 1 : -1));
          const jitterLng = location.coords.longitude + ((index % 6) * 0.003 * (index % 3 === 0 ? 1 : -1));

          return (
            <React.Fragment key={spot.id}>
              <Marker 
                coordinate={{ latitude: jitterLat, longitude: jitterLng }} 
                title={spot.title} 
                pinColor={spot.severity === 'critical' || spot.severity === 'danger' ? 'red' : 'yellow'} 
              />
              <Circle 
                center={{ latitude: jitterLat, longitude: jitterLng }} 
                radius={300} 
                fillColor={spot.severity === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'} 
                strokeColor={spot.severity === 'critical' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(245, 158, 11, 0.5)'} 
              />
            </React.Fragment>
          );
        })}
      </MapView>

      <View className="absolute top-12 left-4 right-4 bg-gray-900/90 p-4 rounded-2xl shadow-lg border border-gray-800 backdrop-blur-md flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-black text-white tracking-tight">Live Map</Text>
          <Text className="text-[10px] uppercase font-bold text-gray-400 mt-1 tracking-widest">Updating...</Text>
        </View>
        <View className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse border-2 border-emerald-900" />
      </View>
    </View>
  );
}