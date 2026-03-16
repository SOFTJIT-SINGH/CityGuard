import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

import TabNavigator from './TabNavigator';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import CCTVScreen from '../screens/admin/CCTVScreen';
import AIScannerScreen from '../screens/admin/AIScannerScreen';
// 1. IMPORT DISPATCH BOARD
import ActiveDispatchScreen from '../screens/admin/ActiveDispatchScreen'; 
import SafeWalkScreen from '../screens/home/SafeWalkScreen'; 
import IntelHubScreen from '../screens/home/IntelHubScreen'; 
import MyReportsScreen from '../screens/report/MyReportsScreen'; 

const Drawer = createDrawerNavigator();

export default function MainNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: '#030712' }, 
        drawerActiveBackgroundColor: '#111827', 
        drawerActiveTintColor: '#10B981', 
        drawerInactiveTintColor: '#9CA3AF', 
        drawerLabelStyle: { fontSize: 16, fontWeight: 'bold', marginLeft: -10 },
      }}
    >
      {/* USER MODULES */}
      <Drawer.Screen name="HomeTabs" component={TabNavigator} options={{ title: 'System Core', drawerIcon: ({ color, size }) => <Ionicons name="terminal-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="SafeWalk" component={SafeWalkScreen} options={{ title: 'SafeWalk Escort', drawerIcon: ({ color, size }) => <Ionicons name="shield-checkmark-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="IntelHub" component={IntelHubScreen} options={{ title: 'Community Intel Hub', drawerIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="MyReports" component={MyReportsScreen} options={{ title: 'My Intel Logs', drawerIcon: ({ color, size }) => <Ionicons name="folder-open-outline" size={size} color={color} /> }} />
      
      {/* ADMIN MODULES */}
      <Drawer.Screen name="ActiveDispatch" component={ActiveDispatchScreen} options={{ title: 'Active Dispatch Board', drawerIcon: ({ color, size }) => <Ionicons name="radio-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="AIScanner" component={AIScannerScreen} options={{ title: 'AI Vision Scanner', drawerIcon: ({ color, size }) => <Ionicons name="scan-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'System Analytics', drawerIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="CCTV" component={CCTVScreen} options={{ title: 'Live CCTV Matrix', drawerIcon: ({ color, size }) => <Ionicons name="videocam-outline" size={size} color={color} /> }} />
    </Drawer.Navigator>
  );
}