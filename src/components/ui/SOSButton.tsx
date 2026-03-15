import React, { useState } from 'react';
import { TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import * as Linking from 'expo-linking';

export default function SOSButton() {
  const [loading, setLoading] = useState(false);

  const triggerSOS = async () => {
    setLoading(true);
    try {
      // 1. Request Location Permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need your location to send the SOS.');
        setLoading(false);
        return;
      }

      // 2. Get Current Location
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

      const emergencyMessage = `SOS! I need help. I am currently at this location: ${googleMapsLink}`;

      // 3. Try to open SMS with the message
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        // You can replace these with actual emergency contact numbers from your future database
        await SMS.sendSMSAsync(
          ['112', '911'], 
          emergencyMessage
        );
      } else {
        // Fallback: If SMS isn't available (like on some simulators), open the dialer
        Linking.openURL('tel:112');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while sending the SOS.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={triggerSOS}
      disabled={loading}
      className={`w-40 h-40 rounded-full items-center justify-center shadow-2xl border-4 border-red-300 ${
        loading ? 'bg-red-400' : 'bg-red-600'
      }`}
    >
      {loading ? (
        <ActivityIndicator size="large" color="white" />
      ) : (
        <Text className="text-white text-4xl font-extrabold tracking-widest">
          SOS
        </Text>
      )}
    </TouchableOpacity>
  );
}