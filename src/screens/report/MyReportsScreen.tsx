import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MyReportsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  // Mock Data: The user's submitted reports and their current status level (1 to 4)
  const myReports = [
    { 
      id: "REP-992-ALPHA", 
      title: "Suspicious Vehicle", 
      date: "Oct 24, 22:15 HRS", 
      statusLevel: 3, 
      type: "warning" 
    },
    { 
      id: "REP-884-BRAVO", 
      title: "Vandalism at Bus Stand", 
      date: "Oct 20, 14:30 HRS", 
      statusLevel: 4, 
      type: "resolved" 
    },
    { 
      id: "REP-102-ECHO", 
      title: "Noise Altercation", 
      date: "Oct 25, 01:05 HRS", 
      statusLevel: 1, 
      type: "pending" 
    },
  ];

  const statusSteps = ["Intel Logged", "AI Verified", "Units Dispatched", "Resolved"];

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
          <Text className="text-2xl font-black text-white tracking-tight">My Intel Logs</Text>
        </View>
      </View>

      <View className="px-6 mb-4">
        <Text className="text-gray-400 text-sm leading-relaxed">
          Track the real-time status of your submitted field reports and AI verification progress.
        </Text>
      </View>

      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
        {myReports.map((report, index) => (
          <View key={index} className="bg-gray-900 border border-gray-800 rounded-3xl p-5 mb-5 shadow-lg">
            
            <View className="flex-row justify-between items-start mb-4 border-b border-gray-800 pb-4">
              <View>
                <Text className="text-white text-lg font-black tracking-wide">{report.title}</Text>
                <Text className="text-gray-500 text-xs font-mono mt-1">{report.date}</Text>
              </View>
              <View className="bg-gray-950 px-2 py-1 rounded-md border border-gray-800">
                <Text className="text-emerald-400 text-[10px] font-mono tracking-widest">{report.id}</Text>
              </View>
            </View>

            {/* Tactical Timeline Tracker */}
            <View className="mt-2">
              {statusSteps.map((step, stepIndex) => {
                const isCompleted = stepIndex < report.statusLevel;
                const isCurrent = stepIndex === report.statusLevel - 1;
                const isLast = stepIndex === statusSteps.length - 1;

                return (
                  <View key={stepIndex} className="flex-row items-start">
                    {/* Step Indicator & Line */}
                    <View className="items-center mr-4">
                      <View className={`h-4 w-4 rounded-full border-2 ${
                        isCompleted ? 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/50' : 
                        'bg-gray-900 border-gray-700'
                      }`} />
                      {!isLast && (
                        <View className={`w-0.5 h-8 ${isCompleted && !isCurrent ? 'bg-emerald-500/50' : 'bg-gray-800'}`} />
                      )}
                    </View>

                    {/* Step Text */}
                    <View className="justify-center h-4 mt-[-2px]">
                      <Text className={`text-xs font-bold uppercase tracking-widest ${
                        isCurrent ? 'text-emerald-400' : 
                        isCompleted ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {step}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

          </View>
        ))}
        
        {/* Padding for bottom scroll */}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}