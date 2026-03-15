import { BlurView } from "expo-blur";
import { View } from "react-native";

export default function GlassCard({ children }: any) {

  return (
    <BlurView
      intensity={60}
      tint="light"
      style={{
        borderRadius: 20,
        overflow: "hidden"
      }}
    >
      <View className="p-4 bg-white/30">
        {children}
      </View>
    </BlurView>
  );
}