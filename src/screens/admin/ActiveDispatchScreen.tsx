import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ActiveDispatchScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState('pending');

  const [dispatchLogs, setDispatchLogs] = useState([
    { id: "INC-994-RED", title: "Armed Robbery in Progress", location: "Sector 17, Main Market", time: "2 min ago", severity: "critical", status: "pending" },
    { id: "INC-882-AMB", title: "Suspicious Vehicle", location: "Bus Stand, Gate 3", time: "14 min ago", severity: "warning", status: "investigating" },
    { id: "INC-771-GRN", title: "Noise Complaint", location: "Mall Road, Block B", time: "1 hr ago", severity: "info", status: "resolved" },
    { id: "INC-995-RED", title: "SOS Beacon Activated", location: "GT Road Highway", time: "Just Now", severity: "critical", status: "pending" },
  ]);

  const updateStatus = (id: string, newStatus: string) => {
    setDispatchLogs(dispatchLogs.map(log => log.id === id ? { ...log, status: newStatus } : log));
    Alert.alert("System Updated", `Incident ${id} status changed to ${newStatus.toUpperCase()}.`);
  };

  const filteredLogs = dispatchLogs.filter(log => filter === 'all' || log.status === filter);

  return (
    <View className="flex-1 bg-gray-950" style={{ paddingTop: Math.max(insets.top, 20) + 12 }}>
      
      {/* Tactical Header */}
      <View className="px-6 mb-6 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.openDrawer()} className="mr-4 bg-gray-900 p-2 rounded-full border border-gray-800 shadow-sm">
            <Ionicons name="menu" size={24} color="#D1D5DB" />
          </TouchableOpacity>
          <View className="bg-blue-500/10 p-2 rounded-xl mr-3 border border-blue-500/20">
            <Ionicons name="radio" size={24} color="#3B82F6" />
          </View>
          <Text className="text-2xl font-black text-white tracking-tight">Active Dispatch</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="px-6 flex-row mb-6 justify-between">
        {['pending', 'investigating', 'resolved', 'all'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            onPress={() => setFilter(tab)}
            className={`px-3 py-2 rounded-lg border ${filter === tab ? 'bg-blue-600/20 border-blue-500/50' : 'bg-gray-900 border-gray-800'}`}
          >
            <Text className={`text-xs font-bold uppercase tracking-widest ${filter === tab ? 'text-blue-400' : 'text-gray-500'}`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Incident List */}
      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
        {filteredLogs.map((log) => (
          <View key={log.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4 shadow-lg">
            
            {/* Log Header */}
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1 pr-4">
                <Text className="text-white font-black text-lg tracking-wide">{log.title}</Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="location" size={12} color="#9CA3AF" />
                  <Text className="text-gray-400 text-xs ml-1">{log.location}</Text>
                </View>
              </View>
              
              <View className={`px-2 py-1 rounded border ${
                log.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' : 
                log.severity === 'warning' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'
              }`}>
                <Text className={`text-[10px] font-mono font-bold uppercase ${
                  log.severity === 'critical' ? 'text-red-500' : log.severity === 'warning' ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                  {log.severity}
                </Text>
              </View>
            </View>

            {/* Log Meta */}
            <View className="flex-row justify-between items-center mb-4 border-b border-gray-800 pb-3">
              <Text className="text-gray-500 text-xs font-mono">{log.id} • {log.time}</Text>
              <Text className={`text-xs font-bold uppercase tracking-widest ${
                log.status === 'pending' ? 'text-red-400 animate-pulse' : 
                log.status === 'investigating' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                [{log.status}]
              </Text>
            </View>

            {/* Action Buttons (Only show if not resolved) */}
            {log.status !== 'resolved' && (
              <View className="flex-row justify-between gap-3">
                {log.status === 'pending' && (
                  <TouchableOpacity onPress={() => updateStatus(log.id, 'investigating')} className="flex-1 bg-blue-600/20 border border-blue-500/40 py-2 rounded-lg items-center">
                    <Text className="text-blue-400 text-xs font-bold uppercase tracking-widest">Dispatch Unit</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity onPress={() => updateStatus(log.id, 'resolved')} className="flex-1 bg-emerald-600/20 border border-emerald-500/40 py-2 rounded-lg items-center">
                  <Text className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Mark Resolved</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        ))}
        <View className="h-10" />
      </ScrollView>

    </View>
  );
}