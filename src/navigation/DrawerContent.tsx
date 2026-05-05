import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import { DrawerContentComponentProps, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function DrawerContent(props: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();
  const { profile, user } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const handleLogout = async () => {
    Alert.alert(
      "Terminate Session",
      "Are you sure you want to log out of the tactical network?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive", 
          onPress: async () => {
            await supabase.auth.signOut();
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#030712' }}>
      {/* Drawer Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View className="flex-row items-center mb-4">
          <View className="bg-emerald-500/10 p-2 rounded-xl mr-3 border border-emerald-500/20">
            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
          </View>
          <View>
            <Text className="text-[10px] font-black text-gray-500 tracking-[3px] uppercase">CityGuard</Text>
            <Text className="text-white font-black text-lg tracking-tight">Security Network</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => props.navigation.navigate('Profile')}
          className="flex-row items-center bg-gray-900/50 p-4 rounded-3xl border border-gray-800"
        >
          <Image
            source={{ uri: `https://ui-avatars.com/api/?name=${(profile?.full_name || 'User').replace(' ', '+')}&background=10B981&color=fff&bold=true` }}
            className="h-12 w-12 rounded-2xl border border-emerald-500/50"
          />
          <View className="ml-4 flex-1">
            <Text className="text-white font-black tracking-tight text-base" numberOfLines={1}>
              {profile?.full_name || 'Loading Profile...'}
            </Text>
            <View className="flex-row items-center">
              <View className={`h-1.5 w-1.5 rounded-full mr-1.5 ${isAdmin ? 'bg-blue-500' : 'bg-emerald-500'}`} />
              <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                {isAdmin ? 'System Admin' : 'Verified Citizen'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        {...props} 
        contentContainerStyle={{ paddingVertical: 10 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 mb-2">
          <Text className="text-gray-600 text-[10px] font-black uppercase tracking-[4px] ml-4 mb-2">Main Terminal</Text>
          <DrawerItemList {...props} />
        </View>

        {/* Tactical Info Section */}
        <View className="mx-6 my-4 p-5 bg-gray-900/40 border border-dashed border-gray-800 rounded-3xl">
          <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3">System Status</Text>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-400 text-xs">Encryption</Text>
            <Text className="text-emerald-500 text-[10px] font-mono font-bold">AES-256</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-400 text-xs">Latency</Text>
            <Text className="text-blue-500 text-[10px] font-mono font-bold">14ms</Text>
          </View>
        </View>
      </ScrollView>

      {/* Drawer Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity 
          onPress={handleLogout}
          className="flex-row items-center bg-red-500/5 border border-red-500/20 p-4 rounded-2xl"
        >
          <View className="bg-red-500/10 p-2 rounded-xl mr-3">
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </View>
          <Text className="text-red-500 font-black tracking-widest uppercase text-xs">Logout Session</Text>
        </TouchableOpacity>
        <Text className="text-gray-700 text-[9px] font-mono text-center mt-4">
          BUILD V1.0.4-TACTICAL // {user?.id?.slice(0, 8).toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#111827',
  },
});
