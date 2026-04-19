import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

export default function EditProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [iceContact, setIceContact] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, phone_number, blood_type, ice_contact')
          .eq('id', user.id)
          .single();

        if (data) {
          setFullName(data.full_name || '');
          setPhoneNumber(data.phone_number || '');
          setBloodType(data.blood_type || '');
          setIceContact(data.ice_contact || '');
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!fullName) {
      Alert.alert('Validation Error', 'Full Name is required for operative security.');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No active operative session found.');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone_number: phoneNumber,
          blood_type: bloodType,
          ice_contact: iceContact,
          updated_at: new Date()
        })
        .eq('id', user.id);

      if (error) throw error;

      Alert.alert('Success', 'Profile credentials updated securely.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Protocol Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center">
        <ActivityIndicator color="#10B981" size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-gray-950" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        className="px-6" 
        style={{ paddingTop: Math.max(insets.top, 20) + 12 }}
        keyboardShouldPersistTaps="handled"
      >
        
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          className="mb-8 flex-row items-center bg-gray-900 self-start px-4 py-2 rounded-full border border-gray-800"
        >
          <Ionicons name="chevron-back" size={20} color="#10B981" />
          <Text className="text-emerald-500 font-black ml-1 uppercase tracking-tighter text-xs">Back</Text>
        </TouchableOpacity>

        <View className="mb-8">
           <Text className="text-4xl font-black text-white tracking-widest uppercase">Edit Profile</Text>
           <Text className="text-emerald-400 font-light tracking-[8px] uppercase text-[10px] -mt-1">Update your details</Text>
        </View>

        <View className="space-y-6 mb-12">
          {/* Full Name */}
          <View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="person-outline" size={12} color="#6B7280" />
              <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-2">Full Name</Text>
            </View>
            <TextInput 
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full Name"
              placeholderTextColor="#374151"
              className="bg-gray-900 border border-gray-800 text-white p-4 rounded-2xl font-mono text-base" 
            />
          </View>

          {/* Primary Phone */}
          <View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="call-outline" size={12} color="#6B7280" />
              <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-2">Phone Number</Text>
            </View>
            <TextInput 
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Phone Number"
              placeholderTextColor="#374151"
              keyboardType="phone-pad"
              className="bg-gray-900 border border-gray-800 text-white p-4 rounded-2xl font-mono text-base" 
            />
          </View>
          
          {/* Blood Type */}
          <View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="water-outline" size={12} color="#6B7280" />
              <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-2">Blood Type</Text>
            </View>
            <TextInput 
              value={bloodType}
              onChangeText={setBloodType}
              placeholder="A+, O-, etc"
              placeholderTextColor="#374151"
              className="bg-gray-900 border border-gray-800 text-white p-4 rounded-2xl font-mono text-base" 
            />
          </View>

          {/* ICE Contact */}
          <View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="warning-outline" size={12} color="#6B7280" />
              <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-2">Emergency Contact</Text>
            </View>
            <TextInput 
              value={iceContact}
              onChangeText={setIceContact}
              placeholder="Emergency Contact"
              placeholderTextColor="#374151"
              keyboardType="phone-pad" 
              className="bg-gray-900 border border-gray-800 text-white p-4 rounded-2xl font-mono text-base" 
            />
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleUpdate} 
          disabled={saving}
          className="bg-emerald-600 mb-12 p-5 rounded-2xl items-center shadow-2xl shadow-emerald-600/40 border border-emerald-500"
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
             <Text className="text-white font-black tracking-[4px] uppercase text-lg">Save Changes</Text>
          )}
        </TouchableOpacity>
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}