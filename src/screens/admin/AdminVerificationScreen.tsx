import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminVerificationScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const { data: vData, error: vError } = await supabase
        .from('verifications')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (vError) throw vError;

      if (vData && vData.length > 0) {
        const userIds = vData.map(v => v.user_id);
        const { data: pData, error: pError } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .in('id', userIds);

        if (pError) throw pError;

        // Combine data
        const combined = vData.map(v => ({
          ...v,
          profiles: pData?.find(p => p.id === v.user_id)
        }));

        setVerifications(combined);
      } else {
        setVerifications([]);
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, userId: string, status: 'verified' | 'rejected') => {
    try {
      setLoading(true);
      // Update verification status
      const { error: vError } = await supabase
        .from('verifications')
        .update({ status })
        .eq('id', id);

      if (vError) throw vError;

      // If verified, update user profile status
      if (status === 'verified') {
        const { error: pError } = await supabase
          .from('profiles')
          .update({ is_verified: true })
          .eq('id', userId);
        
        if (pError) console.error("Failed to update profile verification status:", pError);
      }
      
      Alert.alert("Success", `User verification has been ${status}`);
      fetchVerifications();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-gray-900 border border-gray-800 rounded-3xl p-5 mb-4">
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-white font-bold text-lg">{item.profiles?.full_name}</Text>
          <Text className="text-gray-500 text-xs">Submitted on {new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
        <Ionicons name="document-attach-outline" size={24} color="#10B981" />
      </View>

      <TouchableOpacity 
        onPress={() => setSelectedImage(item.document_url)}
        className="w-full h-40 bg-gray-950 rounded-2xl mb-4 overflow-hidden border border-gray-800"
      >
        <Image source={{ uri: item.document_url }} className="w-full h-full" resizeMode="cover" />
        <View className="absolute bottom-2 right-2 bg-black/60 p-1 rounded-lg">
          <Ionicons name="expand" size={16} color="white" />
        </View>
      </TouchableOpacity>

      <View className="flex-row space-x-3">
        <TouchableOpacity 
          onPress={() => handleAction(item.id, item.user_id, 'verified')}
          className="flex-1 bg-emerald-600/20 border border-emerald-500/30 p-3 rounded-xl flex-row justify-center items-center"
        >
          <Ionicons name="checkmark-circle" size={18} color="#10B981" />
          <Text className="text-emerald-500 font-bold ml-2">Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleAction(item.id, item.user_id, 'rejected')}
          className="flex-1 bg-red-600/20 border border-red-500/30 p-3 rounded-xl flex-row justify-center items-center"
        >
          <Ionicons name="close-circle" size={18} color="#EF4444" />
          <Text className="text-red-500 font-bold ml-2">Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-950" style={{ paddingTop: insets.top }}>
      <View className="px-6 py-4 flex-row items-center border-b border-gray-900">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Pending Verifications</Text>
      </View>

      {loading && verifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#10B981" />
        </View>
      ) : (
        <FlatList
          data={verifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Ionicons name="shield-outline" size={48} color="#374151" />
              <Text className="text-gray-500 font-bold mt-4">No pending verifications</Text>
            </View>
          }
        />
      )}

      <Modal visible={!!selectedImage} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/90 items-center justify-center p-6">
          <TouchableOpacity 
            className="absolute top-12 right-6 z-10 bg-gray-800 p-2 rounded-full"
            onPress={() => setSelectedImage(null)}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} className="w-full h-3/4 rounded-3xl" resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
}
