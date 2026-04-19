import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

export default function RegisterScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [iceContact, setIceContact] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Reduced strictness for easier testing/demonstration
    if (!email || !password) {
      Alert.alert("Error", "Email and Password are required at minimum.");
      return;
    }

    if (!name || !phoneNumber) {
      Alert.alert("Note", "Please provide a Name and Phone Number for your operative profile.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    // Wait! Generate a mock 4-digit OTP for the college project demonstration
    const mockOtp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Navigate to the OTP verification screen
    navigation.navigate('Otp', {
      expectedOtp: mockOtp,
      userData: {
        name,
        email,
        password,
        phoneNumber,
        bloodGroup,
        iceContact
      }
    });
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-gray-950" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="light" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: Math.max(insets.top, 48), paddingBottom: 40 }}>
        
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6">
            <Ionicons name="arrow-back" size={28} color="#10B981" />
        </TouchableOpacity>

        <View className="mb-10">
          <Text className="text-4xl font-black text-white tracking-tighter">Sign up</Text>
          <Text className="text-gray-400 text-sm font-bold mt-2">Create an account to help keep our city safe.</Text>
        </View>

        <View className="w-full space-y-4">
          <View className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 flex-row items-center mb-4">
            <Ionicons name="person" size={20} color="#6B7280" />
            <TextInput className="flex-1 text-white font-mono ml-3" placeholder="Full Name" placeholderTextColor="#6B7280" value={name} onChangeText={setName} />
          </View>

          <View className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 flex-row items-center mb-4">
            <Ionicons name="call" size={20} color="#6B7280" />
            <TextInput className="flex-1 text-white font-mono ml-3" placeholder="Phone Number" placeholderTextColor="#6B7280" keyboardType="phone-pad" value={phoneNumber} onChangeText={setPhoneNumber} />
          </View>

          <View className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 flex-row items-center mb-4">
            <Ionicons name="mail" size={20} color="#6B7280" />
            <TextInput className="flex-1 text-white font-mono ml-3" placeholder="Email Address" placeholderTextColor="#6B7280" autoCapitalize="none" value={email} onChangeText={setEmail} />
          </View>

          <View className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 flex-row items-center mb-4">
            <Ionicons name="finger-print" size={20} color="#6B7280" />
            <TextInput className="flex-1 text-white font-mono ml-3" placeholder="Create Password" placeholderTextColor="#6B7280" secureTextEntry value={password} onChangeText={setPassword} />
          </View>
          
          <View className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 flex-row items-center mb-4">
            <Ionicons name="shield-checkmark" size={20} color="#6B7280" />
            <TextInput className="flex-1 text-white font-mono ml-3" placeholder="Confirm Password" placeholderTextColor="#6B7280" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
          </View>

          <View className="flex-row justify-between mb-8">
            <View className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 flex-row items-center w-[48%]">
              <Ionicons name="water" size={20} color="#6B7280" />
              <TextInput className="flex-1 text-white font-mono ml-2 text-xs" placeholder="Blood (Opt)" placeholderTextColor="#6B7280" value={bloodGroup} onChangeText={setBloodGroup} />
            </View>
            <View className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 flex-row items-center w-[48%]">
              <Ionicons name="warning" size={20} color="#6B7280" />
              <TextInput className="flex-1 text-white font-mono ml-2 text-xs" placeholder="Emergency Contact (Opt)" placeholderTextColor="#6B7280" keyboardType="phone-pad" value={iceContact} onChangeText={setIceContact} />
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleRegister} 
            disabled={loading}
            className="bg-emerald-600 py-4 rounded-2xl items-center shadow-lg shadow-emerald-600/30 border border-emerald-500"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-black tracking-widest uppercase text-lg">Sign Up</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}