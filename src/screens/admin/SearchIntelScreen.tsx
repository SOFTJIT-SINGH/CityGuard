import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SearchIntelScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  return (
    <View className="flex-1 bg-gray-950" style={{ paddingTop: Math.max(insets.top, 20) + 12 }}>
      
      <View className="px-6 mb-6 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.openDrawer()} className="mr-4 bg-gray-900 p-2 rounded-full border border-gray-800">
          <Ionicons name="menu" size={24} color="#D1D5DB" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-white tracking-tight">Intel Database</Text>
      </View>

      <View className="px-6 mb-6">
        <View className="bg-gray-900 border border-gray-800 rounded-full px-4 py-3 flex-row items-center focus:border-emerald-500">
          <Ionicons name="search" size={20} color="#6B7280" className="mr-3" />
          <TextInput 
            className="flex-1 text-white font-mono ml-2" 
            placeholder="Search incident ID, keyword, or zone..." 
            placeholderTextColor="#6B7280"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        
        <View className="flex-row gap-2 mt-4">
          {['Theft', 'Assault', 'Suspicious', 'Traffic'].map(tag => (
            <TouchableOpacity key={tag} className="bg-gray-900 px-3 py-1.5 rounded border border-gray-800">
              <Text className="text-gray-400 text-xs font-mono">{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView className="px-6">
        <View className="items-center justify-center mt-20 opacity-50">
          <Ionicons name="server-outline" size={64} color="#4B5563" />
          <Text className="text-gray-500 font-mono mt-4 text-center">Awaiting Supabase Query...\nEnter search parameter to scan database.</Text>
        </View>
      </ScrollView>
    </View>
  );
}