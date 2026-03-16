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
    { name: 'Theft', population: 45, color: '#EF4444', legendFontColor: '#374151', legendFontSize: 12 },
    { name: 'Assault', population: 15, color: '#F97316', legendFontColor: '#374151', legendFontSize: 12 },
    { name: 'Vandalism', population: 25, color: '#F59E0B', legendFontColor: '#374151', legendFontSize: 12 },
    { name: 'Suspicious', population: 60, color: '#30AF5B', legendFontColor: '#374151', legendFontSize: 12 },
  ];

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(48, 175, 91, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    barPercentage: 0.6,
    decimalPlaces: 0,
  };

  return (
    <ScrollView className="flex-1 bg-[#F4F7F6]" style={{ paddingTop: Math.max(insets.top, 20) + 12 }}>
      
      {/* Header with Sidebar Menu Button */}
      <View className="px-6 mb-6 flex-row items-center">
        <TouchableOpacity 
          onPress={() => navigation.openDrawer()} 
          className="mr-4 bg-white p-2 rounded-full shadow-sm border border-gray-100"
        >
          <Ionicons name="menu" size={24} color="#111827" />
        </TouchableOpacity>

        <View className="bg-indigo-100 p-2 rounded-xl mr-3">
          <Ionicons name="stats-chart" size={24} color="#6366F1" />
        </View>
        <Text className="text-2xl font-black text-gray-900 tracking-tight">System Analytics</Text>
      </View>

      {/* Stats Row */}
      <View className="px-6 flex-row justify-between mb-8">
        <View className="bg-white p-4 rounded-3xl w-[48%] shadow-sm border border-gray-100">
          <Text className="text-gray-500 text-xs font-bold uppercase mb-1">Total Reports</Text>
          <Text className="text-3xl font-black text-gray-900">1,284</Text>
          <Text className="text-emerald-500 text-xs font-bold mt-1">+12% this month</Text>
        </View>
        <View className="bg-white p-4 rounded-3xl w-[48%] shadow-sm border border-gray-100">
          <Text className="text-gray-500 text-xs font-bold uppercase mb-1">Resolution Rate</Text>
          <Text className="text-3xl font-black text-gray-900">84%</Text>
          <Text className="text-emerald-500 text-xs font-bold mt-1">+4% this month</Text>
        </View>
      </View>

      {/* Bar Chart */}
      <View className="px-6 mb-8">
        <Text className="text-lg font-bold text-gray-900 mb-4 px-1">Monthly Incident Volume</Text>
        <View className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 overflow-hidden items-center">
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
        <Text className="text-lg font-bold text-gray-900 mb-4 px-1">Incident Distribution</Text>
        <View className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 items-center">
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