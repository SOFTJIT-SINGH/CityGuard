import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  // Mock User Data (We will fetch this from Supabase tomorrow)
  const userData = {
    name: "Softjit Singh",
    phone: "+91 8528473685",
    emergencyContact: "+91 99887 76655",
    bloodGroup: "A+",
  };

  return (
    <ScrollView className="flex-1 bg-slate-50">
      {/* Header / Profile Info */}
      <View className="bg-green-600 px-6 pt-16 pb-8 rounded-b-[40px] items-center shadow-lg">
        <View className="bg-white p-1 rounded-full mb-4">
          <Image 
            source={{ uri: 'https://ui-avatars.com/api/?name=Aarav+Singh&background=E5E7EB&color=374151&size=128' }} 
            className="w-24 h-24 rounded-full"
          />
        </View>
        <Text className="text-white text-3xl font-black">{userData.name}</Text>
        <Text className="text-green-100 text-base font-medium mt-1">{userData.phone}</Text>
      </View>

      {/* Emergency Info Card */}
      <View className="px-6 -mt-6">
        <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-row justify-between items-center">
          <View>
            <Text className="text-gray-500 text-sm font-bold uppercase mb-1">Blood Group</Text>
            <Text className="text-red-500 text-2xl font-black">{userData.bloodGroup}</Text>
          </View>
          <View className="h-12 w-[1px] bg-gray-200"></View>
          <View>
            <Text className="text-gray-500 text-sm font-bold uppercase mb-1">Emergency Contact</Text>
            <Text className="text-gray-900 text-lg font-bold">{userData.emergencyContact}</Text>
          </View>
        </View>
      </View>

      {/* Settings Options */}
      <View className="px-6 mt-8 space-y-4 mb-10">
        <Text className="text-lg font-bold text-gray-900 mb-2">Account Settings</Text>

        <TouchableOpacity className="bg-white p-4 rounded-2xl flex-row items-center justify-between border border-gray-100 mb-3">
          <View className="flex-row items-center">
            <View className="bg-blue-50 p-3 rounded-full mr-4">
              <Ionicons name="person-outline" size={24} color="#3B82F6" />
            </View>
            <Text className="text-gray-800 text-base font-semibold">Edit Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity className="bg-white p-4 rounded-2xl flex-row items-center justify-between border border-gray-100 mb-3">
          <View className="flex-row items-center">
            <View className="bg-orange-50 p-3 rounded-full mr-4">
              <Ionicons name="notifications-outline" size={24} color="#F97316" />
            </View>
            <Text className="text-gray-800 text-base font-semibold">Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity className="bg-white p-4 rounded-2xl flex-row items-center justify-between border border-gray-100 mb-8">
          <View className="flex-row items-center">
            <View className="bg-purple-50 p-3 rounded-full mr-4">
              <Ionicons name="shield-checkmark-outline" size={24} color="#8B5CF6" />
            </View>
            <Text className="text-gray-800 text-base font-semibold">Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity className="bg-red-50 p-4 rounded-2xl flex-row items-center justify-center border border-red-100">
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text className="text-red-500 text-lg font-bold ml-2">Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}