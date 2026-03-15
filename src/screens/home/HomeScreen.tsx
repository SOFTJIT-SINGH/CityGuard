import PanicButton from '../../components/ui/PanicButton';
import SOSModal from '../../components/ui/SOSButton';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [showSOS, countdown]);

  const cancelSOS = () => {
    setShowSOS(false);
  };

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
    <LinearGradient colors={['#f8fafc', '#e2e8f0']} className="flex-1">
      <ScrollView className="flex-1 px-4 pt-12">
        {/* Header */}

        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-3xl font-bold">CityGuard</Text>

          <Ionicons name="shield-checkmark" size={28} color="#2563EB" />
        </View>

        {/* SOS BUTTON */}

        <TouchableOpacity
          className="mb-6 rounded-3xl bg-red-500 p-6 shadow-lg"
          onPress={triggerSOS}>
          <Text className="text-center text-xl font-bold text-white">EMERGENCY SOS</Text>
        </TouchableOpacity>

        {/* GRID */}

        <View className="flex-row flex-wrap justify-between">
          {/* Report Crime */}

          <TouchableOpacity
            className="mb-4 w-[48%]"
            onPress={() => navigation.navigate('ReportCrime')}>
            <BlurView intensity={80} tint="light" className="rounded-2xl bg-white/40 p-5">
              <Ionicons name="warning" size={26} color="#EF4444" />

              <Text className="mt-2 text-lg font-semibold">Report Crime</Text>

              <Text className="text-sm text-gray-500">Submit incident</Text>
            </BlurView>
          </TouchableOpacity>

          {/* Crime Map */}

          <TouchableOpacity className="mb-4 w-[48%]" onPress={() => navigation.navigate('Map')}>
            <BlurView intensity={80} tint="light" className="rounded-2xl bg-white/40 p-5">
              <Ionicons name="map" size={26} color="#2563EB" />

              <Text className="mt-2 text-lg font-semibold">Crime Map</Text>

              <Text className="text-sm text-gray-500">Nearby hotspots</Text>
            </BlurView>
          </TouchableOpacity>

          {/* AI Chatbot */}

          <TouchableOpacity className="mb-4 w-[48%]" onPress={() => navigation.navigate('Chatbot')}>
            <BlurView intensity={80} tint="light" className="rounded-2xl bg-white/40 p-5">
              <Ionicons name="chatbubble-ellipses" size={26} color="#10B981" />

              <Text className="mt-2 text-lg font-semibold">AI Assistant</Text>

              <Text className="text-sm text-gray-500">Safety advice</Text>
            </BlurView>
          </TouchableOpacity>

          {/* Notifications */}

          <TouchableOpacity className="mb-4 w-[48%]" onPress={() => navigation.navigate('Alerts')}>
            <BlurView intensity={80} tint="light" className="rounded-2xl bg-white/40 p-5">
              <Ionicons name="notifications" size={26} color="#F59E0B" />

              <Text className="mt-2 text-lg font-semibold">Alerts</Text>

              <Text className="text-sm text-gray-500">Crime updates</Text>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* RECENT ACTIVITY */}

        <BlurView intensity={80} tint="light" className="mt-4 rounded-2xl bg-white/40 p-5">
          <Text className="mb-2 text-lg font-semibold">Recent Alerts</Text>

          <Text className="text-gray-600">Theft reported near Bus Stand</Text>

          <Text className="text-gray-600">Suspicious activity near Mall Road</Text>
        </BlurView>
      </ScrollView>
      <PanicButton onPress={triggerSOS} />
      <SOSModal visible={showSOS} countdown={countdown} cancel={cancelSOS} />
    </LinearGradient>
  );
}
