import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase'; // IMPORT SUPABASE

export default function ProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) setUserData(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <View className="flex-1 bg-gray-950 items-center justify-center"><ActivityIndicator color="#10B981" /></View>;
  }

  const displayData = userData || {
    full_name: 'Unknown User',
    operative_id: 'PENDING',
    blood_type: 'N/A',
    ice_contact: 'N/A'
  };

  return (
    <ScrollView className="flex-1 bg-gray-950" style={{ paddingTop: Math.max(insets.top, 20) }}>
      <View className="relative items-center rounded-b-[40px] border-b border-gray-800 bg-gray-900 px-6 pb-8 pt-6 shadow-lg">
        <TouchableOpacity onPress={() => navigation.openDrawer()} className="absolute left-6 top-6 rounded-full border border-gray-700 bg-gray-800 p-2">
          <Ionicons name="menu" size={24} color="#D1D5DB" />
        </TouchableOpacity>

        <View className="mb-4 rounded-full border-2 border-emerald-500 bg-gray-950 p-1 shadow-lg shadow-emerald-500/20">
          <Image
            source={{ uri: displayData.avatar_url || `https://ui-avatars.com/api/?name=${displayData.full_name}&background=111827&color=10B981&size=128&bold=true` }}
            className="h-24 w-24 rounded-full"
          />
        </View>
        <Text className="text-3xl font-black tracking-tight text-white">{displayData.full_name}</Text>
        <Text className="mt-1 font-mono text-sm tracking-widest text-emerald-400">ID: {displayData.operative_id}</Text>
      </View>

      <View className="-mt-6 px-6">
        <View className="flex-row items-center justify-between rounded-3xl border border-gray-800 bg-gray-900 p-6 shadow-lg">
          <View>
            <Text className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-500">Blood Type</Text>
            <Text className="text-2xl font-black text-red-500">{displayData.blood_type}</Text>
          </View>
          <View className="h-12 w-[1px] bg-gray-800"></View>
          <View>
            <Text className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-500">Emergency Contact</Text>
            <Text className="font-mono text-lg font-bold text-white">{displayData.ice_contact}</Text>
          </View>
        </View>
      </View>

      <View className="mb-10 mt-8 space-y-4 px-6">
        <Text className="mb-2 px-1 text-xs font-bold uppercase tracking-widest text-gray-500">
          Settings
        </Text>

        {[
          {
            icon: 'shield-checkmark',
            color: '#10B981',
            label: 'Edit Profile',
            action: () => navigation.navigate('EditProfile'),
          },
          { 
            icon: 'notifications', 
            color: '#3B82F6', 
            label: 'Notification Settings',
            action: () => Linking.openSettings() 
          },
          { 
            icon: 'location', 
            color: '#F59E0B', 
            label: 'Location Services',
            action: () => Linking.openSettings() 
          },
        ].map((item, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={item.action}
            className="mb-3 flex-row items-center justify-between rounded-2xl border border-gray-800 bg-gray-900 p-4 shadow-sm">
            <View className="flex-row items-center">
              <View
                className="mr-4 rounded-xl p-2"
                style={{
                  backgroundColor: `${item.color}15`,
                  borderColor: `${item.color}30`,
                  borderWidth: 1,
                }}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text className="text-base font-bold text-gray-200">{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#4B5563" />
          </TouchableOpacity>
        ))}

        {/* Logout Button */}
        <TouchableOpacity className="mt-4 flex-row items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <Ionicons name="power" size={20} color="#EF4444" />
          <Text className="ml-2 text-base font-black uppercase tracking-widest text-red-500">
            Log Out
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}