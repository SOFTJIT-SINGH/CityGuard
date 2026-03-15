import { TouchableOpacity, Text } from "react-native";

export default function PanicButton() {

  return (
    <TouchableOpacity
      className="absolute bottom-8 right-6 bg-red-600 w-16 h-16 rounded-full justify-center items-center shadow-xl"
    >
      <Text className="text-white font-bold">
        SOS
      </Text>
    </TouchableOpacity>
  );
}