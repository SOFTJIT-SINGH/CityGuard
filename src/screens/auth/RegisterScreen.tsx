import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <KeyboardAvoidingView className="flex-1 bg-gray-950" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingTop: insets.top }}>
        
        <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-12 left-6 z-10">
            <Ionicons name="arrow-back" size={28} color="#10B981" />
        </TouchableOpacity>

        <View className="mb-10 mt-12">
          <Text className="text-4xl font-black text-white tracking-tighter">ENLIST</Text>
          <Text className="text-gray-400 text-sm font-bold mt-2">Join the CityGuard civilian defense network.</Text>
        </View>

        <View className="w-full">
          <View className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 flex-row items-center mb-4">
            <Ionicons name="person" size={20} color="#6B7280" />
            <TextInput className="flex-1 text-white font-mono ml-3" placeholder="FULL NAME" placeholderTextColor="#6B7280" value={name} onChangeText={setName} />
          </View>

          <View className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 flex-row items-center mb-4">
            <Ionicons name="mail" size={20} color="#6B7280" />
            <TextInput className="flex-1 text-white font-mono ml-3" placeholder="EMAIL ADDRESS" placeholderTextColor="#6B7280" autoCapitalize="none" value={email} onChangeText={setEmail} />
          </View>

          <View className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 flex-row items-center mb-8">
            <Ionicons name="finger-print" size={20} color="#6B7280" />
            <TextInput className="flex-1 text-white font-mono ml-3" placeholder="CREATE PASSCODE" placeholderTextColor="#6B7280" secureTextEntry value={password} onChangeText={setPassword} />
          </View>

          <TouchableOpacity className="bg-emerald-600 py-4 rounded-2xl items-center shadow-lg shadow-emerald-600/30 border border-emerald-500">
            <Text className="text-white font-black tracking-widest uppercase text-lg">Request Clearance</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}