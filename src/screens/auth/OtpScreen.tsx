import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../../lib/supabase';

export default function OtpScreen({ route, navigation }: any) {
  const { expectedOtp, userData } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show the mock OTP for the college project demonstration
    Alert.alert(
      "College Project OTP", 
      `For testing purposes, your OTP is: ${expectedOtp}\n\n(This bypasses backend limits for easier testing)`
    );
  }, []);

  const handleVerify = async () => {
    if (otp !== expectedOtp) {
      Alert.alert("Error", "Invalid OTP. Please try again.");
      return;
    }

    setLoading(true);
    
    // Actually register the user with Supabase now that OTP is "verified"
    const { data: authData, error: authError } = await supabase.auth.signUp({ 
      email: userData.email, 
      password: userData.password 
    });

    if (authError) {
      Alert.alert("Signup Failed", authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // Use upsert to prevent errors if the user clicked too many times or if a trigger already created a profile
      const { error: profileError } = await supabase.from('profiles').upsert([
        {
          id: authData.user.id,
          full_name: userData.name,
          phone_number: userData.phoneNumber,
          blood_type: userData.bloodGroup,
          ice_contact: userData.iceContact,
          operative_id: `OP-${Math.floor(100000 + Math.random() * 900000)}`, // Longer unique ID
          role: 'civilian'
        }
      ], { onConflict: 'id' });

      if (profileError) {
        console.error("Profile insertion error:", profileError);
        // Reduce the "strictness" of the error - don't block the user if the profile table is being difficult
        Alert.alert(
          "Profile Notice", 
          "Signup successful! However, there was an issue saving your profile details: " + profileError.message + "\n\nYou can update these in your settings later."
        );
      } else {
        // Will auto redirect via AuthContext since they're logged in
        Alert.alert("Success", "Verification complete! Account and profile created.");
      }
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-gray-950 justify-center px-6" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="light" />
      
      <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-16 left-6 z-10">
          <Ionicons name="arrow-back" size={28} color="#10B981" />
      </TouchableOpacity>

      <View className="items-center mb-10">
        <View className="bg-emerald-500/10 p-4 rounded-full border-2 border-emerald-500/30 mb-4">
          <Ionicons name="keypad" size={64} color="#10B981" />
        </View>
        <Text className="text-4xl font-black text-white tracking-tighter text-center">Verify Email</Text>
        <Text className="text-gray-400 text-sm font-bold mt-2 text-center">
          Enter the verification code sent to {userData.email}
        </Text>
      </View>

      <View className="space-y-4 w-full">
        <View className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 flex-row items-center mb-8 focus:border-emerald-500">
          <Ionicons name="lock-closed" size={20} color="#6B7280" className="mr-3" />
          <TextInput 
            className="flex-1 text-center text-white font-mono text-2xl tracking-[12px]" 
            placeholder="0000" 
            placeholderTextColor="#6B7280"
            keyboardType="number-pad"
            maxLength={4}
            value={otp}
            onChangeText={setOtp}
          />
        </View>

        <TouchableOpacity 
          className="bg-emerald-600 py-4 rounded-2xl items-center shadow-lg shadow-emerald-600/30 border border-emerald-500"
          disabled={loading || otp.length !== 4}
          onPress={handleVerify} 
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-black tracking-widest uppercase text-lg">Verify OTP</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
