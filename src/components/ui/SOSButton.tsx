import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

interface SOSModalProps {
  visible: boolean;
  countdown: number;
  cancel: () => void;
}

export default function SOSModal({ visible, countdown, cancel }: SOSModalProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Tactical Pulsing Animation
  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center">
        <BlurView intensity={80} tint="dark" style={{ position: 'absolute', width: '100%', height: '100%' }} />
        
        <View className="w-[85%] bg-[#080B12] border border-red-900/40 rounded-[40px] p-8 items-center shadow-2xl">
          
          {/* Header */}
          <View className="bg-red-500/10 px-4 py-1 rounded-full border border-red-500/20 mb-10">
            <Text className="text-red-500 font-black text-[10px] tracking-[3px] uppercase">Immediate Threat Response</Text>
          </View>

          {/* CUSTOM TACTICAL COUNTDOWN */}
          <View className="items-center justify-center mb-10">
            <Animated.View 
              style={{ transform: [{ scale: pulseAnim }] }}
              className="h-40 w-40 rounded-full border-2 border-red-500/20 items-center justify-center"
            >
              <View className="h-32 w-32 rounded-full border-4 border-red-600 items-center justify-center shadow-lg shadow-red-500">
                <Text className="text-white text-6xl font-black italic">{countdown}</Text>
                <Text className="text-red-500 text-[10px] font-bold tracking-widest mt-[-5px]">SEC</Text>
              </View>
            </Animated.View>
            
            {/* Background Radar Rings */}
            <View className="absolute h-56 w-56 rounded-full border border-red-900/20 opacity-30" />
            <View className="absolute h-72 w-72 rounded-full border border-red-900/10 opacity-10" />
          </View>

          <Text className="text-white text-xl font-black text-center mb-2 tracking-tight uppercase">Executing Uplink...</Text>
          
          {/* Progress Bar (Visual Hack) */}
          <View className="w-full h-1.5 bg-gray-900 rounded-full mb-8 overflow-hidden border border-gray-800">
            <View 
              style={{ width: `${(countdown / 5) * 100}%` }} 
              className="h-full bg-red-600 shadow-sm shadow-red-500" 
            />
          </View>

          <Text className="text-gray-500 text-center text-xs font-medium leading-relaxed px-2 mb-10">
            Secure GPS coordinates being sent to <Text className="text-gray-300 font-bold">Local Dispatch & Nearby Operatives</Text>.
          </Text>

          <TouchableOpacity 
            onPress={cancel}
            activeOpacity={0.8}
            className="w-full bg-red-600/10 border border-red-600/30 py-4 rounded-2xl items-center"
          >
            <Text className="text-red-500 font-black tracking-[5px] uppercase text-xs">Abort Session</Text>
          </TouchableOpacity>

          <View className="mt-6 flex-row items-center opacity-40">
            <Ionicons name="finger-print" size={14} color="#D1D5DB" />
            <Text className="text-[9px] text-gray-300 font-bold uppercase tracking-widest ml-2">Verified Operator Access</Text>
          </View>

        </View>
      </View>
    </Modal>
  );
}