import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FeedbackScreen({ navigation }: any) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [feedback, setFeedback] = useState('');
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedbackList(data || []);
    } catch (error: any) {
      console.error('Error fetching feedback:', error.message);
    } finally {
      setFetching(false);
    }
  };

  const submitFeedback = async () => {
    if (!feedback.trim()) {
      Alert.alert('Error', 'Please enter some feedback.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('feedback').insert([
        {
          user_id: user?.id,
          content: feedback,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      Alert.alert('Success', 'Thank you for your feedback!');
      setFeedback('');
      fetchFeedback();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to submit feedback: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-gray-900 border border-gray-800 p-4 rounded-2xl mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-emerald-500 font-bold text-xs uppercase tracking-widest">
          {item.profiles?.full_name || 'Anonymous User'}
        </Text>
        <Text className="text-gray-500 text-[10px] font-mono">
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <Text className="text-gray-200 font-medium leading-5">{item.content}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-gray-950" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-900">
           <TouchableOpacity onPress={() => navigation.goBack()}>
             <Ionicons name="arrow-back" size={24} color="#10B981" />
           </TouchableOpacity>
           <Text className="text-lg font-black text-white tracking-widest uppercase">Citizen Feedback</Text>
           <View style={{ width: 24 }} />
        </View>

        <View className="px-6 pt-6">
          <Text className="text-3xl font-black text-white tracking-tighter mb-2">Help Us Improve</Text>
          <Text className="text-gray-400 font-bold text-sm mb-6">Your voice matters in building a safer city.</Text>
          
          <View className="bg-gray-900 border border-gray-800 rounded-3xl p-1 mb-4">
            <TextInput
              placeholder="Share your thoughts or suggest features..."
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={4}
              value={feedback}
              onChangeText={setFeedback}
              className="text-white p-4 h-32 align-top font-medium"
            />
          </View>

          <TouchableOpacity
            onPress={submitFeedback}
            disabled={loading}
            className="bg-emerald-600 py-4 rounded-2xl items-center shadow-lg shadow-emerald-600/20 border border-emerald-500 mb-6"
          >
            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-black tracking-widest uppercase">Post Feedback</Text>}
          </TouchableOpacity>
        </View>

        <FlatList
          data={feedbackList}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
          ListEmptyComponent={() => (
            fetching ? (
                <ActivityIndicator color="#10B981" className="mt-10" />
            ) : (
                <Text className="text-gray-600 text-center font-bold mt-10 italic">No feedback yet. Be the first to share!</Text>
            )
          )}
          refreshing={fetching}
          onRefresh={fetchFeedback}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
