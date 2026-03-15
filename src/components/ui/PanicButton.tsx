import { TouchableOpacity, Text } from "react-native";

export default function PanicButton({ onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="absolute bottom-10 right-6 h-16 w-16 items-center justify-center rounded-full bg-red-600 shadow-xl"
    >
      <Text className="font-bold text-white">SOS</Text>
    </TouchableOpacity>
  );
}