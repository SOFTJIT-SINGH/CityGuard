import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SocialMonitorScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [isScanning, setIsScanning] = useState(true);

  // Simulating the "live scraping" effect
  useEffect(() => {
    const timer = setInterval(() => {
      setIsScanning(prev => !prev);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const mockIntel = [
    {
      id: "TWT-8821A",
      handle: "@AmritsarLocal",
      time: "2 mins ago",
      content: "Just heard two massive loud bangs near the Mall Road intersection. Everyone is running. Anyone know what happened?? #Amritsar #Emergency",
      threatLevel: "CRITICAL",
      confidence: "94%",
      keywords: ["loud bangs", "running", "emergency"],
      color: "red"
    },
    {
      id: "IG-9924B",
      handle: "@TrafficUpdateASR",
      time: "12 mins ago",
      content: "Avoid the main gate of the Interstate Bus Stand. Huge fight broke out between two groups. Police not here yet.",
      threatLevel: "ELEVATED",
      confidence: "82%",
      keywords: ["fight broke out", "police not here"],
      color: "amber"
    },
    {
      id: "FB-1002C",
      handle: "@Singh_1998",
      time: "45 mins ago",
      content: "Thankfully the fire at Sector 4 was put out quickly. Props to the local fire department for the fast response.",
      threatLevel: "CLEARED",
      confidence: "99%",
      keywords: ["put out quickly", "fast response"],
      color: "emerald"
    }
  ];

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
          <Text className="text-blue-500 text-xs font-bold uppercase tracking-widest">3 Flags</Text>
        </View>
      </View>

      {/* Scraped Intel Feed */}
      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
        {mockIntel.map((intel) => (
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
                {intel.keywords.map((kw, idx) => (
                  <View key={idx} className="bg-gray-950 px-2 py-1 rounded border border-gray-800">
                    <Text className="text-gray-400 text-[10px] font-mono uppercase">[{kw}]</Text>
                  </View>
                ))}
              </View>
            </View>

          </View>
        ))}
        <View className="h-10" />
      </ScrollView>

    </View>
  );
}