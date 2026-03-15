import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigator from "./TabNavigator";
import ReportCrimeScreen from "../screens/report/ReportCrimeScreen";

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Tabs" 
        component={TabNavigator} 
        options={{ headerShown: false }} 
      />

      <Stack.Screen 
        name="ReportCrime" 
        component={ReportCrimeScreen} 
      />
    </Stack.Navigator>
  );
}