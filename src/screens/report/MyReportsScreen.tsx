import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import dayjs from 'dayjs';

export default function MyReportsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  
  const [myReports, setMyReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  const fetchReports = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('reported_at', { ascending: false });

      if (data) {
        setMyReports(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = ["Report Submitted", "Verified", "Authorities Dispatched", "Resolved"];

  if (loading) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center">
        <ActivityIndicator color="#10B981" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-950" style={{ paddingTop: Math.max(insets.top, 20) + 12 }}>
      
      {/* Header */}
      <View className="px-6 mb-6 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.openDrawer()} className="mr-4 bg-gray-900 p-2 rounded-full border border-gray-800 shadow-sm">
            <Ionicons name="menu" size={24} color="#D1D5DB" />
          </TouchableOpacity>
          <View className="bg-emerald-500/10 p-2 rounded-xl mr-3 border border-emerald-500/20">
            <Ionicons name="folder-open" size={24} color="#10B981" />
          </View>
          <Text className="text-2xl font-black text-white tracking-tight">My Reports</Text>
        </View>
      </View>

      <View className="px-6 mb-4">
        <Text className="text-gray-400 text-sm leading-relaxed">
          Log of your submitted incidents.
        </Text>
      </View>

      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
        {myReports.map((report, index) => (
          <View key={index} className="bg-gray-900 border border-gray-800 rounded-3xl p-5 mb-5 shadow-lg">
            
            <View className="flex-row justify-between items-start mb-4 border-b border-gray-800 pb-4">
              <View className="flex-1 pr-4">
                <Text className="text-white text-lg font-black tracking-wide">{report.title}</Text>
                <Text className="text-gray-500 text-xs font-mono mt-1">{dayjs(report.reported_at).format('MMM D, HH:mm [HRS]')}</Text>
              </View>
              <View className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <Text className="text-emerald-500 text-[9px] font-black tracking-widest uppercase">Submitted</Text>
              </View>
            </View>

            <View className="mt-2">
                <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-1">Details</Text>
                <Text className="text-gray-300 leading-5">{report.description || 'No additional details provided.'}</Text>
            </View>

            <View className="mt-4 pt-4 border-t border-gray-800/50 flex-row items-center">
                <Ionicons name="finger-print" size={14} color="#10B981" />
                <Text className="text-gray-600 font-mono text-[9px] ml-2 uppercase">Log ID: {report.id?.split('-')[0] || 'REF-'+index}</Text>
            </View>

          </View>
        ))}
        
        {myReports.length === 0 && (
            <View className="items-center justify-center py-20 bg-gray-900/40 rounded-3xl border border-dashed border-gray-800">
                <Ionicons name="documents-outline" size={48} color="#374151" />
                <Text className="text-gray-500 font-bold mt-4">No reports filed yet.</Text>
            </View>
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}