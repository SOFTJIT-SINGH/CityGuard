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
        // await SMS.sendSMSAsync(['112', '911'], emergencyMessage);
        await SMS.sendSMSAsync(['8528473685'], emergencyMessage);
      } else {
        Linking.openURL('tel:112');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send SOS.');
      console.error(error);
    }
  };

  return (
    <View className="flex-1 bg-[#F4F7F6]">
      <StatusBar style="dark" />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        // Tightened the top padding so it sits perfectly under the notch without miles of empty space
        style={{ paddingTop: Math.max(insets.top, 20) + 12 }} 
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* SLEEK, PROFESSIONAL HEADER */}
        {/* SLEEK, PROFESSIONAL HEADER WITH APP NAME */}
        <View className="mb-6 flex-row items-center justify-between px-6">
          <View className="flex-row items-center">
            {/* Hamburger Menu Icon for Sidebar */}
            <TouchableOpacity 
              onPress={() => navigation.openDrawer()} 
              className="mr-4 bg-white p-2 rounded-full shadow-sm border border-gray-100"
            >
              <Ionicons name="menu" size={24} color="#111827" />
            </TouchableOpacity>
            
            <View>
              {/* APP NAME IS BACK */}
              <Text className="mb-0.5 text-lg font-black text-[#30AF5B] tracking-tight">
                CityGuard
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="location" size={14} color="#9CA3AF" style={{ marginRight: 2 }} />
                <Text className="text-xs font-bold text-gray-500 tracking-wider uppercase">Amritsar</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={() => navigation.navigate('Profile')}
            className="rounded-full border-2 border-white shadow-sm"
          >
            <Image 
              source={{ uri: 'https://ui-avatars.com/api/?name=City+Guard&background=30AF5B&color=fff&rounded=true&bold=true' }}
              className="h-11 w-11 rounded-full"
            />
          </TouchableOpacity>
        </View>

        {/* COLORFUL & PROFESSIONAL SWIPE CARDS */}
        <View className="mb-8">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
            
            <TouchableOpacity
              className="h-[220px] w-[200px] justify-between rounded-[32px] bg-emerald-500 p-6 shadow-xl shadow-emerald-500/30"
              onPress={() => navigation.navigate('Chatbot')}
              activeOpacity={0.9}>
              <View className="h-14 w-14 items-center justify-center rounded-full bg-white/20">
                <Ionicons name="chatbubbles" size={28} color="white" />
              </View>
              <View>
                <Text className="mb-1 text-xl font-black text-white">AI Assist</Text>
                <Text className="text-sm font-medium leading-relaxed text-emerald-50">
                  Instant safety guidance & tips
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="h-[220px] w-[200px] justify-between rounded-[32px] bg-yellow-400 p-6 shadow-xl shadow-orange-500/30"
              onPress={() => navigation.navigate('Map')}
              activeOpacity={0.9}>
              <View className="h-14 w-14 items-center justify-center rounded-full bg-white/20">
                <Ionicons name="map" size={28} color="white" />
              </View>
              <View>
                <Text className="mb-1 text-xl font-black text-white">Map</Text>
                <Text className="text-sm font-medium leading-relaxed text-indigo-50">
                  View live local hotspots
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="h-[220px] w-[200px] justify-between rounded-[32px] bg-red-500 p-6 shadow-xl shadow-violet-500/30"
              onPress={() => navigation.navigate('ReportCrime')}
              activeOpacity={0.9}>
              <View className="h-14 w-14 items-center justify-center rounded-full bg-white/20">
                <Ionicons name="megaphone" size={28} color="white" />
              </View>
              <View>
                <Text className="mb-1 text-xl font-black text-white">Report</Text>
                <Text className="text-sm font-medium leading-relaxed text-violet-50">
                  File an incident instantly
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* MASSIVE SOS PILL CARD */}
        <View className="mb-8 px-6">
          <Text className="mb-3 px-1 text-base font-bold text-gray-900 uppercase tracking-wide">Quick Actions</Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={triggerSOS}
            className="flex-row items-center rounded-[36px] border border-gray-100 bg-white p-3 shadow-sm">
            <View className="mr-4 items-center justify-center rounded-[28px] bg-[#EF4444] p-5 shadow-lg shadow-red-500/30">
              <MaterialCommunityIcons name="shield-alert-outline" size={38} color="white" />
            </View>
            <View className="flex-1 pr-4">
              <Text className="mb-0.5 text-xl font-black text-gray-900">Emergency</Text>
              <Text className="text-xs font-medium text-gray-500">
                Hold 3s to trigger response
              </Text>
            </View>
            <View className="pr-4">
               <Ionicons name="chevron-forward" size={24} color="#D1D5DB" />
            </View>
          </TouchableOpacity>
        </View>

        {/* LIVE FEED CARD */}
        <View className="px-6">
          <View className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm">
            <View className="mb-5 flex-row items-center justify-between">
              <Text className="text-base font-bold text-gray-900 uppercase tracking-wide">Recent Alerts</Text>
              <TouchableOpacity>
                <Text className="text-sm font-bold text-[#30AF5B]">See All</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-5 flex-row items-center">
              <View className="mr-4 rounded-2xl bg-red-50 p-3">
                <Ionicons name="warning" size={22} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900">Theft Reported</Text>
                <Text className="text-xs font-medium text-gray-500">Bus Stand • 2m ago</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="mr-4 rounded-2xl bg-amber-50 p-3">
                <Ionicons name="eye" size={22} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900">Suspicious Activity</Text>
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