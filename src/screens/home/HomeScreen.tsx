import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import SOSModal from '../../components/ui/SOSButton';
import { Audio } from 'expo-av';
import * as SMS from 'expo-sms';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [showSOS, setShowSOS] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);

  // 1. Dynamic User State
  const [userData, setUserData] = useState({
    full_name: 'Loading...',
    operative_id: 'PENDING',
  });

  // 2. Fetch Profile from Supabase on Load
  useFocusEffect(
    useCallback(() => {
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
              full_name: data.full_name || 'User',
              operative_id: data.operative_id || 'UNKNOWN',
            });
          }
        }
      };
      fetchProfile();
    }, [])
  );

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
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Error', 'No active user session found.');
        return;
      }

      // Fetch full profile info for the snapshot
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Store the alert in the database
      const { error } = await supabase.from('emergency_alerts').insert([
        {
          user_id: user.id,
          full_name: profile?.full_name || 'Unknown',
          phone_number: profile?.phone_number || 'N/A',
          email: user.email || 'N/A',
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          status: 'active'
        }
      ]);

      if (error) throw error;

      // Fetch emergency contacts to "send SMS"
      const { data: contacts } = await supabase
        .from('emergency_contacts')
        .select('contact_name, phone_number')
        .eq('user_id', user.id)
        .eq('is_active', true);

      console.log('SOS Dispatched at: ', loc.coords.latitude, loc.coords.longitude);
      
      let contactMsg = '';
      if (contacts && contacts.length > 0) {
        const phoneNumbers = contacts.map(c => c.phone_number);
        const isAvailable = await SMS.isAvailableAsync();
        
        if (isAvailable) {
          const message = `EMERGENCY SOS: ${profile?.full_name || 'A user'} is in danger! Location: https://www.google.com/maps/search/?api=1&query=${loc.coords.latitude},${loc.coords.longitude}`;
          
          const { result } = await SMS.sendSMSAsync(phoneNumbers, message);
          
          if (result === 'sent') {
            contactMsg = `\n\nSMS Alerts dispatched to ${contacts.length} contacts.`;
          } else {
            contactMsg = `\n\nSMS composer opened for ${contacts.length} contacts.`;
          }
        } else {
          contactMsg = `\n\nSMS service is not available on this device.`;
        }
        
        console.log('Notifying contacts:', contacts);
      }

      Alert.alert('SOS SENT', `Authorities have been notified of your location.${contactMsg}`);
    } catch (error: any) {
      console.error('SOS Error:', error.message);
      Alert.alert('Protocol Failure', 'Failed to dispatch SOS: ' + error.message);
    }
  };

  async function playAlarm() {
    try {
      if (isAlarmPlaying) {
        await sound?.stopAsync();
        setIsAlarmPlaying(false);
        return;
      }

      console.log('Loading Sound');
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('../../../assets/Sound/emergencyalarm.wav'), // Use the local asset
        { shouldPlay: true, isLooping: true, volume: 1.0 }
      );
      setSound(newSound);
      setIsAlarmPlaying(true);

      console.log('Playing Sound');
      await newSound.playAsync();
    } catch (error) {
      console.error("Error playing sound", error);
      Alert.alert("Error", "Could not play alarm sound.");
    }
  }

  useEffect(() => {
    return sound
      ? () => {
        console.log('Unloading Sound');
        sound.unloadAsync();
      }
      : undefined;
  }, [sound]);

  return (
    <View className="flex-1 bg-gray-950">
      <StatusBar style="light" />

      {/* TOP GLASS HEADER */}
      <View
        style={{ paddingTop: insets.top + 10 }}
        className="flex-row items-center justify-between border-b border-gray-800/50 bg-gray-900/80 px-6 pb-4 backdrop-blur-xl">
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
        {/* HERO SOS & BUZZ SECTION */}
        <View className="mt-6 px-6 space-y-4">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={triggerSOS}
            style={{
              shadowColor: '#EF4444',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10
            }}
            className="bg-[#1A0B0B] border border-red-900/40 rounded-[40px] p-6 flex-row items-center mb-4"
          >
            <View className="bg-red-600 h-16 w-16 rounded-full items-center justify-center border-4 border-red-400/30 shadow-lg">
              <MaterialCommunityIcons name="shield-alert" size={32} color="white" />
            </View>
            <View className="ml-5 flex-1">
              <Text className="text-white text-2xl font-black italic tracking-tighter">EMERGENCY SOS</Text>
              <Text className="text-red-500/80 text-[10px] font-bold uppercase tracking-widest">Tap to alert authorities</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={playAlarm}
            style={{
              shadowColor: isAlarmPlaying ? '#F59E0B' : '#6B7280',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10
            }}
            className={`${isAlarmPlaying ? 'bg-amber-900/30 border-amber-500' : 'bg-gray-900 border-gray-800'} border rounded-[40px] p-6 flex-row items-center`}
          >
            <View className={`${isAlarmPlaying ? 'bg-amber-500' : 'bg-gray-700'} h-16 w-16 rounded-full items-center justify-center border-4 ${isAlarmPlaying ? 'border-amber-300/30' : 'border-gray-500/30'} shadow-lg`}>
              <Ionicons name={isAlarmPlaying ? "volume-high" : "volume-mute"} size={32} color="white" />
            </View>
            <View className="ml-5 flex-1">
              <Text className="text-white text-2xl font-black italic tracking-tighter">{isAlarmPlaying ? 'STOP ALARM' : 'BUZZ ALARM'}</Text>
              <Text className={`${isAlarmPlaying ? 'text-amber-500' : 'text-gray-500'} text-[10px] font-bold uppercase tracking-widest`}>
                {isAlarmPlaying ? 'Sounding Extreme Alarm...' : 'Trigger loud deterrent sound'}
              </Text>
            </View>
            {isAlarmPlaying && <View className="h-4 w-4 rounded-full bg-amber-500 animate-pulse" />}
          </TouchableOpacity>
        </View>

        {/* PRIMARY ACTION: REPORT CRIME */}
        <View className="mt-6 px-6">
          <TouchableOpacity
            onPress={() => navigation.navigate('ReportCrime')}
            activeOpacity={0.8}
            className="bg-emerald-600/10 border border-emerald-500/30 rounded-[35px] p-5 flex-row items-center shadow-xl"
          >
            <View className="bg-emerald-500 h-14 w-14 rounded-2xl items-center justify-center border border-emerald-400">
              <Ionicons name="warning" size={28} color="white" />
            </View>
            <View className="ml-5 flex-1">
              <Text className="text-white text-xl font-black tracking-tight">REPORT INCIDENT</Text>
              <Text className="text-emerald-500/70 text-[10px] font-bold uppercase tracking-widest">Direct link to authorities</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#10B981" />
          </TouchableOpacity>
        </View>

        {/* SECONARY ACTIONS: POLICE & FEEDBACK */}
        <View className="mt-6 px-6 flex-row justify-between">
          <TouchableOpacity
            onPress={() => navigation.navigate('PoliceStations')}
            className="w-[48%] bg-gray-900 border border-blue-900/30 rounded-[30px] p-5"
          >
            <View className="bg-blue-500/10 h-10 w-10 rounded-xl items-center justify-center border border-blue-500/20 mb-3">
              <Ionicons name="location" size={20} color="#3B82F6" />
            </View>
            <Text className="text-white font-black tracking-tight">POLICE</Text>
            <Text className="text-gray-500 text-[9px] uppercase font-bold tracking-widest">Nearby Help</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Feedback')}
            className="w-[48%] bg-gray-900 border border-purple-900/30 rounded-[30px] p-5"
          >
            <View className="bg-purple-500/10 h-10 w-10 rounded-xl items-center justify-center border border-purple-500/20 mb-3">
              <Ionicons name="chatbubbles" size={20} color="#A855F7" />
            </View>
            <Text className="text-white font-black tracking-tight">FEEDBACK</Text>
            <Text className="text-gray-500 text-[9px] uppercase font-bold tracking-widest">Share Voice</Text>
          </TouchableOpacity>
        </View>

        {/* MORE CIVILIAN TOOLS */}
        <View className="mt-6 px-6 flex-row flex-wrap justify-between">
          <TouchableOpacity
            onPress={() => navigation.navigate('SafeWalk')}
            className="w-[48%] bg-gray-900 border border-red-900/30 rounded-[30px] p-5 mb-4"
          >
            <View className="bg-red-500/10 h-10 w-10 rounded-xl items-center justify-center border border-red-500/20 mb-3">
              <Ionicons name="walk" size={20} color="#EF4444" />
            </View>
            <Text className="text-white font-black tracking-tight">SAFEWALK</Text>
            <Text className="text-gray-500 text-[9px] uppercase font-bold tracking-widest">Escort Timer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('IntelHub')}
            className="w-[48%] bg-gray-900 border border-indigo-900/30 rounded-[30px] p-5 mb-4"
          >
            <View className="bg-indigo-500/10 h-10 w-10 rounded-xl items-center justify-center border border-indigo-500/20 mb-3">
              <Ionicons name="people" size={20} color="#818CF8" />
            </View>
            <Text className="text-white font-black tracking-tight">COMMUNITY</Text>
            <Text className="text-gray-500 text-[9px] uppercase font-bold tracking-widest">Intel Hub</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('SafetyAdvisory')}
            className="w-[48%] bg-gray-900 border border-amber-900/30 rounded-[30px] p-5 mb-4"
          >
            <View className="bg-amber-500/10 h-10 w-10 rounded-xl items-center justify-center border border-amber-500/20 mb-3">
              <Ionicons name="warning" size={20} color="#F59E0B" />
            </View>
            <Text className="text-white font-black tracking-tight">ADVISORY</Text>
            <Text className="text-gray-500 text-[9px] uppercase font-bold tracking-widest">Smart Alerts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('MyReports')}
            className="w-[48%] bg-gray-900 border border-emerald-900/30 rounded-[30px] p-5 mb-4"
          >
            <View className="bg-emerald-500/10 h-10 w-10 rounded-xl items-center justify-center border border-emerald-500/20 mb-3">
              <Ionicons name="folder-open" size={20} color="#10B981" />
            </View>
            <Text className="text-white font-black tracking-tight">MY REPORTS</Text>
            <Text className="text-gray-500 text-[9px] uppercase font-bold tracking-widest">Log History</Text>
          </TouchableOpacity>
        </View>

        {/* LIVE SAFETY WIDGETS */}
        <View className="mt-6 px-6 flex-row justify-between">
          <View className="w-[48%] bg-gray-900 border border-gray-800/60 rounded-3xl p-4">
            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Area Risk</Text>
            <View className="flex-row items-end">
              <Text className="text-emerald-400 text-3xl font-black">LOW</Text>
              <Text className="text-gray-600 text-[10px] font-bold ml-2 mb-1">STABLE</Text>
            </View>
            <View className="h-1.5 w-full bg-gray-800 rounded-full mt-3 overflow-hidden">
              <View className="h-full w-1/4 bg-emerald-500" />
            </View>
          </View>

          <View className="w-[48%] bg-gray-900 border border-gray-800/60 rounded-3xl p-4">
            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Network</Text>
            <View className="flex-row items-end">
              <Text className="text-blue-400 text-3xl font-black">100%</Text>
              <Ionicons name="wifi" size={14} color="#3B82F6" style={{ marginBottom: 4, marginLeft: 6 }} />
            </View>
            <Text className="text-gray-500 text-[9px] mt-2 font-mono uppercase">Status: Connected</Text>
          </View>
        </View>

        {/* HORIZONTAL TOOLS CORE */}
        <View className="mt-8">
          <View className="px-6 mb-4 flex-row justify-between items-end">
            <Text className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Safety Ecosystem</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
            <TouchableOpacity onPress={() => navigation.navigate('Chatbot')} className="w-36 h-40 bg-gray-900 border border-gray-800/60 rounded-[30px] p-5 justify-between shadow-lg">
              <Ionicons name="hardware-chip" size={24} color="#10B981" />
              <View>
                <Text className="text-white font-black text-lg">Assistant</Text>
                <Text className="text-gray-600 text-[10px] font-bold">Ask AI</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Map')} className="w-36 h-40 bg-gray-900 border border-gray-800/60 rounded-[30px] p-5 justify-between shadow-lg">
              <Ionicons name="navigate-outline" size={24} color="#3B82F6" />
              <View>
                <Text className="text-white font-black text-lg">Live Map</Text>
                <Text className="text-gray-600 text-[10px] font-bold">Nearby Alerts</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('AIScanner')} className="w-36 h-40 bg-gray-900 border border-gray-800/60 rounded-[30px] p-5 justify-between shadow-lg">
              <Ionicons name="scan" size={24} color="#A855F7" />
              <View>
                <Text className="text-white font-black text-lg">Scanner</Text>
                <Text className="text-gray-600 text-[10px] font-bold">Scan Objects</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* STATUS BAR FOOTER */}
        <View className="mx-6 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex-row items-center mt-8">
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
