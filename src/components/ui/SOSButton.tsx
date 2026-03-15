import { View, Text, TouchableOpacity } from "react-native";

export default function SOSModal({ visible, countdown, cancel }: any) {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 items-center justify-center bg-black/60">

      <View className="w-72 rounded-2xl bg-white p-6">

        <Text className="text-center text-xl font-bold">
          Emergency Alert
        </Text>

        <Text className="mt-3 text-center text-gray-600">
          Sending alert in {countdown} seconds
        </Text>

        <TouchableOpacity
          onPress={cancel}
          className="mt-5 rounded-xl bg-gray-900 p-3"
        >
          <Text className="text-center text-white">
            Cancel
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}