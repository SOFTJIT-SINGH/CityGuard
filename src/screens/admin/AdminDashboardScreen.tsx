import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    pendingVerifications: 0,
    activeAlerts: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const [reports, verifications, alerts] = await Promise.all([
        supabase.from('reports').select('id, status_level'),
        supabase.from('verifications').select('id').eq('status', 'pending'),
        supabase.from('emergency_alerts').select('id').eq('status', 'active')
      ]);

      setStats({
        totalReports: reports.data?.length || 0,
        pendingReports: reports.data?.filter(r => r.status_level === 1).length || 0,
        pendingVerifications: verifications.data?.length || 0,
        activeAlerts: alerts.data?.length || 0
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  return (
    <View className="flex-1 bg-gray-950">
      {/* COMMAND CENTER HEADER */}
      <View 
        style={{ paddingTop: insets.top + 10 }}
        className="bg-gray-900/90 border-b border-gray-800 px-6 pb-6 backdrop-blur-2xl"
      >
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity 
            onPress={() => navigation.openDrawer()}
            className="h-10 w-10 bg-gray-800 rounded-xl items-center justify-center border border-gray-700"
          >
            <Ionicons name="menu" size={24} color="#10B981" />
          </TouchableOpacity>
          <View className="flex-row items-center bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <View className="h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
            <Text className="text-emerald-500 font-mono text-[10px] font-black uppercase tracking-widest">System Online</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
             <Image 
                source={{ uri: `https://ui-avatars.com/api/?name=${profile?.full_name || 'Admin'}&background=10B981&color=fff&bold=true` }} 
                className="h-10 w-10 rounded-xl border border-emerald-500/30"
             />
          </TouchableOpacity>
        </View>
        
        <Text className="text-[10px] font-black text-gray-500 uppercase tracking-[5px] mb-1">Command Center</Text>
        <Text className="text-3xl font-black text-white tracking-tighter">
          Welcome,{" "}{profile?.full_name} 
        </Text>
        <Text className="text-emerald-500 font-mono text-[10px] font-black uppercase tracking-widest">Admin</Text>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}
      >
        {/* CRITICAL STATS GRID */}
        <View className="p-6 flex-row flex-wrap justify-between">
          <View className="w-[48%] bg-gray-900 border border-red-500/20 rounded-3xl p-5 mb-4 shadow-xl">
            <MaterialCommunityIcons name="alert-decagram" size={24} color="#EF4444" />
            <Text className="text-3xl font-black text-white mt-2">{stats.activeAlerts}</Text>
            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Active SOS</Text>
          </View>

          <View className="w-[48%] bg-gray-900 border border-amber-500/20 rounded-3xl p-5 mb-4 shadow-xl">
            <Ionicons name="document-text" size={24} color="#F59E0B" />
            <Text className="text-3xl font-black text-white mt-2">{stats.pendingReports}</Text>
            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">New Reports</Text>
          </View>

          <View className="w-[48%] bg-gray-900 border border-blue-500/20 rounded-3xl p-5 mb-4 shadow-xl">
            <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
            <Text className="text-3xl font-black text-white mt-2">{stats.pendingVerifications}</Text>
            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Pending IDs</Text>
          </View>

          <View className="w-[48%] bg-gray-900 border border-emerald-500/20 rounded-3xl p-5 mb-4 shadow-xl">
            <Ionicons name="people" size={24} color="#10B981" />
            <Text className="text-3xl font-black text-white mt-2">{stats.totalReports}</Text>
            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Total Logs</Text>
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <View className="px-6 mb-8">
          <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[3px] mb-4">Operations</Text>
          
          <TouchableOpacity 
            onPress={() => navigation.navigate('AdminReports')}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-5 flex-row items-center mb-3"
          >
            <View className="h-12 w-12 bg-emerald-500/10 rounded-2xl items-center justify-center border border-emerald-500/20">
              <Ionicons name="layers" size={24} color="#10B981" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-white font-bold text-lg">Manage Incident Reports</Text>
              <Text className="text-gray-500 text-xs">Review, verify and take action</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('AdminVerifications')}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-5 flex-row items-center mb-3"
          >
            <View className="h-12 w-12 bg-blue-500/10 rounded-2xl items-center justify-center border border-blue-500/20">
              <Ionicons name="id-card" size={24} color="#3B82F6" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-white font-bold text-lg">Identity Verification</Text>
              <Text className="text-gray-500 text-xs">Review pending user documents</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('ActiveDispatch')}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-5 flex-row items-center"
          >
            <View className="h-12 w-12 bg-red-500/10 rounded-2xl items-center justify-center border border-red-500/20">
              <Ionicons name="radio" size={24} color="#EF4444" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-white font-bold text-lg">Active Alerts Panel</Text>
              <Text className="text-gray-500 text-xs">Real-time emergency monitoring</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* SYSTEM LOGS PREVIEW */}
        <View className="px-6">
           <View className="bg-gray-900/50 border border-gray-800 rounded-[35px] p-6">
              <View className="flex-row justify-between items-center mb-6">
                 <Text className="text-white font-black uppercase tracking-widest text-xs">System Intelligence</Text>
                 <Ionicons name="pulse" size={20} color="#10B981" />
              </View>
              
              <View className="space-y-4">
                 {stats.pendingReports > 0 && (
                   <View className="flex-row items-center">
                      <View className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-3" />
                      <Text className="text-gray-400 text-xs font-mono">{stats.pendingReports} unreviewed incident reports detected.</Text>
                   </View>
                 )}
                 {stats.pendingVerifications > 0 && (
                   <View className="flex-row items-center">
                      <View className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-3" />
                      <Text className="text-gray-400 text-xs font-mono">{stats.pendingVerifications} identity verifications in queue.</Text>
                   </View>
                 )}
                 {stats.activeAlerts > 0 ? (
                   <View className="flex-row items-center">
                      <View className="w-1.5 h-1.5 rounded-full bg-red-500 mr-3 animate-pulse" />
                      <Text className="text-red-400 text-xs font-mono">CRITICAL: {stats.activeAlerts} active emergency signals.</Text>
                   </View>
                 ) : (
                    <View className="flex-row items-center">
                      <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-3" />
                      <Text className="text-gray-400 text-xs font-mono">No active emergency signals in geofence.</Text>
                   </View>
                 )}
                 <View className="flex-row items-center">
                    <View className="w-1.5 h-1.5 rounded-full bg-gray-700 mr-3" />
                    <Text className="text-gray-400 text-[10px] font-mono">V1.0.8 - Last system scan: {new Date().toLocaleTimeString()}</Text>
                 </View>
              </View>
           </View>
        </View>
      </ScrollView>
    </View>
  );
}
