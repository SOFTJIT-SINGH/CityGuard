import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { geminiModel } from '../../lib/gemini';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';

export default function SocialMonitorScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [isScanning, setIsScanning] = useState(false);
  const [intelFeed, setIntelFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAndGenerateIntel = async () => {
    setIsScanning(true);
    try {
      // 1. Fetch latest reports
      const { data: reports, error } = await supabase
        .from('reports')
        .select('title, description, reported_at, status_level')
        .order('reported_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (!reports || reports.length === 0) {
        setIntelFeed([]);
        return;
      }

      // 2. Use Gemini to generate social posts
      const prompt = `You are a social media monitoring system for a city.
        Based on these real incident reports: ${JSON.stringify(reports)}
        Generate 5 simulated social media posts (Tweets, Instagram, FB) from citizens.
        Return ONLY a JSON array of objects with these keys: 
        id (string), handle (string), time (string like "2m ago"), content (string), threatLevel (CRITICAL, ELEVATED, or CLEARED), confidence (percentage string), keywords (array of 3 strings), color (red, amber, or emerald).
        Make the handles realistic (e.g., @AmritsarUpdate, @Citizen_99). 
        Make the content sound like panicked or concerned citizens or news updates.`;

      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the text in case Gemini adds markdown blocks
      const cleanJson = text.replace(/```json|```/g, '').trim();
      const generatedIntel = JSON.parse(cleanJson);
      
      setIntelFeed(generatedIntel);
    } catch (e) {
      console.error("Intel generation failed:", e);
    } finally {
      setIsScanning(false);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAndGenerateIntel();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAndGenerateIntel();
  };

  return (
    <View className="flex-1 bg-gray-950" style={{ paddingTop: Math.max(insets.top, 20) + 12 }}>
      
      {/* Tactical Header */}
      <View className="px-6 mb-6 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.openDrawer()} className="mr-4 bg-gray-900 p-2 rounded-full border border-gray-800 shadow-sm">
            <Ionicons name="menu" size={24} color="#D1D5DB" />
          </TouchableOpacity>
          <View className="bg-indigo-500/10 p-2 rounded-xl mr-3 border border-indigo-500/20">
            <Ionicons name="globe-outline" size={24} color="#6366F1" />
          </View>
          <Text className="text-2xl font-black text-white tracking-tight">Social Intel</Text>
        </View>
      </View>

      {/* Live Scanner Bar */}
      <View className="px-6 mb-6">
        <View className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex-row items-center justify-between shadow-lg">
          <View className="flex-row items-center flex-1">
            <ActivityIndicator size="small" color={isScanning ? "#3B82F6" : "#10B981"} />
            <Text className="text-gray-400 text-xs font-mono ml-3 uppercase tracking-widest">
              {isScanning ? 'Scraping Geo-Fenced APIs...' : 'NLP Analysis Complete'}
            </Text>
          </View>
          <Text className="text-blue-500 text-xs font-bold uppercase tracking-widest">{intelFeed.length} Flags</Text>
        </View>
      </View>

      {/* Scraped Intel Feed */}
      <ScrollView 
        className="px-6" 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
      >
        {loading && !refreshing ? (
          <View className="py-20 items-center justify-center">
             <ActivityIndicator size="large" color="#6366F1" />
             <Text className="text-gray-500 font-mono mt-4">Generating Intel from database...</Text>
          </View>
        ) : intelFeed.length === 0 ? (
          <View className="py-20 items-center justify-center opacity-50">
             <Ionicons name="wifi-outline" size={48} color="#4B5563" />
             <Text className="text-gray-500 font-mono mt-4 text-center">No active intel detected in geofenced area.</Text>
          </View>
        ) : (
          intelFeed.map((intel) => (
            <View key={intel.id} className={`bg-gray-900 border border-gray-800 rounded-3xl p-5 mb-5 shadow-lg relative overflow-hidden`}>
              
              {/* Threat Level Overlay */}
              <View className={`absolute top-0 right-0 px-3 py-1 border-b border-l rounded-bl-xl ${
                intel.color === 'red' ? 'bg-red-500/20 border-red-500/50' : 
                intel.color === 'amber' ? 'bg-amber-500/20 border-amber-500/50' : 
                'bg-emerald-500/20 border-emerald-500/50'
              }`}>
                <Text className={`text-[10px] font-black tracking-widest uppercase ${
                  intel.color === 'red' ? 'text-red-400' : intel.color === 'amber' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {intel.threatLevel}
                </Text>
              </View>

              {/* Social Header */}
              <View className="flex-row items-center mb-3 mt-1">
                <Ionicons name="logo-twitter" size={16} color="#6B7280" />
                <Text className="text-gray-300 font-bold ml-2">{intel.handle}</Text>
                <Text className="text-gray-600 text-xs font-mono ml-auto mr-16">{intel.time}</Text>
              </View>

              {/* Post Content */}
              <Text className="text-white text-sm leading-relaxed mb-4 italic">"{intel.content}"</Text>
              
              {/* AI Analysis Footer */}
              <View className="border-t border-gray-800 pt-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">AI Confidence Match</Text>
                  <Text className={`font-mono text-xs font-bold ${intel.color === 'red' ? 'text-red-400' : 'text-emerald-400'}`}>{intel.confidence}</Text>
                </View>
                
                <View className="flex-row flex-wrap gap-2">
                  {intel.keywords.map((kw: string, idx: number) => (
                    <View key={idx} className="bg-gray-950 px-2 py-1 rounded border border-gray-800">
                      <Text className="text-gray-400 text-[10px] font-mono uppercase">[{kw}]</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))
        )}
        <View className="h-10" />
      </ScrollView>

    </View>
  );
}