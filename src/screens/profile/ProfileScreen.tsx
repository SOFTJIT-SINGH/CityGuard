import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase'; // IMPORT SUPABASE

export default function ProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [userData, setUserData] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
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
        setAuthEmail(user.email ?? null);
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
    ice_contact: 'N/A',
    phone_number: 'Not Provided',
    role: 'civilian'
  };

  return (
    <ScrollView className="flex-1 bg-gray-950" style={{ paddingTop: Math.max(insets.top, 20) }}>
      {/* Header Profile Section */}
      <View className="relative items-center rounded-b-[40px] border-b border-gray-800 bg-gray-900 px-6 pb-12 pt-6 shadow-2xl">
        <TouchableOpacity onPress={() => navigation.openDrawer()} className="absolute left-6 top-6 rounded-full border border-gray-700 bg-gray-800 p-2">
          <Ionicons name="menu" size={24} color="#D1D5DB" />
        </TouchableOpacity>

        <View className="mb-4 rounded-full border-4 border-emerald-500 bg-gray-950 p-1 shadow-2xl shadow-emerald-500/40">
          <Image
            source={{ uri: displayData.avatar_url || `https://ui-avatars.com/api/?name=${displayData.full_name}&background=111827&color=10B981&size=256&bold=true` }}
            className="h-32 w-32 rounded-full"
          />
        </View>
        <Text className="text-3xl font-black tracking-tight text-white">{displayData.full_name}</Text>
        <View className="mt-2 flex-row items-center rounded-full bg-emerald-500/10 px-4 py-1 border border-emerald-500/20">
          <View className="mr-2 h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500" />
          <Text className="font-mono text-xs font-black tracking-widest text-emerald-400 uppercase">{displayData.role}</Text>
        </View>
        <Text className="mt-2 font-mono text-xs tracking-tighter text-gray-500 uppercase">ID: {displayData.operative_id}</Text>
      </View>

      {/* Stats/Emergency Row */}
      <View className="-mt-10 px-6">
        <View className="flex-row items-center justify-between rounded-3xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
          <View className="items-center">
            <Text className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-500">Blood Type</Text>
            <View className="flex-row items-center">
              <Ionicons name="water" size={16} color="#EF4444" className="mr-1" />
              <Text className="text-2xl font-black text-red-500">{displayData.blood_type}</Text>
            </View>
          </View>
          <View className="h-10 w-[1px] bg-gray-800"></View>
          <View className="items-center">
            <Text className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</Text>
            <View className="flex-row items-center bg-blue-500/10 px-3 py-1 rounded-full">
              <Text className="text-xs font-black text-blue-400 uppercase">ACTIVE</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Main Details Section */}
      <View className="mt-8 px-6 space-y-4">
        <Text className="mb-2 px-1 text-xs font-bold uppercase tracking-widest text-gray-500">
          Account Details
        </Text>

        <View className="rounded-3xl border border-gray-800 bg-gray-900 p-5 space-y-5">
           <View className="flex-row items-center mb-2">
              <View className="mr-4 rounded-2xl bg-gray-800 p-3">
                <Ionicons name="mail" size={20} color="#10B981" />
              </View>
              <View>
                <Text className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Email</Text>
                <Text className="text-base font-bold text-white">{authEmail || 'Not available'}</Text>
              </View>
           </View>

           <View className="h-[1px] bg-gray-800 w-full" />

           <View className="flex-row items-center my-2">
              <View className="mr-4 rounded-2xl bg-gray-800 p-3">
                <Ionicons name="call" size={20} color="#10B981" />
              </View>
              <View>
                <Text className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Phone</Text>
                <Text className="text-base font-bold text-white">{displayData.phone_number}</Text>
              </View>
           </View>

           <View className="h-[1px] bg-gray-800 w-full" />

           <View className="flex-row items-center mt-2">
              <View className="mr-4 rounded-2xl bg-gray-800 p-3">
                <Ionicons name="alert-circle" size={20} color="#10B981" />
              </View>
              <View>
                <Text className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Emergency Contact</Text>
                <Text className="text-base font-bold text-white">{displayData.ice_contact}</Text>
              </View>
           </View>
        </View>
      </View>

      {/* More Options Section */}
      <View className="mb-10 mt-8 space-y-3 px-6">
        <Text className="mb-2 px-1 text-xs font-bold uppercase tracking-widest text-gray-500">
          Preferences & Security
        </Text>

        <TouchableOpacity 
          onPress={() => navigation.navigate('EditProfile')}
          className="flex-row items-center justify-between rounded-2xl border border-gray-800 bg-gray-900 p-4 shadow-sm"
        >
          <View className="flex-row items-center">
            <View className="mr-4 rounded-xl bg-emerald-500/10 p-2 border border-emerald-500/20">
              <Ionicons name="create" size={20} color="#10B981" />
            </View>
            <Text className="text-base font-bold text-white">Edit Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#4B5563" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('EmergencyContacts')}
          className="flex-row items-center justify-between mt-2 rounded-2xl border border-gray-800 bg-gray-900 p-4 shadow-sm"
        >
          <View className="flex-row items-center">
            <View className="mr-4 rounded-xl bg-blue-500/10 p-2 border border-blue-500/20">
              <Ionicons name="people" size={20} color="#3B82F6" />
            </View>
            <Text className="text-base font-bold text-white">Emergency Contacts</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#4B5563" />
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity 
          onPress={() => {
            Alert.alert(
              "Log Out",
              "Are you sure you want to terminate your current session?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Log Out", style: "destructive", onPress: handleLogout }
              ]
            );
          }}
          className="mt-6 flex-row items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/5 p-4"
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text className="ml-2 text-sm font-black uppercase tracking-widest text-red-500">
            Sign Out
          </Text>
        </TouchableOpacity>

        <Text className="my-4 text-center text-[10px] font-bold uppercase tracking-widest text-gray-700">
          CityGuard v1.0.4 • Secure Protocol Active
        </Text>
      </View>
    </ScrollView>
  );
}