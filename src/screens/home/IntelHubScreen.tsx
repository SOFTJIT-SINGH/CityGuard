import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function IntelHubScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [reports, setReports] = useState([
    { id: 1, title: "Suspicious Vehicle", desc: "Black van circling Sector 4 park with obscured plates.", score: 85, verifiedBy: 12, time: "10 mins ago" },
    { id: 2, title: "Vandalism", desc: "Graffiti being sprayed on the Bus Stand back wall.", score: 40, verifiedBy: 2, time: "45 mins ago" },
    { id: 3, title: "Loud Altercation", desc: "Two individuals fighting near Golden Temple entrance.", score: 92, verifiedBy: 34, time: "1 hour ago" },
  ]);

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
          <Text className="text-2xl font-black text-white tracking-tight">Intel Hub</Text>
        </View>
      </View>

      <View className="px-6 mb-4">
        <Text className="text-gray-400 text-sm leading-relaxed">
          Review crowd-sourced incident reports. Upvote to verify credibility, downvote to flag as fake or resolved.
        </Text>
      </View>

      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
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