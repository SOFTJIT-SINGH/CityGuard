import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../../lib/supabase';

export default function OtpScreen({ route, navigation }: any) {
  const { email } = route.params;
  const userData = route.params?.userDataString ? JSON.parse(route.params.userDataString) : route.params?.userData;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.length < 4) {
      Alert.alert("Error", "Please enter the full verification code.");
      return;
    }

    setLoading(true);
    
    // Use Supabase verifyOtp for real email verification
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: 'signup'
    });

    if (verifyError) {
      Alert.alert("Verification Failed", verifyError.message);
      setLoading(false);
      return;
    }

    // Now that the user is verified and logged in, create the profile
    if (verifyData.user) {
      // Use upsert to prevent errors if the user clicked too many times or if a trigger already created a profile
      const { error: profileError } = await supabase.from('profiles').upsert([
        {
          id: verifyData.user.id,
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
        Alert.alert(
          "Profile Notice", 
          "Email verified! However, there was an issue saving your profile details: " + profileError.message
        );
      } else {
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
        <View className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4 flex-row items-center mb-8 focus:border-emerald-500">
          <Ionicons name="lock-closed" size={20} color="#10B981" />
          <TextInput 
            className="flex-1 text-center text-white font-mono text-3xl tracking-[10px]" 
            placeholder="000000" 
            placeholderTextColor="#374151"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />
        </View>

        <TouchableOpacity 
          className="bg-emerald-600 py-4 rounded-2xl items-center shadow-lg shadow-emerald-600/30 border border-emerald-500"
          disabled={loading || otp.length < 6}
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
