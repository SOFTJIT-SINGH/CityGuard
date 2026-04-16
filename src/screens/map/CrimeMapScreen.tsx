import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';

// Tactical Dark Grid Style
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0F172A" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#475569" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1E293B" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#020617" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] }
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
      const { data, error } = await supabase.from('reports').select('*');
      if (data) setHotspots(data);
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
          const jitterLat = location.coords.latitude + ((index % 5) * 0.003 * (index % 2 === 0 ? 1 : -1));
          const jitterLng = location.coords.longitude + ((index % 6) * 0.003 * (index % 3 === 0 ? 1 : -1));
          const isCritical = spot.severity === 'critical';

          return (
            <React.Fragment key={spot.id}>
              {/* CROSS-PLATFORM HEAT EFFECT (Layered Circles) */}
              <Circle 
                center={{ latitude: jitterLat, longitude: jitterLng }} 
                radius={800} 
                fillColor={isCritical ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)'} 
                strokeColor="transparent"
              />
              <Circle 
                center={{ latitude: jitterLat, longitude: jitterLng }} 
                radius={500} 
                fillColor={isCritical ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)'} 
                strokeColor="transparent"
              />
              <Circle 
                center={{ latitude: jitterLat, longitude: jitterLng }} 
                radius={200} 
                fillColor={isCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'} 
                strokeColor="transparent"
              />

              <Marker 
                coordinate={{ latitude: jitterLat, longitude: jitterLng }} 
                title={spot.title}
                description={spot.description}
              >
                 <View className={`h-4 w-4 rounded-full border-2 border-white ${isCritical ? 'bg-red-500' : 'bg-amber-500'}`} style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 2 }} />
              </Marker>
            </React.Fragment>
          );
        })}
      </MapView>

      <View className="absolute top-12 left-4 right-4 bg-gray-900/90 p-4 rounded-2xl shadow-lg border border-gray-800 backdrop-blur-md flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-black text-white tracking-tight text-emerald-500">CITYGUARD LIVE</Text>
          <Text className="text-[10px] uppercase font-bold text-gray-400 mt-1 tracking-widest">Tactical Threat Heatmap</Text>
        </View>
        <View className="h-4 w-4 rounded-full bg-red-600 animate-pulse border-2 border-red-900 shadow-lg shadow-red-500" />
      </View>

      <View className="absolute bottom-24 left-4 bg-gray-900/80 px-3 py-2 rounded-xl border border-gray-800">
         <View className="flex-row items-center mb-1">
            <View className="h-2 w-2 rounded-full bg-red-500 mr-2" />
            <Text className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">High Intensity</Text>
         </View>
         <View className="flex-row items-center">
            <View className="h-2 w-2 rounded-full bg-amber-500 mr-2" />
            <Text className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Warning Zone</Text>
         </View>
      </View>
    </View>
  );
}
