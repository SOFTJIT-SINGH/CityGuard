import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RiskPredictionScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const riskZones = [
    {
      id: "Z-01",
      area: "Bus Stand Terminal",
      riskScore: 88,
      trend: "up",
      factors: ["High Crowd Density", "Historical Nighttime Thefts", "Low Illumination"],
      recommendation: "Increase patrol presence by 2 units. Deploy drone overhead.",
      color: "red"
    },
    {
      id: "Z-02",
      area: "Mall Road / Lawrence Rd",
      riskScore: 64,
      trend: "up",
      factors: ["Weekend Traffic Surge", "Recent Noise Complaints"],
      recommendation: "Monitor traffic cameras for illegal parking and altercations.",
      color: "amber"
    },
    {
      id: "Z-03",
      area: "Ranjit Avenue Block B",
      riskScore: 22,
      trend: "down",
      factors: ["Heavy Police Presence", "Clear Weather"],
      recommendation: "Maintain standard monitoring.",
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
          <View className="bg-purple-500/10 p-2 rounded-xl mr-3 border border-purple-500/20">
            <Ionicons name="analytics" size={24} color="#A855F7" />
          </View>
          <Text className="text-2xl font-black text-white tracking-tight">AI Risk Matrix</Text>
        </View>
      </View>

      <View className="px-6 mb-6">
        <Text className="text-gray-400 text-sm leading-relaxed mb-4">
          Neural network predictions based on historical incident data, real-time social sentiment, and current temporal factors.
        </Text>
        <View className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex-row items-center justify-between">
          <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest">Model Accuracy</Text>
          <Text className="text-emerald-400 font-mono font-bold tracking-widest">94.2%</Text>
        </View>
      </View>

      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
        {riskZones.map((zone) => (
          <View key={zone.id} className="bg-gray-900 border border-gray-800 rounded-3xl p-5 mb-5 shadow-lg relative overflow-hidden">
            
            {/* Header section with Score */}
            <View className="flex-row justify-between items-start mb-4 border-b border-gray-800 pb-4">
              <View className="flex-1 pr-4">
                <Text className="text-white text-xl font-black tracking-wide">{zone.area}</Text>
                <Text className="text-gray-500 text-xs font-mono mt-1">ZONE ID: {zone.id}</Text>
              </View>
              
              {/* Massive Risk Score Circle */}
              <View className={`h-14 w-14 rounded-full border-4 items-center justify-center ${
                zone.color === 'red' ? 'border-red-500 bg-red-500/10' : 
                zone.color === 'amber' ? 'border-amber-500 bg-amber-500/10' : 
                'border-emerald-500 bg-emerald-500/10'
              }`}>
                <Text className={`font-black font-mono text-lg ${
                  zone.color === 'red' ? 'text-red-400' : 
                  zone.color === 'amber' ? 'text-amber-400' : 
                  'text-emerald-400'
                }`}>{zone.riskScore}</Text>
              </View>
            </View>

            {/* Contributing Factors */}
            <View className="mb-4">
              <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-2">Contributing Variables</Text>
              <View className="flex-row flex-wrap gap-2">
                {zone.factors.map((factor, idx) => (
                  <View key={idx} className="bg-gray-950 px-3 py-1.5 rounded-md border border-gray-800">
                    <Text className="text-gray-300 text-xs font-mono">{factor}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* AI Recommendation */}
            <View className="bg-gray-950 p-3 rounded-xl border border-gray-800">
              <View className="flex-row items-center mb-1">
                <Ionicons name="bulb" size={14} color="#A855F7" />
                <Text className="text-purple-400 text-[10px] uppercase font-bold tracking-widest ml-1">System Recommendation</Text>
              </View>
              <Text className="text-gray-400 text-sm leading-relaxed">{zone.recommendation}</Text>
            </View>

          </View>
        ))}
        <View className="h-10" />
      </ScrollView>

    </View>
  );
}