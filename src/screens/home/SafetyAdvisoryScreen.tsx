import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SafetyAdvisoryScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const tips = [
    { title: "Nighttime Protocol", desc: "Stick to well-lit main roads. Avoid Sector 4 park after 22:00 HRS.", icon: "moon", color: "indigo" },
    { title: "Crowd Defense", desc: "Keep valuables in front pockets. High pickpocket risk at Bus Stand currently.", icon: "people", color: "amber" },
    { title: "Emergency Comms", desc: "Ensure your ICE (In Case of Emergency) contacts are updated in your profile.", icon: "call", color: "emerald" }
  ];

  return (
    <View className="flex-1 bg-gray-950" style={{ paddingTop: Math.max(insets.top, 20) + 12 }}>
      <View className="px-6 mb-6 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.openDrawer()} className="mr-4 bg-gray-900 p-2 rounded-full border border-gray-800">
          <Ionicons name="menu" size={24} color="#D1D5DB" />
        </TouchableOpacity>
        <View className="bg-emerald-500/10 p-2 rounded-xl mr-3 border border-emerald-500/20">
          <Ionicons name="shield-checkmark" size={24} color="#10B981" />
        </View>
        <Text className="text-2xl font-black text-white tracking-tight">Smart Advisories</Text>
      </View>

      <ScrollView className="px-6">
        <Text className="text-gray-400 text-sm mb-6">AI-generated safety recommendations based on your current GPS location and local time.</Text>
        
        {tips.map((tip, idx) => (
          <View key={idx} className="bg-gray-900 border border-gray-800 p-4 rounded-2xl mb-4 flex-row items-start">
            <View className={`bg-${tip.color}-500/10 p-3 rounded-xl border border-${tip.color}-500/30 mr-4`}>
              <Ionicons name={tip.icon as any} size={24} color={tip.color === 'indigo' ? '#818CF8' : tip.color === 'amber' ? '#FBBF24' : '#34D399'} />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg mb-1">{tip.title}</Text>
              <Text className="text-gray-400 text-sm leading-relaxed">{tip.desc}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}