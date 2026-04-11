import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ReportCrimeScreen from '../screens/report/ReportCrimeScreen';

// 1. IMPORTANT: Use the session from your AuthContext
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { session, loading } = useAuth();

  // 2. Show a techy loader while Supabase checks the session
  if (loading) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center">
        <ActivityIndicator color="#10B981" size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session ? (
        // 3. IF NO SESSION: Show the Auth stack (Login/Signup)
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        // 4. IF SESSION EXISTS: Show the protected app screens
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          
          <Stack.Screen
            name="ReportCrime"
            component={ReportCrimeScreen}
            options={{
              headerShown: true, // Show header for this specific screen
              title: 'REPORT INCIDENT',
              headerStyle: { backgroundColor: '#05080D' },
              headerTintColor: '#10B981',
              headerTitleStyle: { 
                color: '#fff', 
                fontWeight: '900', 
                fontSize: 14
              },
            }}
          />
          
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}