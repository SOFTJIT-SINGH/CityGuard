import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../screens/home/HomeScreen";
import CrimeMapScreen from "../screens/map/CrimeMapScreen";
import ChatbotScreen from "../screens/chatbot/ChatbotScreen";
import NotificationScreen from "../screens/notifications/NotificationScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {

  return (
    <Tab.Navigator>

      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
      />

      <Tab.Screen 
        name="Map" 
        component={CrimeMapScreen} 
      />

      <Tab.Screen 
        name="Chatbot" 
        component={ChatbotScreen} 
      />

      <Tab.Screen 
        name="Alerts" 
        component={NotificationScreen} 
      />

      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
      />

    </Tab.Navigator>
  );
}