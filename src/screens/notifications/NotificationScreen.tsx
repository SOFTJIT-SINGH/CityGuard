import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NotificationScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const mockAlerts = [
    { id: 1, type: 'critical', title: 'SOS Activated', desc: 'Sector 4, Near Mall Road. Units dispatched.', time: 'Just now', icon: 'warning' },
    { id: 2, type: 'warning', title: 'Suspicious Crowd', desc: 'AI Camera 04 detected anomaly at Bus Stand.', time: '12 mins ago', icon: 'people' },
    { id: 3, type: 'info', title: 'Route Cleared', desc: 'Previous accident on GT Road has been resolved.', time: '1 hour ago', icon: 'checkmark-circle' },
    { id: 4, type: 'warning', title: 'Theft Report', desc: 'User reported stolen vehicle. Processing data.', time: '3 hours ago', icon: 'car' },
  ];

  return (
    <View className="flex-1 bg-gray-950" style={{ paddingTop: Math.max(insets.top, 20) + 12 }}>
      
      {/* Header */}
      <View className="px-6 mb-6 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.openDrawer()} className="mr-4 bg-gray-900 p-2 rounded-full border border-gray-800 shadow-sm">
            <Ionicons name="menu" size={24} color="#D1D5DB" />
          </TouchableOpacity>
          <View className="bg-amber-500/10 p-2 rounded-xl mr-3 border border-amber-500/20">
            <Ionicons name="notifications" size={24} color="#F59E0B" />
          </View>
          <Text className="text-2xl font-black text-white tracking-tight">Dispatch Feed</Text>
        </View>
      </View>

      <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
        {mockAlerts.map((alert) => (
          <View key={alert.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4 shadow-lg flex-row items-start">
            <View className={`p-3 rounded-full mr-4 ${
              alert.type === 'critical' ? 'bg-red-500/10 border border-red-500/30' : 
              alert.type === 'warning' ? 'bg-amber-500/10 border border-amber-500/30' : 
              'bg-emerald-500/10 border border-emerald-500/30'
            }`}>
              <Ionicons name={alert.icon as any} size={24} color={
                alert.type === 'critical' ? '#EF4444' : alert.type === 'warning' ? '#F59E0B' : '#10B981'
              } />
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-white font-bold text-base tracking-wide">{alert.title}</Text>
                <Text className="text-gray-500 text-[10px] font-mono uppercase">{alert.time}</Text>
              </View>
              <Text className="text-gray-400 text-sm leading-relaxed">{alert.desc}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}