import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import PanicButton from '../../components/ui/PanicButton';
import SOSModal from '../../components/ui/SOSButton';

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
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Location permission denied');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    console.log('SOS LOCATION:', loc.coords);
    Alert.alert('Emergency alert sent!');
  };

  return (
    <View className="flex-1 bg-[#F4F7F6]">
      <StatusBar style="dark" />
      
      <ScrollView className="flex-1 pt-16" showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View className="px-6 mb-8 flex-row items-center justify-between">
          <View>
            <Text className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">CityGuard</Text>
            <Text className="text-3xl font-black text-gray-900">Amritsar</Text>
          </View>
          <TouchableOpacity className="bg-white p-1 rounded-full shadow-sm border border-gray-100">
            <View className="bg-[#30AF5B]/10 p-3 rounded-full">
              <Ionicons name="person" size={24} color="#30AF5B" />
            </View>
          </TouchableOpacity>
        </View>

        {/* HORIZONTAL SWIPE CARDS (The Hilink Vibe) */}
        <View className="mb-10">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
          >
            {/* Primary Feature Card: AI Assist */}
            <TouchableOpacity 
              className="bg-[#30AF5B] w-[220px] h-[240px] rounded-[36px] p-6 justify-between shadow-xl shadow-[#30AF5B]/40"
              onPress={() => navigation.navigate('Chatbot')}
              activeOpacity={0.9}
            >
              <View className="bg-white/20 w-16 h-16 rounded-full items-center justify-center">
                <Ionicons name="chatbubbles" size={32} color="white" />
              </View>
              <View>
                <Text className="text-white text-2xl font-black mb-1">AI Assist</Text>
                <Text className="text-white/80 text-sm font-medium leading-relaxed">Instant safety guidance & tips</Text>
              </View>
            </TouchableOpacity>

            {/* Secondary Card: Crime Map */}
            <TouchableOpacity 
              className="bg-white w-[220px] h-[240px] rounded-[36px] p-6 justify-between shadow-sm border border-gray-100"
              onPress={() => navigation.navigate('Map')}
              activeOpacity={0.9}
            >
              <View className="bg-[#30AF5B]/10 w-16 h-16 rounded-full items-center justify-center">
                <Ionicons name="map" size={32} color="#30AF5B" />
              </View>
              <View>
                <Text className="text-gray-900 text-2xl font-black mb-1">Map</Text>
                <Text className="text-gray-500 text-sm font-medium leading-relaxed">View live local hotspots</Text>
              </View>
            </TouchableOpacity>

            {/* Tertiary Card: Report */}
            <TouchableOpacity 
              className="bg-white w-[220px] h-[240px] rounded-[36px] p-6 justify-between shadow-sm border border-gray-100"
              onPress={() => navigation.navigate('ReportCrime')}
              activeOpacity={0.9}
            >
              <View className="bg-blue-50 w-16 h-16 rounded-full items-center justify-center">
                <Ionicons name="megaphone" size={32} color="#2563EB" />
              </View>
              <View>
                <Text className="text-gray-900 text-2xl font-black mb-1">Report</Text>
                <Text className="text-gray-500 text-sm font-medium leading-relaxed">File an incident instantly</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* MASSIVE SOS PILL CARD */}
        <View className="px-6 mb-10">
          <Text className="text-lg font-bold text-gray-900 mb-4 px-1">Quick Actions</Text>
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={triggerSOS}
            className="bg-white rounded-[40px] p-3 shadow-sm border border-gray-100 flex-row items-center"
          >
            <View className="bg-[#EF4444] rounded-[32px] p-6 items-center justify-center shadow-lg shadow-red-500/30 mr-5">
              <Ionicons name="shield-alert-outline" size={44} color="white" />
            </View>
            <View className="flex-1 pr-4">
              <Text className="text-gray-900 text-2xl font-black mb-1">Emergency</Text>
              <Text className="text-gray-500 text-sm font-medium leading-tight">Hold for 3 seconds to trigger response</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* LIVE FEED CARD */}
        <View className="px-6 mb-12">
          <View className="bg-white rounded-[36px] p-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-lg font-bold text-gray-900">Recent Alerts</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
            
            <View className="flex-row items-center mb-6">
              <View className="bg-red-50 p-3 rounded-2xl mr-4">
                <Ionicons name="warning" size={24} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900">Theft Reported</Text>
                <Text className="text-gray-500 text-xs mt-1">Bus Stand • 2m ago</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="bg-amber-50 p-3 rounded-2xl mr-4">
                <Ionicons name="eye" size={24} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900">Suspicious Activity</Text>
                <Text className="text-gray-500 text-xs mt-1">Mall Road • 15m ago</Text>
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