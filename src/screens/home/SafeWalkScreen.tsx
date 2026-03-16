import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SafeWalkScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds

  // Timer Countdown Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      Alert.alert("PROTOCOL BREACH", "Timer expired. SOS dispatched to authorities.");
      setTimeLeft(900); // Reset
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleProtocol = () => {
    if (isActive) {
      Alert.prompt("Disarm Protocol", "Enter your 4-digit security PIN to cancel.", [
        { text: "Cancel", style: "cancel" },
        { text: "Disarm", onPress: () => { setIsActive(false); setTimeLeft(900); } }
      ], 'secure-text');
    } else {
      setIsActive(true);
    }
  };

  return (
    <View className="flex-1 bg-gray-950" style={{ paddingTop: Math.max(insets.top, 20) + 12 }}>
      
      {/* Header */}
      <View className="px-6 mb-8 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.openDrawer()} className="mr-4 bg-gray-900 p-2 rounded-full border border-gray-800 shadow-sm">
            <Ionicons name="menu" size={24} color="#D1D5DB" />
          </TouchableOpacity>
          <View className="bg-blue-500/10 p-2 rounded-xl mr-3 border border-blue-500/20">
            <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
          </View>
          <Text className="text-2xl font-black text-white tracking-tight">SafeWalk</Text>
        </View>
      </View>

      <ScrollView className="px-6 flex-1">
        <Text className="text-gray-400 text-sm mb-10 leading-relaxed text-center">
          Activate Active Escort Protocol. If the timer expires before disarming, your live GPS coordinates will be instantly transmitted to local dispatch.
        </Text>

        {/* Massive Timer Display */}
        <View className="items-center justify-center mb-12">
          <View className={`h-64 w-64 rounded-full border-4 items-center justify-center ${isActive ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/40' : 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'}`}>
            <Text className={`text-6xl font-black font-mono tracking-tighter ${isActive ? 'text-red-500' : 'text-emerald-400'}`}>
              {formatTime(timeLeft)}
            </Text>
            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">
              {isActive ? 'Protocol Engaged' : 'Standby Mode'}
            </Text>
          </View>
        </View>

        {/* Quick Time Adders */}
        {!isActive && (
          <View className="flex-row justify-between mb-10">
            {[5, 15, 30].map((mins) => (
              <TouchableOpacity key={mins} onPress={() => setTimeLeft(mins * 60)} className="bg-gray-900 border border-gray-800 p-4 rounded-2xl w-[30%] items-center">
                <Text className="text-white font-black text-lg">{mins}m</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity 
          onPress={toggleProtocol} 
          className={`p-5 rounded-2xl items-center shadow-lg ${isActive ? 'bg-gray-800 border border-gray-700' : 'bg-blue-600 border border-blue-500 shadow-blue-600/30'}`}
        >
          <Text className={`font-black tracking-widest uppercase text-lg ${isActive ? 'text-white' : 'text-white'}`}>
            {isActive ? 'Disarm Protocol (Requires PIN)' : 'Engage Escort Timer'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}