import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import EditProfileScreen from '../screens/profile/EditProfileScreen';

// THIS IS THE LINE YOU NEED!
import ReportCrimeScreen from '../screens/report/ReportCrimeScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const isLoggedIn = true;

  if (!isLoggedIn) {
    return <AuthNavigator />;
  }

  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={MainNavigator} options={{ headerShown: false }} />

      <Stack.Screen
        name="ReportCrime"
        component={ReportCrimeScreen}
        options={{
          title: 'File Intel Report',
          headerStyle: { backgroundColor: '#111827' },
          headerTintColor: '#10B981',
          headerTitleStyle: { color: '#fff', fontWeight: '900', letterSpacing: 1 },
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
