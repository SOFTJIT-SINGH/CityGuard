import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const mockCameras = [
  { id: 1, name: "Mall Road Intersection", status: "Active", image: "https://images.unsplash.com/photo-1515099395272-92a061eb0d57?auto=format&fit=crop&w=600&q=80" },
  { id: 2, name: "Bus Stand Gate 2", status: "Active", image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=600&q=80" },
  { id: 3, name: "Golden Temple Appr.", status: "Active", image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80" },
  { id: 4, name: "Railway Station Ext.", status: "Active", image: "https://images.unsplash.com/photo-1555021200-34446c70817c?auto=format&fit=crop&w=600&q=80" },
];

export default function CCTVScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [isBlinking, setIsBlinking] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setIsBlinking((prev) => !prev), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView className="flex-1 bg-[#F4F7F6]" style={{ paddingTop: Math.max(insets.top, 20) + 12 }}>
      
      {/* Header with Sidebar Menu Button */}
      <View className="px-6 mb-6 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.openDrawer()} 
            className="mr-4 bg-white p-2 rounded-full shadow-sm border border-gray-100"
          >
            <Ionicons name="menu" size={24} color="#111827" />
          </TouchableOpacity>

          <View className="bg-red-50 p-2 rounded-xl mr-3 border border-red-100">
            <Ionicons name="videocam" size={24} color="#EF4444" />
          </View>
          <Text className="text-2xl font-black text-gray-900 tracking-tight">Live Matrix</Text>
        </View>
        
        {/* Active Badge styled to match the light theme */}
        <View className="bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200">
          <Text className="text-emerald-700 text-xs font-bold uppercase tracking-widest">4 Online</Text>
        </View>
      </View>

      {/* CCTV Grid */}
      <View className="px-4 flex-row flex-wrap justify-between pb-12">
        {mockCameras.map((cam) => (
          <View key={cam.id} className="w-[48%] mb-4 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative">
            
            {/* Camera Feed Image */}
            <Image 
              source={{ uri: cam.image }} 
              className="w-full h-32 object-cover"
            />

            {/* LIVE Overlay (Kept dark so it pops over the video) */}
            <View className="absolute top-2 left-2 flex-row items-center bg-black/70 px-2 py-1 rounded-md">
              <View className={`h-2 w-2 rounded-full bg-red-500 mr-1.5 ${isBlinking ? 'opacity-100' : 'opacity-30'}`} />
              <Text className="text-white text-[10px] font-bold tracking-widest uppercase">REC</Text>
            </View>

            {/* Camera Info Footer - Now Crisp White */}
            <View className="p-3 bg-white">
              <Text className="text-gray-900 text-xs font-bold" numberOfLines={1}>{cam.name}</Text>
              <View className="flex-row items-center mt-1">
                <View className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1" />
                <Text className="text-gray-500 text-[10px] uppercase font-semibold">Stable</Text>
              </View>
            </View>
            
          </View>
        ))}
      </View>

    </ScrollView>
  );
}