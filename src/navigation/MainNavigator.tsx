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

import EmergencyContactsScreen from '../screens/profile/EmergencyContactsScreen';
import ReportCrimeScreen from '../screens/report/ReportCrimeScreen';
import ChatbotScreen from '../screens/chatbot/ChatbotScreen';
import CrimeMapScreen from '../screens/map/CrimeMapScreen';

import AdminReportsScreen from '../screens/admin/AdminReportsScreen';
import ReportActionScreen from '../screens/admin/ReportActionScreen';
import AdminVerificationScreen from '../screens/admin/AdminVerificationScreen';
import ProfileVerificationScreen from '../screens/profile/VerificationScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { useAuth } from '../context/AuthContext';
import DrawerContent from './DrawerContent';

const Drawer = createDrawerNavigator();

export default function MainNavigator() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: '#030712', width: 300 },
        drawerActiveBackgroundColor: '#111827',
        drawerActiveTintColor: '#10B981',
        drawerInactiveTintColor: '#9CA3AF',
        drawerLabelStyle: { fontSize: 14, fontWeight: '900', marginLeft: -10, textTransform: 'uppercase', letterSpacing: 1 },
        drawerItemStyle: { borderRadius: 12, marginVertical: 4, paddingHorizontal: 8 },
      }}>
      <Drawer.Screen
        key="dashboard"
        name="Dashboard"
        component={isAdmin ? AdminDashboardScreen : TabNavigator}
        options={{
          title: isAdmin ? 'Command Center' : 'Home Dashboard',
          drawerIcon: ({ color, size }) => (
            <Ionicons name={isAdmin ? "terminal" : "home"} size={size} color={color} />
          ),
          // Keep dashboard visible for both
        }}
      />

      {isAdmin && (
        <Drawer.Screen
          key="user-view"
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
        key="safewalk"
        name="SafeWalk"
        component={SafeWalkScreen}
        options={{
          title: 'SafeWalk',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark-outline" size={size} color={color} />
          ),
          drawerItemStyle: isAdmin ? { display: 'none' } : undefined
        }}
      />

      <Drawer.Screen
        key="intel-hub"
        name="IntelHub"
        component={IntelHubScreen}
        options={{
          title: 'Community',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
          drawerItemStyle: isAdmin ? { display: 'none' } : undefined
        }}
      />

      <Drawer.Screen
        key="my-reports"
        name="MyReports"
        component={MyReportsScreen}
        options={{
          title: 'My Reports',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="folder-open-outline" size={size} color={color} />
          ),
          drawerItemStyle: isAdmin ? { display: 'none' } : undefined
        }}
      />

      <Drawer.Screen
        key="verification"
        name="Verification"
        component={ProfileVerificationScreen}
        options={{
          title: 'ID Verification',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark-outline" size={size} color={color} />
          ),
          drawerItemStyle: isAdmin ? { display: 'none' } : undefined
        }}
      />

      {isAdmin && (
        <>
          <Drawer.Screen
            key="admin-reports"
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
            key="admin-verifications"
            name="AdminVerifications"
            component={AdminVerificationScreen}
            options={{
              title: 'Review ID',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="id-card-outline" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            key="search-intel"
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
            key="social-monitor"
            name="SocialMonitor"
            component={SocialMonitorScreen}
            options={{
              title: 'Social Threat Monitor',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="globe-outline" size={size} color={color} />
              ),
            }}
          />
        </>
      )}

      <Drawer.Screen
        key="broadcast-override"
        name="BroadcastOverride"
        component={BroadcastOverrideScreen}
        options={{
          title: isAdmin ? 'Broadcast Override' : 'Broadcast Override',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="warning-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        key="risk-prediction"
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
        key="analytics"
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: 'System Analytics',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden Action Screen */}
      <Drawer.Screen
        key="report-action"
        name="ReportAction"
        component={ReportActionScreen}
        options={{
          drawerItemStyle: { display: 'none' }
        }}
      />

      <Drawer.Screen
        key="profile"
        name="Profile"
        component={ProfileScreen}
        options={{
          drawerItemStyle: { display: 'none' }
        }}
      />

      <Drawer.Screen
        key="active-dispatch"
        name="ActiveDispatch"
        component={ActiveDispatchScreen}
        options={{
          title: isAdmin ? 'Active Alerts' : 'Active Alerts',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="radio-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Doc Verify (Alias for AIScanner for admin) */}
      {isAdmin && (
        <Drawer.Screen
          key="doc-verify"
          name="DocVerify"
          component={AIScannerScreen}
          options={{
            title: 'Doc Verify',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="id-card-outline" size={size} color={color} />
            ),
          }}
        />
      )}
      
      <Drawer.Screen
        key="ai-scanner"
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
        key="safety-advisory"
        name="SafetyAdvisory"
        component={SafetyAdvisoryScreen}
        options={{
          title: 'Smart Advisories',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark-outline" size={size} color={color} />
          ),
          drawerItemStyle: isAdmin ? { display: 'none' } : undefined
        }}
      />

      <Drawer.Screen
        key="feedback"
        name="Feedback"
        component={FeedbackScreen}
        options={{
          title: 'Citizen Feedback',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
          drawerItemStyle: isAdmin ? { display: 'none' } : undefined
        }}
      />

      <Drawer.Screen
        key="emergency-contacts"
        name="EmergencyContacts"
        component={EmergencyContactsScreen}
        options={{
          title: 'Emergency Contacts',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="call-outline" size={size} color={color} />
          ),
          drawerItemStyle: isAdmin ? { display: 'none' } : undefined
        }}
      />

      <Drawer.Screen
        key="report-crime"
        name="ReportCrime"
        component={ReportCrimeScreen}
        options={{
          title: 'File an Incident',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="warning-outline" size={size} color={color} />
          ),
          drawerItemStyle: isAdmin ? { display: 'none' } : undefined
        }}
      />

      <Drawer.Screen
        key="chatbot-drawer"
        name="Chatbot"
        component={ChatbotScreen}
        options={{
          title: isAdmin ? 'City Guard AI' : 'AI Safety Assistant',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="hardware-chip-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        key="crime-map-drawer"
        name="CrimeMap"
        component={CrimeMapScreen}
        options={{
          title: isAdmin ? 'Heatmap' : 'Live Threat Map',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        key="police-stations"
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
        key="support"
        name="Support"
        component={SupportScreen}
        options={{
          title: 'Help & Support',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="help-buoy-outline" size={size} color={color} />
          ),
          drawerItemStyle: isAdmin ? { display: 'none' } : undefined
        }}
      />

    </Drawer.Navigator>
  );
}
