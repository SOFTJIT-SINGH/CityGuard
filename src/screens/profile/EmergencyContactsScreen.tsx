import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function EmergencyContactsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      if (!user) return;
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      console.error('Fetch error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!newName || !newPhone) {
      Alert.alert('Validation Error', 'Please provide both name and phone number.');
      return;
    }

    setAdding(true);
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .insert([
          {
            user_id: user?.id,
            contact_name: newName,
            phone_number: newPhone,
            is_active: true
          }
        ]);

      if (error) throw error;

      setNewName('');
      setNewPhone('');
      fetchContacts();
      Alert.alert('Success', 'Emergency contact added securely.');
    } catch (error: any) {
      Alert.alert('Protocol Error', error.message);
    } finally {
      setAdding(false);
    }
  };

  const toggleContactStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchContacts();
    } catch (error: any) {
      Alert.alert('Update Error', error.message);
    }
  };

  const deleteContact = async (id: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to remove this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('emergency_contacts')
                .delete()
                .eq('id', id);
              if (error) throw error;
              fetchContacts();
            } catch (error: any) {
              Alert.alert('Delete Error', error.message);
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-950" style={{ paddingTop: insets.top }}>
      <View className="px-6 py-4 flex-row items-center border-b border-gray-900 bg-gray-950">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="chevron-back" size={24} color="#10B981" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-white tracking-tight">EMERGENCY CONTACTS</Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* ADD CONTACT SECTION */}
        <View className="mt-6 mb-8 bg-gray-900/50 p-5 rounded-3xl border border-gray-800">
          <Text className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-4">Add New Contact</Text>
          
          <View className="space-y-4">
            <TextInput 
              placeholder="Contact Name"
              value={newName}
              onChangeText={setNewName}
              placeholderTextColor="#4B5563"
              className="bg-gray-950 border border-gray-800 text-white p-4 rounded-2xl font-bold"
            />
            <TextInput 
              placeholder="Phone Number"
              value={newPhone}
              onChangeText={setNewPhone}
              placeholderTextColor="#4B5563"
              keyboardType="phone-pad"
              className="bg-gray-950 border border-gray-800 text-white p-4 rounded-2xl font-bold"
            />
            
            <TouchableOpacity 
              onPress={handleAddContact}
              disabled={adding}
              className="bg-emerald-600 p-4 rounded-2xl items-center flex-row justify-center shadow-lg"
            >
              {adding ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="person-add" size={18} color="white" className="mr-2" />
                  <Text className="text-white font-black uppercase tracking-widest text-sm">Add Operative</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-4 px-1">Your Trusted Circle</Text>

        {loading ? (
          <ActivityIndicator color="#10B981" className="mt-4" />
        ) : contacts.length === 0 ? (
          <View className="py-10 items-center border border-dashed border-gray-800 rounded-3xl">
            <Ionicons name="people-outline" size={48} color="#374151" />
            <Text className="text-gray-500 font-bold mt-4">No contacts added yet.</Text>
          </View>
        ) : (
          contacts.map((item) => (
            <View key={item.id} className="mb-4 bg-gray-900 border border-gray-800 rounded-3xl p-5 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white font-black text-lg tracking-tight">{item.contact_name}</Text>
                <Text className="text-gray-500 font-mono text-xs">{item.phone_number}</Text>
                
                <View className="flex-row items-center mt-2">
                   <View className={`h-2 w-2 rounded-full mr-2 ${item.is_active ? 'bg-emerald-500' : 'bg-gray-600'}`} />
                   <Text className={`text-[10px] font-black uppercase tracking-widest ${item.is_active ? 'text-emerald-500' : 'text-gray-600'}`}>
                     {item.is_active ? 'Active SMS' : 'Inactive'}
                   </Text>
                </View>
              </View>
              
              <View className="flex-row space-x-2 gap-2">
                <TouchableOpacity 
                  onPress={() => toggleContactStatus(item.id, item.is_active)}
                  className={`p-3 rounded-2xl border ${item.is_active ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-gray-700 bg-gray-800'}`}
                >
                  <Ionicons name={item.is_active ? "notifications" : "notifications-off"} size={18} color={item.is_active ? "#10B981" : "#6B7280"} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => deleteContact(item.id)}
                  className="p-3 rounded-2xl border border-red-500/30 bg-red-500/10"
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View className="mt-8 mb-10 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
           <Text className="text-blue-400/70 font-bold text-[10px] text-center leading-4">
             Note: These contacts will receive an SMS alert with your live location coordinates whenever the SOS protocol is triggered.
           </Text>
        </View>
      </ScrollView>
    </View>
  );
}
