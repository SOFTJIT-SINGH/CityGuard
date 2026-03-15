import { BlurView } from "expo-blur";
import { View, StyleSheet } from "react-native";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <View className={`overflow-hidden rounded-3xl border border-white/20 shadow-2xl ${className}`}>
      
      {/* Background Blur Layer */}
      <BlurView
        intensity={60}
        tint="dark"
        experimentalBlurMethod="dimezisBlurView" // Fixes Android blur issues
        style={StyleSheet.absoluteFill}
      />
      
      {/* Foreground Content Layer */}
      <View className="bg-white/10 p-6">
        {children}
      </View>

    </View>
  );
}