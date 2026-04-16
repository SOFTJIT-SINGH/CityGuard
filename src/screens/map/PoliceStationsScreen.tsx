import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PoliceStationsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState<any[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    getNearbyStations();
  }, []);

  const getNearbyStations = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is needed to find nearby stations.');
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      const lat = currentLocation.coords.latitude;
      const lon = currentLocation.coords.longitude;
      
      // Broadened query: nodes, ways and relations within 20km
      const query = `[out:json];(node["amenity"="police"](around:20000,${lat},${lon});way["amenity"="police"](around:20000,${lat},${lon});relation["amenity"="police"](around:20000,${lat},${lon}););out center;`;
      
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Satellite Grid Offline (Status: ${response.status})`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Safety Grid signal distorted by high traffic. Please try again in 5s.");
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error("Safety grid is currently overloaded. Please try again later.");
      }

      if (data.elements && data.elements.length > 0) {
        const formattedStations = data.elements.map((el: any) => ({
          id: el.id.toString(),
          name: el.tags.name || 'Police Station',
          address: el.tags['addr:street'] || el.tags['addr:full'] || 'Address unavailable',
          lat: el.lat || el.center?.lat,
          lon: el.lon || el.center?.lon,
          distance: calculateDistance(lat, lon, el.lat || el.center?.lat, el.lon || el.center?.lon),
        })).sort((a: any, b: any) => a.distance - b.distance);

        setStations(formattedStations);
      } else {
        console.log('No elements found in Overpass response');
        setStations([]);
      }
    } catch (error: any) {
      console.error('Error fetching stations:', error);
      Alert.alert('System Error', error.message || 'Unable to fetch nearby police stations.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const openInMaps = (lat: number, lon: number, name: string) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lon}`;
    const label = name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    if (url) Linking.openURL(url);
  };

  const renderStation = ({ item }: { item: any }) => (
    <TouchableOpacity 
      onPress={() => openInMaps(item.lat, item.lon, item.name)}
      className="bg-gray-900 border border-gray-800 p-5 rounded-3xl mb-4 flex-row items-center justify-between"
    >
      <View className="flex-1 mr-4">
        <View className="flex-row items-center mb-1">
          <Ionicons name="shield" size={16} color="#10B981" />
          <Text className="text-white font-black ml-2 tracking-tight text-base">{item.name}</Text>
        </View>
        <Text className="text-gray-500 font-bold text-xs mb-2">{item.address}</Text>
        <View className="bg-emerald-500/10 self-start px-2 py-1 rounded-lg border border-emerald-500/20">
          <Text className="text-emerald-500 font-mono text-[10px] uppercase font-bold">{item.distance.toFixed(2)} KM AWAY</Text>
        </View>
      </View>
      <View className="bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-900/40">
        <Ionicons name="navigate" size={20} color="white" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#030712', paddingTop: insets.top }}>
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-900">
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-gray-900 p-2 rounded-xl border border-gray-800">
          <Ionicons name="arrow-back" size={20} color="#10B981" />
        </TouchableOpacity>
        <Text className="text-lg font-black text-white tracking-widest uppercase">Safe Zone: Stations</Text>
        <TouchableOpacity onPress={getNearbyStations} className="bg-gray-900 p-2 rounded-xl border border-gray-800">
          <Ionicons name="refresh" size={20} color="#10B981" />
        </TouchableOpacity>
      </View>

      <View className="p-6">
        <Text className="text-white text-3xl font-black tracking-tighter mb-2">Nearby Help</Text>
        <Text className="text-gray-500 font-bold text-sm mb-6">Emergency response units within 20km of your position.</Text>

        {loading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#10B981" />
            <Text className="text-emerald-500 font-mono mt-4 uppercase text-[10px] tracking-widest font-bold">Scanning Grid...</Text>
          </View>
        ) : (
          <FlatList
            data={stations}
            renderItem={renderStation}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={() => (
              <View className="items-center py-20 bg-gray-900/30 rounded-3xl border border-dashed border-gray-800">
                 <Ionicons name="alert-circle-outline" size={48} color="#374151" />
                 <Text className="text-gray-500 text-center font-bold mt-4 italic">No stations found in immediate vicinity.</Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}
