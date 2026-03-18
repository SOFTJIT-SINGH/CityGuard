import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BroadcastOverrideScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [zone, setZone] = useState('ALL CITY');

  const triggerOverride = () => {
    if (!message) return Alert.alert("Error", "Message payload cannot be empty.");
    Alert.alert(
      "CONFIRM OVERRIDE", 
      `Are you sure you want to broadcast this to ${zone}? This will bypass user silent modes.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "TRANSMIT", style: "destructive", onPress: () => {
          Alert.alert("BROADCAST SENT", "Emergency alert has been transmitted to all devices in the target zone.");
          setMessage('');
        }}
      ]
    );
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-gray-950" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView className="flex-1" style={{ paddingTop: Math.max(insets.top, 20) + 12 }}>
        
        <View className="px-6 mb-8 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.openDrawer()} className="mr-4 bg-gray-900 p-2 rounded-full border border-gray-800">
              <Ionicons name="menu" size={24} color="#D1D5DB" />
            </TouchableOpacity>
            <View className="bg-red-500/10 p-2 rounded-xl mr-3 border border-red-500/20">
              <Ionicons name="warning" size={24} color="#EF4444" />
            </View>
            <Text className="text-2xl font-black text-white tracking-tight">E.B.O. System</Text>
          </View>
        </View>

        <View className="px-6 mb-6">
          <Text className="text-red-500 font-bold uppercase tracking-widest text-xs mb-2">Warning: Level 5 Access</Text>
          <Text className="text-gray-400 text-sm leading-relaxed mb-6">
            Emergency Broadcast Override. Transmissions sent from this terminal will bypass civilian device restrictions and trigger an immediate alarm.
          </Text>

          <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Target Zone</Text>
          <View className="flex-row justify-between mb-6">
            {['ALL CITY', 'SECTOR 4', 'MALL ROAD'].map((z) => (
              <TouchableOpacity key={z} onPress={() => setZone(z)} className={`p-3 rounded-xl border ${zone === z ? 'bg-red-600/20 border-red-500/50' : 'bg-gray-900 border-gray-800'} w-[31%] items-center`}>
                <Text className={`text-xs font-bold ${zone === z ? 'text-red-400' : 'text-gray-500'}`}>{z}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Override Payload (Message)</Text>
          <TextInput 
            multiline 
            numberOfLines={5} 
            value={message} 
            onChangeText={setMessage} 
            placeholder="Type emergency alert here..." 
            placeholderTextColor="#4B5563"
            className="bg-gray-900 border border-red-900/50 text-white p-4 rounded-2xl h-40 align-top font-mono mb-8" 
          />

          <TouchableOpacity onPress={triggerOverride} className="bg-red-600 p-5 rounded-2xl items-center shadow-lg shadow-red-600/40 border border-red-500">
            <Text className="text-white font-black tracking-widest uppercase text-xl">Transmit Override</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}