import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/home/HomeScreen';
import CrimeMapScreen from '../screens/map/CrimeMapScreen';
import ChatbotScreen from '../screens/chatbot/ChatbotScreen';
import NotificationScreen from '../screens/notifications/NotificationScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10B981', // Emerald 500
        tabBarInactiveTintColor: '#6B7280', // Gray 500
        tabBarStyle: {
          backgroundColor: '#111827', // Gray 900 (Dark background)
          borderTopWidth: 1,
          borderTopColor: '#1F2937', // Gray 800 (Subtle border)
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tab.Screen name="Map" component={CrimeMapScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="locate" size={size} color={color} /> }} />
      <Tab.Screen name="Chatbot" component={ChatbotScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="hardware-chip" size={size} color={color} /> }} />
      <Tab.Screen name="Alerts" component={NotificationScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="notifications" size={size} color={color} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}