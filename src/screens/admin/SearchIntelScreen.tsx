import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

export default function SearchIntelScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const performSearch = async (query: string) => {
    setSearch(query);
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    try {
      // Search the dispatch_logs for matching title or location
      const { data, error } = await supabase
        .from('dispatch_logs')
        .select('*')
        .or(`title.ilike.%${query}%,location.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-950" style={{ paddingTop: Math.max(insets.top, 20) + 12 }}>
      
      <View className="px-6 mb-2 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.openDrawer()} className="mr-4 bg-gray-900 p-2 rounded-full border border-gray-800">
          <Ionicons name="menu" size={24} color="#D1D5DB" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-white tracking-tight">Search Incidents</Text>
      </View>

      <Text className="px-6 text-gray-400 text-sm leading-relaxed mb-6">
        Look up historical logs, public records, and recent safety updates in the city database.
      </Text>

      <View className="px-6 mb-6">
        <View className="bg-gray-900 border border-gray-800 rounded-full px-4 py-3 flex-row items-center focus:border-emerald-500">
          <Ionicons name="search" size={20} color="#6B7280" className="mr-3" />
          <TextInput 
            className="flex-1 text-white font-mono ml-2" 
            placeholder="Search keyword (e.g., 'Fire', 'Robbery', 'Park')..." 
            placeholderTextColor="#6B7280"
            value={search}
            onChangeText={performSearch}
          />
        </View>
        
        <View className="flex-row gap-2 mt-4">
          {['Theft', 'Assault', 'Suspicious', 'Traffic'].map(tag => (
            <TouchableOpacity key={tag} onPress={() => performSearch(tag)} className="bg-gray-900 px-3 py-1.5 rounded border border-gray-800 flex-row items-center gap-1">
               <Text className="text-gray-400 text-xs font-mono">{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
        {loading ? (
           <View className="mt-10 items-center justify-center">
             <ActivityIndicator color="#10B981" />
           </View>
        ) : search.trim().length > 0 && results.length === 0 ? (
           <View className="items-center justify-center mt-20 opacity-50">
             <Ionicons name="document-outline" size={64} color="#4B5563" />
             <Text className="text-gray-500 font-mono mt-4 text-center">No reports found matching your search.</Text>
           </View>
        ) : search.trim().length === 0 ? (
          <View className="items-center justify-center mt-20 opacity-50">
            <Ionicons name="search-circle-outline" size={64} color="#4B5563" />
            <Text className="text-gray-500 font-mono mt-4 text-center">Enter a search keyword to browse public records.</Text>
          </View>
        ) : (
          results.map((log) => (
             <View key={log.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4 shadow-lg">
                <Text className="text-white font-black text-lg tracking-wide">{log.title}</Text>
                <View className="flex-row items-center mt-2">
                  <Ionicons name="location" size={12} color="#9CA3AF" />
                  <Text className="text-gray-400 text-xs ml-1">{log.location}</Text>
                </View>
                <Text className="text-gray-500 text-[10px] font-mono mt-3 uppercase">Status: {log.status}</Text>
             </View>
          ))
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}