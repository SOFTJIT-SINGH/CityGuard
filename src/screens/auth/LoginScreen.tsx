import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <KeyboardAvoidingView className="flex-1 bg-gray-950 justify-center px-6" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="light" />
      
      <View className="items-center mb-10">
        <View className="bg-emerald-500/10 p-4 rounded-full border-2 border-emerald-500/30 mb-4">
          <Ionicons name="shield-half" size={64} color="#10B981" />
        </View>
        <Text className="text-4xl font-black text-white tracking-tighter">CITYGUARD</Text>
        <Text className="text-emerald-500 text-xs font-mono tracking-[0.3em] uppercase mt-2">Authorized Access Only</Text>
      </View>

      <View className="space-y-4 w-full">
        <View className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 flex-row items-center mb-4 focus:border-emerald-500">
          <Ionicons name="mail" size={20} color="#6B7280" className="mr-3" />
          <TextInput 
            className="flex-1 text-white font-mono ml-3" 
            placeholder="OPERATIVE EMAIL" 
            placeholderTextColor="#6B7280"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        <View className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 flex-row items-center mb-8 focus:border-emerald-500">
          <Ionicons name="lock-closed" size={20} color="#6B7280" className="mr-3" />
          <TextInput 
            className="flex-1 text-white font-mono ml-3" 
            placeholder="PASSCODE" 
            placeholderTextColor="#6B7280"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity 
          className="bg-emerald-600 py-4 rounded-2xl items-center shadow-lg shadow-emerald-600/30 border border-emerald-500"
          // We will hook this up to Supabase tomorrow
          onPress={() => console.log('Login pressed')} 
        >
          <Text className="text-white font-black tracking-widest uppercase text-lg">Initialize Session</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} className="mt-6 p-2">
          <Text className="text-gray-400 text-center text-sm font-bold">
            No clearance? <Text className="text-emerald-400 underline">Request Access</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}