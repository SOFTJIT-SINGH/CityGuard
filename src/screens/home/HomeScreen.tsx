import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import PanicButton from '../../components/ui/PanicButton';
import SOSModal from '../../components/ui/SOSButton';
import * as SMS from 'expo-sms'; // Make sure to add this import at the top!
import * as Linking from 'expo-linking';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }: any) {
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
      // 1. Get Location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need your location to send the SOS.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

      // 2. Prepare the message
      const emergencyMessage = `SOS! I need help. I am currently at this location: ${googleMapsLink}`;

      // 3. Send the SMS
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        await SMS.sendSMSAsync(
          ['112', '911'], // Replace with actual emergency contacts later
          emergencyMessage
        );
      } else {
        // Fallback if SMS fails (like on an emulator)
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

      <ScrollView className="flex-1 pt-16" showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View className="mb-8 flex-row items-center justify-between px-6">
          <View>
            <Text className="mb-1 text-sm font-bold uppercase tracking-widest text-gray-400">
              CityGuard
            </Text>
            <Text className="text-3xl font-black text-gray-900">Amritsar</Text>
          </View>
          <TouchableOpacity className="rounded-full border border-gray-100 bg-white p-1 shadow-sm">
            <View className="rounded-full bg-[#30AF5B]/10 p-3">
              <Ionicons name="person" size={24} color="#30AF5B" />
            </View>
          </TouchableOpacity>
        </View>

        {/* HORIZONTAL SWIPE CARDS (The Hilink Vibe) */}
        <View className="mb-10">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
            {/* Primary Feature Card: AI Assist */}
            <TouchableOpacity
              className="h-[240px] w-[220px] justify-between rounded-[36px] bg-[#30AF5B] p-6 shadow-xl shadow-[#30AF5B]/40"
              onPress={() => navigation.navigate('Chatbot')}
              activeOpacity={0.9}>
              <View className="h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <Ionicons name="chatbubbles" size={32} color="white" />
              </View>
              <View>
                <Text className="mb-1 text-2xl font-black text-white">AI Assist</Text>
                <Text className="text-sm font-medium leading-relaxed text-white/80">
                  Instant safety guidance & tips
                </Text>
              </View>
            </TouchableOpacity>

            {/* Secondary Card: Crime Map */}
            <TouchableOpacity
              className="h-[240px] w-[220px] justify-between rounded-[36px] border border-gray-100 bg-white p-6 shadow-sm"
              onPress={() => navigation.navigate('Map')}
              activeOpacity={0.9}>
              <View className="h-16 w-16 items-center justify-center rounded-full bg-[#30AF5B]/10">
                <Ionicons name="map" size={32} color="#30AF5B" />
              </View>
              <View>
                <Text className="mb-1 text-2xl font-black text-gray-900">Map</Text>
                <Text className="text-sm font-medium leading-relaxed text-gray-500">
                  View live local hotspots
                </Text>
              </View>
            </TouchableOpacity>

            {/* Tertiary Card: Report */}
            <TouchableOpacity
              className="h-[240px] w-[220px] justify-between rounded-[36px] border border-gray-100 bg-white p-6 shadow-sm"
              onPress={() => navigation.navigate('ReportCrime')}
              activeOpacity={0.9}>
              <View className="h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                <Ionicons name="megaphone" size={32} color="#2563EB" />
              </View>
              <View>
                <Text className="mb-1 text-2xl font-black text-gray-900">Report</Text>
                <Text className="text-sm font-medium leading-relaxed text-gray-500">
                  File an incident instantly
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* MASSIVE SOS PILL CARD */}
        <View className="mb-10 px-6">
          <Text className="mb-4 px-1 text-lg font-bold text-gray-900">Quick Actions</Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={triggerSOS}
            className="flex-row items-center rounded-[40px] border border-gray-100 bg-white p-3 shadow-sm">
            <View className="mr-5 items-center justify-center rounded-[32px] bg-[#EF4444] p-6 shadow-lg shadow-red-500/30">
              {/* <Ionicons name="shield" size={44} color="white" /> */}
              <MaterialCommunityIcons name="shield-alert-outline" size={44} color="white" />
            </View>
            <View className="flex-1 pr-4">
              <Text className="mb-1 text-2xl font-black text-gray-900">Emergency</Text>
              <Text className="text-sm font-medium leading-tight text-gray-500">
                Hold for 3 seconds to trigger response
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* LIVE FEED CARD */}
        <View className="mb-12 px-6">
          <View className="rounded-[36px] border border-gray-100 bg-white p-6 shadow-sm">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-900">Recent Alerts</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>

            <View className="mb-6 flex-row items-center">
              <View className="mr-4 rounded-2xl bg-red-50 p-3">
                <Ionicons name="warning" size={24} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900">Theft Reported</Text>
                <Text className="mt-1 text-xs text-gray-500">Bus Stand • 2m ago</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="mr-4 rounded-2xl bg-amber-50 p-3">
                <Ionicons name="eye" size={24} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900">Suspicious Activity</Text>
                <Text className="mt-1 text-xs text-gray-500">Mall Road • 15m ago</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <PanicButton onPress={triggerSOS} />
      <SOSModal visible={showSOS} countdown={countdown} cancel={cancelSOS} />
    </View>
  );
}
