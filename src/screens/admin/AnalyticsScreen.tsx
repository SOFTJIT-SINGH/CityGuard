import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    resolutionRate: 0,
    growth: 0
  });
  const [barData, setBarData] = useState<any>(null);
  const [pieData, setPieData] = useState<any[]>([]);

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('reported_at, status_level, report_tag');

      if (error) throw error;
      if (!data) return;

      // 1. Total Stats
      const total = data.length;
      const resolved = data.filter(r => r.status_level === 3).length;
      const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
      
      // Calculate growth (last 30 days vs previous 30 days)
      const thirtyDaysAgo = dayjs().subtract(30, 'day');
      const sixtyDaysAgo = dayjs().subtract(60, 'day');
      const currentMonth = data.filter(r => dayjs(r.reported_at).isAfter(thirtyDaysAgo)).length;
      const prevMonth = data.filter(r => dayjs(r.reported_at).isBetween(sixtyDaysAgo, thirtyDaysAgo)).length;
      const growth = prevMonth > 0 ? Math.round(((currentMonth - prevMonth) / prevMonth) * 100) : 0;

      setStats({ total, resolutionRate: rate, growth });

      // 2. Bar Chart Data (Last 6 months)
      const months = [];
      const monthlyCounts = [];
      for (let i = 5; i >= 0; i--) {
        const m = dayjs().subtract(i, 'month');
        months.push(m.format('MMM'));
        const count = data.filter(r => dayjs(r.reported_at).format('MMM YYYY') === m.format('MMM YYYY')).length;
        monthlyCounts.push(count);
      }
      setBarData({
        labels: months,
        datasets: [{ data: monthlyCounts }],
      });

      // 3. Pie Chart Data (By Tag)
      const tags: { [key: string]: number } = {};
      data.forEach(r => {
        const tag = r.report_tag || 'OTHER';
        tags[tag] = (tags[tag] || 0) + 1;
      });
      const colors = ['#EF4444', '#3B82F6', '#F59E0B', '#10B981', '#6366F1', '#A855F7'];
      const pData = Object.keys(tags).map((tag, i) => ({
        name: tag,
        population: tags[tag],
        color: colors[i % colors.length],
        legendFontColor: '#9CA3AF',
        legendFontSize: 10
      }));
      setPieData(pData);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAnalytics();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const chartConfig = {
    backgroundGradientFrom: '#111827',
    backgroundGradientTo: '#111827',
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    barPercentage: 0.6,
    decimalPlaces: 0,
    propsForBackgroundLines: {
        strokeWidth: 1,
        stroke: '#1F2937',
    }
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center">
        <ActivityIndicator color="#10B981" />
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-950" 
      style={{ paddingTop: Math.max(insets.top, 20) + 12 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}
    >
      
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
          <Text className="text-gray-500 text-[10px] font-black uppercase mb-1">Total Logs</Text>
          <Text className="text-3xl font-black text-white">{stats.total}</Text>
          <Text className={`${stats.growth >= 0 ? 'text-emerald-400' : 'text-red-400'} text-[10px] font-bold mt-1`}>
            {stats.growth >= 0 ? '+' : ''}{stats.growth}% from last month
          </Text>
        </View>
        <View className="bg-gray-900 p-4 rounded-3xl w-[48%] shadow-lg border border-gray-800">
          <Text className="text-gray-500 text-[10px] font-black uppercase mb-1">Success Rate</Text>
          <Text className="text-3xl font-black text-white">{stats.resolutionRate}%</Text>
          <Text className="text-gray-500 text-[10px] font-bold mt-1 tracking-widest">RESOLVED</Text>
        </View>
      </View>

      {/* Bar Chart */}
      <View className="px-6 mb-8">
        <Text className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 px-1">Incident Trends (6m)</Text>
        <View className="bg-gray-900 rounded-3xl p-4 shadow-lg border border-gray-800 overflow-hidden items-center">
          {barData && (
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
          )}
        </View>
      </View>

      {/* Pie Chart */}
      <View className="px-6 mb-12">
        <Text className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 px-1">Incident Categories</Text>
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