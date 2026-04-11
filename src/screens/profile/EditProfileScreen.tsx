import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

export default function EditProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  
  const [fullName, setFullName] = useState('');
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
          .select('full_name, blood_type, ice_contact')
          .eq('id', user.id)
          .single();

        if (data) {
          setFullName(data.full_name || '');
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
      Alert.alert('Validation Error', 'Operative Name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in.');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          blood_type: bloodType,
          ice_contact: iceContact,
          updated_at: new Date()
        })
        .eq('id', user.id);

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Update Failed', error.message);
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
    <KeyboardAvoidingView className="flex-1 bg-gray-950" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView className="px-6" style={{ paddingTop: Math.max(insets.top, 20) + 12 }}>
        
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6 flex-row items-center">
          <Ionicons name="arrow-back" size={24} color="#10B981" />
          <Text className="text-emerald-500 font-bold ml-2 uppercase tracking-widest text-xs">Return</Text>
        </TouchableOpacity>

        <Text className="text-3xl font-black text-white tracking-tight mb-8">Edit Dossier</Text>

        <View className="space-y-4 mb-8">
          <View>
            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Operative Name</Text>
            <TextInput 
              value={fullName}
              onChangeText={setFullName}
              className="bg-gray-900 border border-gray-800 text-white p-4 rounded-xl font-mono" 
            />
          </View>
          
          <View className="mt-4">
            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Blood Type</Text>
            <TextInput 
              value={bloodType}
              onChangeText={setBloodType}
              className="bg-gray-900 border border-gray-800 text-white p-4 rounded-xl font-mono" 
            />
          </View>

          <View className="mt-4">
            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">I.C.E. Contact Number</Text>
            <TextInput 
              value={iceContact}
              onChangeText={setIceContact}
              keyboardType="phone-pad" 
              className="bg-gray-900 border border-gray-800 text-white p-4 rounded-xl font-mono" 
            />
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleUpdate} 
          disabled={saving}
          className="bg-emerald-600 p-4 rounded-xl items-center shadow-lg shadow-emerald-600/20 border border-emerald-500"
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
             <Text className="text-white font-black tracking-widest uppercase text-lg">Update Profile</Text>
          )}
        </TouchableOpacity>
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}