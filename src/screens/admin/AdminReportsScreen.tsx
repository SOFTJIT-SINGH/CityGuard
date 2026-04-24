import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminReportsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const { data: rData, error: rError } = await supabase
        .from('reports')
        .select('*')
        .order('reported_at', { ascending: false });

      if (rError) throw rError;

      if (rData && rData.length > 0) {
        const userIds = [...new Set(rData.map(r => r.user_id))];
        const { data: pData, error: pError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        if (pError) throw pError;

        const combined = rData.map(r => ({
          ...r,
          profiles: pData?.find(p => p.id === r.user_id)
        }));

        setReports(combined);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return '#3B82F6'; // Submitted
      case 2: return '#F59E0B'; // Under Review
      case 3: return '#10B981'; // Verified/Resolved
      case 4: return '#EF4444'; // Rejected/Action Taken
      default: return '#9CA3AF';
    }
  };

  const renderReportItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('ReportAction', { report: item })}
      className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-white font-bold text-lg">{item.title}</Text>
          <Text className="text-gray-500 text-xs">By {item.profiles?.full_name || 'Anonymous'}</Text>
        </View>
        <View 
          className="px-2 py-1 rounded-full" 
          style={{ backgroundColor: `${getStatusColor(item.status_level)}20`, borderWidth: 1, borderColor: getStatusColor(item.status_level) }}
        >
          <Text style={{ color: getStatusColor(item.status_level) }} className="text-[10px] font-bold uppercase">
            {item.status_level === 1 ? 'New' : item.status_level === 2 ? 'Reviewing' : item.status_level === 3 ? 'Verified' : 'Closed'}
          </Text>
        </View>
      </View>
      
      <Text className="text-gray-400 text-sm mb-3" numberOfLines={2}>{item.description}</Text>
      
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text className="text-gray-500 text-[10px] ml-1">{new Date(item.reported_at).toLocaleString()}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#4B5563" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-950" style={{ paddingTop: insets.top }}>
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-900">
        <View>
          <Text className="text-2xl font-black text-white">Admin Panel</Text>
          <Text className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Reports Management</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.openDrawer()} className="p-2 bg-gray-900 rounded-full border border-gray-800">
          <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#10B981" />
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReportItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 24 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Ionicons name="document-text-outline" size={48} color="#374151" />
              <Text className="text-gray-500 font-bold mt-4">No reports found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
