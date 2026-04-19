import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import dayjs from 'dayjs';

export default function IntelHubScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [reports, setReports] = useState([
    { id: 1, title: "Suspicious Vehicle", desc: "Black van circling Sector 4 park with obscured plates.", score: 85, verifiedBy: 12, time: "10 mins ago" },
    { id: 2, title: "Vandalism", desc: "Graffiti being sprayed on the Bus Stand back wall.", score: 40, verifiedBy: 2, time: "45 mins ago" },
    { id: 3, title: "Loud Altercation", desc: "Two individuals fighting near Golden Temple entrance.", score: 92, verifiedBy: 34, time: "1 hour ago" },
  ]);

  useFocusEffect(
    React.useCallback(() => {
      fetchBroadcasts();
    }, [])
  );

  const fetchBroadcasts = async () => {
    try {
      const { data, error } = await supabase
        .from('broadcasts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) setBroadcasts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleVote = (id: number, type: 'up' | 'down') => {
    setReports(reports.map(r => {
      if (r.id === id) {
        return { ...r, score: type === 'up' ? Math.min(r.score + 5, 100) : Math.max(r.score - 10, 0) };
      }
      return r;
    }));
  };

  return (
    <View className="flex-1 bg-gray-950" style={{ paddingTop: Math.max(insets.top, 20) + 12 }}>
      
      {/* Header */}
      <View className="px-6 mb-6 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.openDrawer()} className="mr-4 bg-gray-900 p-2 rounded-full border border-gray-800 shadow-sm">
            <Ionicons name="menu" size={24} color="#D1D5DB" />
          </TouchableOpacity>
          <View className="bg-purple-500/10 p-2 rounded-xl mr-3 border border-purple-500/20">
            <Ionicons name="people" size={24} color="#A855F7" />
          </View>
          <Text className="text-2xl font-black text-white tracking-tight">Community</Text>
        </View>
      </View>

      <View className="px-6 mb-4">
        <Text className="text-gray-400 text-sm leading-relaxed">
          Review crowd-sourced incident reports and official city-wide overrides.
        </Text>
      </View>

      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
        
        {/* Real Broadcast Overrides */}
        {broadcasts.map((b) => (
          <View key={b.id} className="bg-red-600/10 border-2 border-red-500/30 rounded-3xl p-5 mb-6 shadow-xl relative overflow-hidden">
            <View className="absolute top-0 right-0 bg-red-600 px-3 py-1 rounded-bl-2xl">
              <Text className="text-white text-[10px] font-black uppercase tracking-widest">CRITICAL OVERRIDE</Text>
            </View>
            
            <View className="flex-row items-center mb-3">
              <Ionicons name="radio" size={18} color="#EF4444" />
              <Text className="text-red-500 text-xs font-black uppercase tracking-widest ml-2">Official Dispatch • {b.zone}</Text>
            </View>

            <Text className="text-white text-lg font-black tracking-tight mb-4">
              {b.message}
            </Text>

            <View className="flex-row items-center justify-between border-t border-red-500/20 pt-3">
              <Text className="text-gray-500 text-[10px] font-mono">{dayjs(b.created_at).format('HH:mm:ss')} • SYSTEM PERSISTENT</Text>
              <View className="bg-red-500 px-2 py-1 rounded-md">
                 <Text className="text-white text-[10px] font-black italic">PRIORITY 1</Text>
              </View>
            </View>
          </View>
        ))}

        <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[4px] mb-6 mt-2 text-center">Citizen Incident Logs</Text>
        {reports.map((report) => (
          <View key={report.id} className="bg-gray-900 border border-gray-800 rounded-3xl p-5 mb-5 shadow-lg relative overflow-hidden">
            
            {/* Credibility Score Overlay */}
            <View className={`absolute top-0 right-0 px-4 py-1 rounded-bl-2xl ${report.score > 80 ? 'bg-emerald-600' : report.score > 50 ? 'bg-amber-500' : 'bg-red-600'}`}>
              <Text className="text-white text-xs font-black tracking-widest uppercase">
                {report.score}% Trust
              </Text>
            </View>

            <Text className="text-white text-xl font-black mt-4 mb-1">{report.title}</Text>
            <Text className="text-gray-400 text-sm leading-relaxed mb-4">{report.desc}</Text>
            
            <View className="flex-row items-center justify-between border-t border-gray-800 pt-4">
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text className="text-gray-500 text-xs font-mono ml-1">{report.time} • {report.verifiedBy} verifications</Text>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity onPress={() => handleVote(report.id, 'down')} className="bg-red-500/10 p-2 rounded-full border border-red-500/30">
                  <Ionicons name="thumbs-down" size={20} color="#EF4444" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleVote(report.id, 'up')} className="bg-emerald-500/10 p-2 rounded-full border border-emerald-500/30">
                  <Ionicons name="thumbs-up" size={20} color="#10B981" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}