import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  
  const userData = {
    name: "Softjit Singh",
    id: "CU-8085-X",
    emergencyContact: "+91 85284 73685",
    bloodGroup: "A+",
  };

  return (
    <ScrollView className="flex-1 bg-gray-950" style={{ paddingTop: Math.max(insets.top, 20) }}>
      
      {/* Header / Profile Info */}
      <View className="px-6 pt-6 pb-8 items-center border-b border-gray-800 bg-gray-900 rounded-b-[40px] shadow-lg relative">
        <TouchableOpacity onPress={() => navigation.openDrawer()} className="absolute top-6 left-6 bg-gray-800 p-2 rounded-full border border-gray-700">
          <Ionicons name="menu" size={24} color="#D1D5DB" />
        </TouchableOpacity>

        <View className="p-1 rounded-full border-2 border-emerald-500 mb-4 bg-gray-950 shadow-lg shadow-emerald-500/20">
          <Image source={{ uri: 'https://ui-avatars.com/api/?name=Agent+Singh&background=111827&color=10B981&size=128&bold=true' }} className="w-24 h-24 rounded-full" />
        </View>
        <Text className="text-white text-3xl font-black tracking-tight">{userData.name}</Text>
        <Text className="text-emerald-400 text-sm font-mono tracking-widest mt-1">ID: {userData.id}</Text>
      </View>

      {/* Emergency Info Card */}
      <View className="px-6 -mt-6">
        <View className="bg-gray-900 p-6 rounded-3xl shadow-lg border border-gray-800 flex-row justify-between items-center">
          <View>
            <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Blood Type</Text>
            <Text className="text-red-500 text-2xl font-black">{userData.bloodGroup}</Text>
          </View>
          <View className="h-12 w-[1px] bg-gray-800"></View>
          <View>
            <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">ICE Contact</Text>
            <Text className="text-white text-lg font-bold font-mono">{userData.emergencyContact}</Text>
          </View>
        </View>
      </View>

      {/* Settings Options */}
      <View className="px-6 mt-8 space-y-4 mb-10">
        <Text className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">System Preferences</Text>

        {[
          { icon: 'shield-checkmark', color: '#10B981', label: 'Security & Clearance' },
          { icon: 'notifications', color: '#3B82F6', label: 'Alert Preferences' },
          { icon: 'location', color: '#F59E0B', label: 'Tracking Protocols' },
        ].map((item, idx) => (
          <TouchableOpacity key={idx} className="bg-gray-900 p-4 rounded-2xl flex-row items-center justify-between border border-gray-800 mb-3 shadow-sm">
            <View className="flex-row items-center">
              <View className="p-2 rounded-xl mr-4" style={{ backgroundColor: `${item.color}15`, borderColor: `${item.color}30`, borderWidth: 1 }}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text className="text-gray-200 text-base font-bold">{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#4B5563" />
          </TouchableOpacity>
        ))}

        {/* Logout Button */}
        <TouchableOpacity className="bg-red-500/10 p-4 rounded-2xl flex-row items-center justify-center border border-red-500/30 mt-4">
          <Ionicons name="power" size={20} color="#EF4444" />
          <Text className="text-red-500 text-base font-black tracking-widest uppercase ml-2">Terminate Session</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}