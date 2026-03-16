import React from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{ data: [20, 45, 28, 80, 99, 43] }],
  };

  const pieData = [
    { name: 'Theft', population: 45, color: '#EF4444', legendFontColor: '#9CA3AF', legendFontSize: 12 },
    { name: 'Assault', population: 15, color: '#F97316', legendFontColor: '#9CA3AF', legendFontSize: 12 },
    { name: 'Vandalism', population: 25, color: '#F59E0B', legendFontColor: '#9CA3AF', legendFontSize: 12 },
    { name: 'Suspicious', population: 60, color: '#10B981', legendFontColor: '#9CA3AF', legendFontSize: 12 },
  ];

  const chartConfig = {
    backgroundGradientFrom: '#111827', // gray-900
    backgroundGradientTo: '#111827',
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Emerald Green
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`, // Gray-400
    barPercentage: 0.6,
    decimalPlaces: 0,
    propsForBackgroundLines: {
        strokeWidth: 1,
        stroke: '#1F2937', // very subtle grid lines
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-950" style={{ paddingTop: Math.max(insets.top, 20) + 12 }}>
      
      {/* Header */}
      <View className="px-6 mb-6 flex-row items-center">
        <TouchableOpacity 
          onPress={() => navigation.openDrawer()} 
          className="mr-4 bg-gray-900 p-2 rounded-full border border-gray-800 shadow-sm"
        >
          <Ionicons name="menu" size={24} color="#D1D5DB" />
        </TouchableOpacity>

        <View className="bg-blue-500/10 p-2 rounded-xl mr-3 border border-blue-500/20">
          <Ionicons name="stats-chart" size={24} color="#3B82F6" />
        </View>
        <Text className="text-2xl font-black text-white tracking-tight">System Analytics</Text>
      </View>

      {/* Stats Row */}
      <View className="px-6 flex-row justify-between mb-8">
        <View className="bg-gray-900 p-4 rounded-3xl w-[48%] shadow-lg border border-gray-800">
          <Text className="text-gray-500 text-xs font-bold uppercase mb-1">Total Reports</Text>
          <Text className="text-3xl font-black text-white">1,284</Text>
          <Text className="text-emerald-400 text-xs font-bold mt-1">+12% this month</Text>
        </View>
        <View className="bg-gray-900 p-4 rounded-3xl w-[48%] shadow-lg border border-gray-800">
          <Text className="text-gray-500 text-xs font-bold uppercase mb-1">Resolution Rate</Text>
          <Text className="text-3xl font-black text-white">84%</Text>
          <Text className="text-emerald-400 text-xs font-bold mt-1">+4% this month</Text>
        </View>
      </View>

      {/* Bar Chart */}
      <View className="px-6 mb-8">
        <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">Monthly Incident Volume</Text>
        <View className="bg-gray-900 rounded-3xl p-4 shadow-lg border border-gray-800 overflow-hidden items-center">
          <BarChart
            data={barData}
            width={screenWidth - 80}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={chartConfig}
            style={{ borderRadius: 16 }}
            showValuesOnTopOfBars
          />
        </View>
      </View>

      {/* Pie Chart */}
      <View className="px-6 mb-12">
        <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">Incident Distribution</Text>
        <View className="bg-gray-900 rounded-3xl p-4 shadow-lg border border-gray-800 items-center">
          <PieChart
            data={pieData}
            width={screenWidth - 80}
            height={200}
            chartConfig={chartConfig}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute
          />
        </View>
      </View>

    </ScrollView>
  );
}