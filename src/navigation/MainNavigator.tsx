import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

import TabNavigator from './TabNavigator';
// Temporarily importing Profile for the Admin dummy link
import ProfileScreen from '../screens/profile/ProfileScreen'; 

const Drawer = createDrawerNavigator();

export default function MainNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false, // Hides the ugly default drawer header
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

      {/* 2. Admin / Police Dashboard Link (For your future feature) */}
      <Drawer.Screen
        name="AdminDashboard"
        component={ProfileScreen} // Temporarily pointing to Profile
        options={{
          title: 'Admin Dashboard',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="shield-half-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 3. CCTV Integration Link (For your future feature) */}
      <Drawer.Screen
        name="CCTV"
        component={ProfileScreen} // Temporarily pointing to Profile
        options={{
          title: 'Live CCTV',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="videocam-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}