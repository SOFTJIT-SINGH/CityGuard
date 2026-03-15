import { TouchableOpacity, Text } from "react-native";

export default function SOSButton() {

  return (
    <TouchableOpacity
      className="absolute bottom-10 right-6 bg-red-500 w-16 h-16 rounded-full justify-center items-center shadow-xl"
    >
      <Text className="text-white font-bold">
        SOS
      </Text>
    </TouchableOpacity>
  );
}