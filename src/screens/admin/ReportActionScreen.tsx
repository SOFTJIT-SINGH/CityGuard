import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReportActionScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const report = route.params?.reportString ? JSON.parse(route.params.reportString) : route.params?.report;
  const [loading, setLoading] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  const updateReportStatus = async (newStatus: number, actionLabel: string) => {
    setLoading(true);
    try {
      if (!report?.id) {
        throw new Error("Report ID is missing");
      }

      const { data, error, count } = await supabase
        .from('reports')
        .update({ 
          status_level: newStatus,
          admin_notes: adminNote
        })
        .eq('id', report.id)
        .select();

      console.log('Update result:', { data, count, error });

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("No report was updated. Check if the ID exists.");
      }

      Alert.alert("Success", `Report has been marked as ${actionLabel}`);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to permanently delete this report? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "DELETE", 
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const { error } = await supabase
                .from('reports')
                .delete()
                .eq('id', report.id);
              
              if (error) throw error;
              Alert.alert("Success", "Report deleted successfully.");
              navigation.goBack();
            } catch (err: any) {
              Alert.alert("Error", err.message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-950" style={{ paddingTop: insets.top }}>
      <View className="px-6 py-4 flex-row items-center border-b border-gray-900">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Review Report</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="bg-gray-900 border border-gray-800 rounded-3xl p-6 mb-6">
          <Text className="text-emerald-500 font-bold text-xs uppercase tracking-widest mb-1">Incident Details</Text>
          <Text className="text-2xl font-black text-white mb-2">{report.title}</Text>
          <Text className="text-gray-400 text-base leading-6 mb-4">{report.description}</Text>
          
          <View className="flex-row items-center mb-4">
            <Ionicons name="person-circle-outline" size={20} color="#9CA3AF" />
            <Text className="text-gray-400 ml-2">Reporter: {report.profiles?.full_name || 'Anonymous'}</Text>
          </View>

          {report.image_url && (
            <Image 
              source={{ uri: report.image_url }} 
              className="w-full h-64 rounded-2xl mb-4 border border-gray-800"
              resizeMode="cover"
            />
          )}

          <View className="flex-row items-center bg-gray-950 p-3 rounded-2xl border border-gray-800">
            <Ionicons name="time" size={16} color="#10B981" />
            <Text className="text-gray-400 text-xs ml-2">Reported on {new Date(report.reported_at).toLocaleString()}</Text>
          </View>
        </View>

        <View className="bg-gray-900 border border-gray-800 rounded-3xl p-6 mb-10">
          <Text className="text-blue-500 font-bold text-xs uppercase tracking-widest mb-4">Take Action</Text>
          
          <TextInput
            placeholder="Add internal notes or feedback for the user..."
            placeholderTextColor="#4B5563"
            multiline
            numberOfLines={4}
            value={adminNote}
            onChangeText={setAdminNote}
            className="bg-gray-950 border border-gray-800 text-white p-4 rounded-2xl mb-6 h-32 align-top"
          />

          <View className="space-y-4">
            <TouchableOpacity 
              onPress={() => updateReportStatus(3, 'Verified')}
              disabled={loading}
              className="bg-emerald-600 p-4 rounded-2xl flex-row justify-center items-center"
            >
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text className="text-white font-bold ml-2">Verify & Resolve</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => updateReportStatus(2, 'Under Review')}
              disabled={loading}
              className="bg-amber-600 p-4 rounded-2xl flex-row justify-center items-center"
            >
              <Ionicons name="eye" size={20} color="white" />
              <Text className="text-white font-bold ml-2">Mark Under Review</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => updateReportStatus(4, 'Rejected')}
              disabled={loading}
              className="bg-red-600/20 border border-red-500/30 p-4 rounded-2xl flex-row justify-center items-center"
            >
              <Ionicons name="close-circle" size={20} color="#EF4444" />
              <Text className="text-red-500 font-bold ml-2">Reject Report</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={deleteReport}
              disabled={loading}
              className="mt-4 p-4 rounded-2xl flex-row justify-center items-center border border-red-900/50 bg-red-950/20"
            >
              <Ionicons name="trash" size={18} color="#7F1D1D" />
              <Text className="text-red-900 font-bold ml-2 uppercase tracking-widest text-xs">Permanently Delete Log</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {loading && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center">
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      )}
    </View>
  );
}
