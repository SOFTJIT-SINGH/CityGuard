import { View, Text, TouchableOpacity } from "react-native";

export default function SOSModal({ visible, countdown, cancel }: any) {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 items-center justify-center bg-black/60 z-50">
      <View className="w-[85%] max-w-sm rounded-[32px] bg-white p-8 items-center shadow-2xl">
        
        {/* Red Warning Circle */}
        <View className="h-20 w-20 rounded-full bg-red-100 items-center justify-center mb-4">
          <View className="h-14 w-14 rounded-full bg-red-500 items-center justify-center animate-pulse">
            <Text className="text-white text-2xl font-black">{countdown}</Text>
          </View>
        </View>

        <Text className="text-center text-2xl font-black text-gray-900">
          Emergency Alert
        </Text>

        <Text className="mt-2 text-center text-gray-500 font-medium text-base mb-8">
          Notifying emergency contacts and authorities in {countdown} seconds...
        </Text>

        <TouchableOpacity
          onPress={cancel}
          className="w-full rounded-2xl bg-gray-100 py-4 border border-gray-200"
        >
          <Text className="text-center text-gray-900 text-lg font-bold">
            Cancel Alert
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}