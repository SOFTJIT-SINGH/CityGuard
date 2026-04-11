import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../../lib/supabase';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and Password are required.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      Alert.alert("Login Failed", error.message);
    }
    // AuthContext will automatically redirect on success
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-gray-950 justify-center px-6" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="light" />
      
      <View className="items-center mb-10">
        <View className="bg-emerald-500/10 p-4 rounded-full border-2 border-emerald-500/30 mb-4">
          <Ionicons name="shield-half" size={64} color="#10B981" />
        </View>
        <Text className="text-4xl font-black text-white tracking-tighter">CityGuard</Text>
        <Text className="text-emerald-500 text-xs font-mono tracking-widest uppercase mt-2">Welcome Back</Text>
      </View>

      <View className="space-y-4 w-full">
        <View className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 flex-row items-center mb-4 focus:border-emerald-500">
          <Ionicons name="mail" size={20} color="#6B7280" className="mr-3" />
          <TextInput 
            className="flex-1 text-white font-mono ml-3" 
            placeholder="Email Address" 
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
            placeholder="Password" 
            placeholderTextColor="#6B7280"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity 
          className="bg-emerald-600 py-4 rounded-2xl items-center shadow-lg shadow-emerald-600/30 border border-emerald-500"
          disabled={loading}
          onPress={handleLogin} 
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-black tracking-widest uppercase text-lg">Log In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} className="mt-6 p-2">
          <Text className="text-gray-400 text-center text-sm font-bold">
            Don&apos;t have an account? <Text className="text-emerald-400 underline">Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}