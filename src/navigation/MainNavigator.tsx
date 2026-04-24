import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

import TabNavigator from './TabNavigator';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import AIScannerScreen from '../screens/admin/AIScannerScreen';
import ActiveDispatchScreen from '../screens/admin/ActiveDispatchScreen';
import SocialMonitorScreen from '../screens/admin/SocialMonitorScreen';
import SafeWalkScreen from '../screens/home/SafeWalkScreen';
import IntelHubScreen from '../screens/home/IntelHubScreen';
import MyReportsScreen from '../screens/report/MyReportsScreen';
import RiskPredictionScreen from '../screens/admin/RiskPredictionScreen';
import BroadcastOverrideScreen from '../screens/admin/BroadcastOverrideScreen';
import SearchIntelScreen from '../screens/admin/SearchIntelScreen';
import SafetyAdvisoryScreen from '../screens/home/SafetyAdvisoryScreen';
import FeedbackScreen from '../screens/home/FeedbackScreen';
import PoliceStationsScreen from '../screens/map/PoliceStationsScreen';
import SupportScreen from '../screens/home/SupportScreen';

import AdminReportsScreen from '../screens/admin/AdminReportsScreen';
import ReportActionScreen from '../screens/admin/ReportActionScreen';
import AdminVerificationScreen from '../screens/admin/AdminVerificationScreen';
import ProfileVerificationScreen from '../screens/profile/VerificationScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import { useAuth } from '../context/AuthContext';

const Drawer = createDrawerNavigator();

export default function MainNavigator() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: '#030712' },
        drawerActiveBackgroundColor: '#111827',
        drawerActiveTintColor: '#10B981',
        drawerInactiveTintColor: '#9CA3AF',
        drawerLabelStyle: { fontSize: 16, fontWeight: 'bold', marginLeft: -10 },
      }}>
      <Drawer.Screen
        name="Dashboard"
        component={isAdmin ? AdminDashboardScreen : TabNavigator}
        options={{
          title: isAdmin ? 'Command Center' : 'Home Dashboard',
          drawerIcon: ({ color, size }) => (
            <Ionicons name={isAdmin ? "terminal" : "home"} size={size} color={color} />
          ),
        }}
      />

      {isAdmin && (
        <Drawer.Screen
          name="UserDashboard"
          component={TabNavigator}
          options={{
            title: 'Civilian View',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="eye-outline" size={size} color={color} />
            ),
          }}
        />
      )}

      <Drawer.Screen
        name="SafeWalk"
        component={SafeWalkScreen}
        options={{
          title: 'SafeWalk',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="IntelHub"
        component={IntelHubScreen}
        options={{
          title: 'Community',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="MyReports"
        component={MyReportsScreen}
        options={{
          title: 'My Reports',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="folder-open-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Verification"
        component={ProfileVerificationScreen}
        options={{
          title: 'ID Verification',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark-outline" size={size} color={color} />
          ),
        }}
      />

      {isAdmin && (
        <>
          <Drawer.Screen
            name="AdminReports"
            component={AdminReportsScreen}
            options={{
              title: 'Manage Reports',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="layers-outline" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="AdminVerifications"
            component={AdminVerificationScreen}
            options={{
              title: 'Review IDs',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="id-card-outline" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="SearchIntel"
            component={SearchIntelScreen}
            options={{
              title: 'Search Database',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="search-outline" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="BroadcastOverride"
            component={BroadcastOverrideScreen}
            options={{
              title: 'Broadcast Override',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="warning-outline" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="SocialMonitor"
            component={SocialMonitorScreen}
            options={{
              title: 'Social Threat Monitor',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="globe-outline" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="RiskPrediction"
            component={RiskPredictionScreen}
            options={{
              title: 'AI Risk Predictor',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="analytics-outline" size={size} color={color} />
              ),
            }}
          />
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
        </>
      )}

      {/* Hidden Action Screen */}
      <Drawer.Screen
        name="ReportAction"
        component={ReportActionScreen}
        options={{
          drawerItemStyle: { display: 'none' }
        }}
      />

      <Drawer.Screen
        name="ActiveDispatch"
        component={ActiveDispatchScreen}
        options={{
          title: 'Active Alerts',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="radio-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Drawer.Screen
        name="AIScanner"
        component={AIScannerScreen}
        options={{
          title: 'AI Scanner',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="scan-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="SafetyAdvisory"
        component={SafetyAdvisoryScreen}
        options={{
          title: 'Smart Advisories',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{
          title: 'Citizen Feedback',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="PoliceStations"
        component={PoliceStationsScreen}
        options={{
          title: 'Nearby Stations',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="location-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Support"
        component={SupportScreen}
        options={{
          title: 'Help & Support',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="help-buoy-outline" size={size} color={color} />
          ),
        }}
      />

    </Drawer.Navigator>
  );
}
