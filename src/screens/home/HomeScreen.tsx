import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import SOSModal from '../../components/ui/SOSButton';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [showSOS, setShowSOS] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // 1. Dynamic User State
  const [userData, setUserData] = useState({
    full_name: 'Loading...',
    operative_id: 'PENDING',
  });

  // 2. Fetch Profile from Supabase on Load
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, operative_id')
          .eq('id', user.id)
          .single();

        if (data) {
          setUserData({
            full_name: data.full_name || 'Operative',
            operative_id: data.operative_id || 'UNKNOWN',
          });
        }
      }
    };
    fetchProfile();
  }, []);

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
        Alert.alert('Permission Denied', 'Location access is required for SOS.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      console.log('SOS Dispatched at: ', loc.coords.latitude, loc.coords.longitude);
      Alert.alert('SOS SENT', 'Authorities have been notified of your location.');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View className="flex-1 bg-[#05080D]">
      <StatusBar style="light" />

      {/* TOP GLASS HEADER */}
      <View
        style={{ paddingTop: insets.top + 10 }}
        className="flex-row items-center justify-between border-b border-gray-800/50 bg-[#0A0F1A]/80 px-6 pb-4 backdrop-blur-xl">
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-2.5">
          <Ionicons name="grid-outline" size={22} color="#10B981" />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="mb-0.5 text-[10px] font-black uppercase tracking-[4px] text-gray-500">
            Safety Dashboard
          </Text>
          <Text className="text-lg font-black tracking-tighter text-white">
            Hi, <Text className="text-emerald-500">{userData.full_name !== 'Loading...' ? userData.full_name.split(' ')[0] : 'Citizen'}</Text>
          </Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image
            source={{
              uri: `https://ui-avatars.com/api/?name=${userData.full_name.replace(' ', '+')}&background=10B981&color=fff&bold=true`,
            }}
            className="h-10 w-10 rounded-2xl border border-emerald-500/50"
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* HERO SOS SECTION */}
        <View className="mt-6 px-6">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={triggerSOS}
            style={{ shadowColor: '#EF4444', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 }}
            className="bg-[#1A0B0B] border border-red-900/40 rounded-[40px] p-6 flex-row items-center"
          >
            <View className="bg-red-600 h-16 w-16 rounded-full items-center justify-center border-4 border-red-400/30 shadow-lg">
              <MaterialCommunityIcons name="shield-alert" size={32} color="white" />
            </View>
            <View className="ml-5 flex-1">
              <Text className="text-white text-2xl font-black italic tracking-tighter">EMERGENCY SOS</Text>
              <Text className="text-red-500/80 text-[10px] font-bold uppercase tracking-widest">Tap to alert authorities</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* PRIMARY ACTION: REPORT CRIME */}
        <View className="mt-6 px-6">
          <TouchableOpacity
            onPress={() => navigation.navigate('ReportCrime')}
            activeOpacity={0.8}
            className="bg-[#121A16] border border-emerald-900/30 rounded-[35px] p-5 flex-row items-center shadow-xl"
          >
            <View className="bg-emerald-500/10 h-14 w-14 rounded-2xl items-center justify-center border border-emerald-500/20">
              <Ionicons name="warning" size={28} color="#10B981" />
            </View>
            <View className="ml-5 flex-1">
              <Text className="text-white text-xl font-black tracking-tight">REPORT INCIDENT</Text>
              <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Help keep the community safe</Text>
            </View>
            <View className="bg-emerald-500/20 px-2 py-1 rounded-md">
              <Text className="text-emerald-400 font-mono text-[9px] font-bold">LIVE</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* LIVE INTEL WIDGETS */}
        <View className="mt-6 px-6 flex-row justify-between">
            <View className="w-[48%] bg-[#0D1321] border border-gray-800/60 rounded-3xl p-4">
                <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Area Risk</Text>
                <View className="flex-row items-end">
                    <Text className="text-emerald-400 text-3xl font-black">LOW</Text>
                    <Text className="text-gray-600 text-[10px] font-bold ml-2 mb-1">STABLE</Text>
                </View>
                <View className="h-1.5 w-full bg-gray-800 rounded-full mt-3 overflow-hidden">
                    <View className="h-full w-1/4 bg-emerald-500" />
                </View>
            </View>

            <View className="w-[48%] bg-[#0D1321] border border-gray-800/60 rounded-3xl p-4">
                <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Network</Text>
                <View className="flex-row items-end">
                    <Text className="text-blue-400 text-3xl font-black">100%</Text>
                    <Ionicons name="wifi" size={14} color="#3B82F6" style={{ marginBottom: 4, marginLeft: 6 }} />
                </View>
                <Text className="text-gray-500 text-[9px] mt-2 font-mono uppercase">Status: Connected</Text>
            </View>
        </View>

        {/* HORIZONTAL NEURAL CORE */}
        <View className="mt-8">
          <View className="px-6 mb-4 flex-row justify-between items-end">
            <Text className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Safety Tools</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
            <TouchableOpacity onPress={() => navigation.navigate('Chatbot')} className="w-36 h-40 bg-[#0D1321] border border-gray-800/60 rounded-[30px] p-5 justify-between shadow-lg">
              <Ionicons name="hardware-chip" size={24} color="#10B981" />
              <View>
                <Text className="text-white font-black text-lg">Assistant</Text>
                <Text className="text-gray-600 text-[10px] font-bold">Ask AI</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Map')} className="w-36 h-40 bg-[#0D1321] border border-gray-800/60 rounded-[30px] p-5 justify-between shadow-lg">
              <Ionicons name="navigate-outline" size={24} color="#3B82F6" />
              <View>
                <Text className="text-white font-black text-lg">Live Map</Text>
                <Text className="text-gray-600 text-[10px] font-bold">Nearby Alerts</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('AIScanner')} className="w-36 h-40 bg-[#0D1321] border border-gray-800/60 rounded-[30px] p-5 justify-between shadow-lg">
              <Ionicons name="scan" size={24} color="#A855F7" />
              <View>
                <Text className="text-white font-black text-lg">Scanner</Text>
                <Text className="text-gray-600 text-[10px] font-bold">Scan Objects</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* OPERATIONS GRID */}
        <View className="mt-8 px-6">
          <Text className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-4">Features</Text>
          
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity onPress={() => navigation.navigate('SafeWalk')} className="w-[48%] bg-[#0D1321] border border-gray-800/60 rounded-[25px] p-5 mb-4 flex-row items-center">
              <Ionicons name="walk" size={18} color="#818CF8" />
              <Text className="text-white font-bold ml-3 text-xs uppercase tracking-widest">SafeWalk</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('IntelHub')} className="w-[48%] bg-[#0D1321] border border-gray-800/60 rounded-[25px] p-5 mb-4 flex-row items-center">
              <Ionicons name="people" size={18} color="#F472B6" />
              <Text className="text-white font-bold ml-3 text-xs uppercase tracking-widest">Community</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('MyReports')} className="w-[48%] bg-[#0D1321] border border-gray-800/60 rounded-[25px] p-5 mb-4 flex-row items-center">
              <Ionicons name="folder" size={18} color="#F59E0B" />
              <Text className="text-white font-bold ml-3 text-xs uppercase tracking-widest">My Reports</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('SafetyAdvisory')} className="w-[48%] bg-[#0D1321] border border-gray-800/60 rounded-[25px] p-5 mb-4 flex-row items-center">
              <Ionicons name="bulb" size={18} color="#10B981" />
              <Text className="text-white font-bold ml-3 text-xs uppercase tracking-widest">Advisory</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* STATUS BAR FOOTER */}
        <View className="mx-6 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex-row items-center">
            <View className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-3" />
            <Text className="text-emerald-500/60 font-mono text-[9px] uppercase tracking-[2px]">
                Secure Connection Active // User ID: {userData.operative_id}
            </Text>
        </View>
      </ScrollView>

      <SOSModal visible={showSOS} countdown={countdown} cancel={cancelSOS} />
    </View>
  );
}