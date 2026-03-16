import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

import TabNavigator from './TabNavigator';

// 1. Import your brand new Admin Screens!
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import CCTVScreen from '../screens/admin/CCTVScreen';

const Drawer = createDrawerNavigator();

export default function MainNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false, // Keeps the ugly default header hidden
        drawerActiveBackgroundColor: '#30AF5B', // Your brand green!
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#333',
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          marginLeft: -10,
        },
      }}
    >
      {/* 1. The Main App (Your Tabs) */}
      <Drawer.Screen
        name="HomeTabs"
        component={TabNavigator}
        options={{
          title: 'Home',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 2. Admin Analytics Dashboard */}
      <Drawer.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: 'System Analytics',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 3. CCTV Integration Matrix */}
      <Drawer.Screen
        name="CCTV"
        component={CCTVScreen}
        options={{
          title: 'Live CCTV Matrix',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="videocam-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}