import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as SMS from 'expo-sms';
import * as Linking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SOSModal from '../../components/ui/SOSButton';

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [showSOS, setShowSOS] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const triggerSOS = () => {
    setCountdown(5);
    setShowSOS(true);
  };

  useEffect(() => {
    if (!showSOS) return;
    if (countdown === 0) {
      sendEmergencyAlert();
      setShowSOS(false);
      return;
    }
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [showSOS, countdown]);

  const cancelSOS = () => setShowSOS(false);

  const sendEmergencyAlert = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need your location to send the SOS.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

      const emergencyMessage = `SOS! I need help. I am currently at this location: ${googleMapsLink}`;

      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        await SMS.sendSMSAsync(['112', '911'], emergencyMessage);
      } else {
        Linking.openURL('tel:112');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send SOS.');
      console.error(error);
    }
  };

  return (
    <View className="flex-1 bg-gray-950">
      <StatusBar style="light" />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        style={{ paddingTop: Math.max(insets.top, 20) + 12 }} 
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* TACTICAL HEADER */}
        <View className="mb-6 flex-row items-center justify-between px-6">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => navigation.openDrawer()} 
              className="mr-4 bg-gray-900 p-2 rounded-full border border-gray-800 shadow-sm"
            >
              <Ionicons name="menu" size={24} color="#D1D5DB" />
            </TouchableOpacity>
            
            <View>
              <Text className="mb-0.5 text-lg font-black text-emerald-400 tracking-tight">
                CITYGUARD OS
              </Text>
              <View className="flex-row items-center">
                <View className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                <Text className="text-xs font-bold text-gray-400 tracking-widest uppercase">Secured • Amritsar</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={() => navigation.navigate('Profile')}
            className="rounded-full border-2 border-gray-800"
          >
            <Image 
              source={{ uri: 'https://ui-avatars.com/api/?name=Admin&background=111827&color=10B981&rounded=true&bold=true' }}
              className="h-11 w-11 rounded-full"
            />
          </TouchableOpacity>
        </View>

        {/* STEALTH SWIPE CARDS */}
        <View className="mb-8">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
            
            <TouchableOpacity
              className="h-[220px] w-[200px] justify-between rounded-[32px] bg-gray-900 border border-gray-800 p-6 shadow-xl"
              onPress={() => navigation.navigate('Chatbot')}
              activeOpacity={0.9}>
              <View className="h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Ionicons name="hardware-chip" size={28} color="#10B981" />
              </View>
              <View>
                <Text className="mb-1 text-xl font-black text-white">AI Intel</Text>
                <Text className="text-sm font-medium leading-relaxed text-gray-400">
                  Predictive safety analysis
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="h-[220px] w-[200px] justify-between rounded-[32px] bg-gray-900 border border-gray-800 p-6 shadow-xl"
              onPress={() => navigation.navigate('Map')}
              activeOpacity={0.9}>
              <View className="h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20">
                <Ionicons name="locate" size={28} color="#3B82F6" />
              </View>
              <View>
                <Text className="mb-1 text-xl font-black text-white">Live Radar</Text>
                <Text className="text-sm font-medium leading-relaxed text-gray-400">
                  City-wide hotspot tracking
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="h-[220px] w-[200px] justify-between rounded-[32px] bg-gray-900 border border-gray-800 p-6 shadow-xl"
              onPress={() => navigation.navigate('ReportCrime')}
              activeOpacity={0.9}>
              <View className="h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
                <Ionicons name="warning" size={28} color="#F59E0B" />
              </View>
              <View>
                <Text className="mb-1 text-xl font-black text-white">File Report</Text>
                <Text className="text-sm font-medium leading-relaxed text-gray-400">
                  Submit secure incident data
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* MASSIVE SOS PILL CARD */}
        <View className="mb-8 px-6">
          <Text className="mb-3 px-1 text-xs font-bold text-gray-500 uppercase tracking-widest">Override Protocol</Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={triggerSOS}
            className="flex-row items-center rounded-[36px] border border-gray-800 bg-gray-900 p-3 shadow-lg">
            <View className="mr-4 items-center justify-center rounded-[28px] bg-red-600 p-5 shadow-lg shadow-red-600/40 border border-red-500">
              <MaterialCommunityIcons name="shield-alert-outline" size={38} color="white" />
            </View>
            <View className="flex-1 pr-4">
              <Text className="mb-0.5 text-xl font-black text-white">Trigger SOS</Text>
              <Text className="text-xs font-medium text-gray-400">
                Deploy emergency response team
              </Text>
            </View>
            <View className="pr-4">
               <Ionicons name="chevron-forward" size={24} color="#4B5563" />
            </View>
          </TouchableOpacity>
        </View>

        {/* LIVE FEED CARD */}
        <View className="px-6">
          <View className="rounded-[32px] border border-gray-800 bg-gray-900 p-6 shadow-lg">
            <View className="mb-5 flex-row items-center justify-between">
              <Text className="text-xs font-bold text-gray-500 uppercase tracking-widest">Live Network Log</Text>
              <TouchableOpacity>
                <Text className="text-sm font-bold text-emerald-400">View All</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-5 flex-row items-center">
              <View className="mr-4 rounded-2xl bg-red-500/10 p-3 border border-red-500/20">
                <Ionicons name="alert" size={22} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-white">Theft Reported</Text>
                <Text className="text-xs font-medium text-gray-500">Sector 4 • 2m ago</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="mr-4 rounded-2xl bg-amber-500/10 p-3 border border-amber-500/20">
                <Ionicons name="eye" size={22} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-white">Suspicious Activity</Text>
                <Text className="text-xs font-medium text-gray-500">Mall Road • 15m ago</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <SOSModal visible={showSOS} countdown={countdown} cancel={cancelSOS} />
    </View>
  );
}