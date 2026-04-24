import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VerificationScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [docImage, setDocImage] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('verifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) setVerificationStatus(data);
    } catch (error) {
      console.log("No existing verification found");
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setDocImage(result.assets[0].uri);
    }
  };

  const submitVerification = async () => {
    if (!docImage) {
      Alert.alert("Error", "Please select a document image first.");
      return;
    }

    setLoading(true);
    try {
      // Upload to images bucket
      const fileName = `verifications/${user?.id}/${Date.now()}.jpg`;
      const formData = new FormData();
      formData.append('file', {
        uri: docImage,
        name: fileName,
        type: 'image/jpeg',
      } as any);

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, formData, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('verifications').insert([{
        user_id: user?.id,
        document_url: publicUrl,
        status: 'pending',
      }]);

      if (dbError) throw dbError;

      Alert.alert("Success", "Verification document submitted successfully. Our team will review it soon.");
      fetchVerificationStatus();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-950" style={{ paddingTop: insets.top }}>
      <View className="px-6 py-4 flex-row items-center border-b border-gray-900">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">ID Verification</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="bg-gray-900 border border-gray-800 rounded-3xl p-6 mb-6">
          <Text className="text-emerald-500 font-bold text-xs uppercase tracking-widest mb-2">Security Protocol</Text>
          <Text className="text-white text-base mb-4">To ensure community safety, all operatives must verify their identity. Please upload a clear photo of your Government ID.</Text>
          
          {verificationStatus && (
            <View className={`p-4 rounded-2xl mb-4 flex-row items-center ${
              verificationStatus.status === 'pending' ? 'bg-amber-500/10 border border-amber-500/30' :
              verificationStatus.status === 'verified' ? 'bg-emerald-500/10 border border-emerald-500/30' :
              'bg-red-500/10 border border-red-500/30'
            }`}>
              <Ionicons 
                name={verificationStatus.status === 'pending' ? "time" : verificationStatus.status === 'verified' ? "checkmark-circle" : "close-circle"} 
                size={20} 
                color={verificationStatus.status === 'pending' ? "#F59E0B" : verificationStatus.status === 'verified' ? "#10B981" : "#EF4444"} 
              />
              <Text className={`ml-2 font-bold uppercase text-xs ${
                verificationStatus.status === 'pending' ? 'text-amber-500' :
                verificationStatus.status === 'verified' ? 'text-emerald-500' :
                'text-red-500'
              }`}>
                Status: {verificationStatus.status}
              </Text>
            </View>
          )}

          <TouchableOpacity 
            onPress={pickImage}
            className="w-full h-48 border-2 border-dashed border-gray-700 rounded-3xl items-center justify-center bg-gray-950 overflow-hidden"
          >
            {docImage ? (
              <Image source={{ uri: docImage }} className="w-full h-full" />
            ) : (
              <>
                <Ionicons name="cloud-upload" size={48} color="#4B5563" />
                <Text className="text-gray-500 font-bold mt-2">Tap to Select Document</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={submitVerification}
          disabled={loading || verificationStatus?.status === 'pending' || verificationStatus?.status === 'verified'}
          className={`p-4 rounded-2xl flex-row justify-center items-center ${
            loading || verificationStatus?.status === 'pending' || verificationStatus?.status === 'verified' ? 'bg-gray-800' : 'bg-emerald-600 shadow-lg shadow-emerald-600/20'
          }`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="shield-checkmark" size={20} color="white" />
              <Text className="text-white font-black uppercase tracking-widest ml-2">Submit for Review</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
