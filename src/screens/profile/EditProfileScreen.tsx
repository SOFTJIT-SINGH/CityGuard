import React from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView className="flex-1 bg-gray-950" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView className="px-6" style={{ paddingTop: Math.max(insets.top, 20) + 12 }}>
        
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6 flex-row items-center">
          <Ionicons name="arrow-back" size={24} color="#10B981" />
          <Text className="text-emerald-500 font-bold ml-2 uppercase tracking-widest text-xs">Return</Text>
        </TouchableOpacity>

        <Text className="text-3xl font-black text-white tracking-tight mb-8">Edit Dossier</Text>

        <View className="space-y-4 mb-8">
          <View>
            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Operative Name</Text>
            <TextInput defaultValue="Agent Singh" className="bg-gray-900 border border-gray-800 text-white p-4 rounded-xl font-mono" />
          </View>
          
          <View className="mt-4">
            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Blood Type</Text>
            <TextInput defaultValue="O+" className="bg-gray-900 border border-gray-800 text-white p-4 rounded-xl font-mono" />
          </View>

          <View className="mt-4">
            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">I.C.E. Contact Number</Text>
            <TextInput defaultValue="+91 99887 76655" keyboardType="phone-pad" className="bg-gray-900 border border-gray-800 text-white p-4 rounded-xl font-mono" />
          </View>
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-emerald-600 p-4 rounded-xl items-center shadow-lg shadow-emerald-600/20 border border-emerald-500">
          <Text className="text-white font-black tracking-widest uppercase text-lg">Update Profile</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}