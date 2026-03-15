import MapView from "react-native-maps";
import { View, Text } from "react-native";

export default function CrimeMapScreen() {

  return (
    <View className="flex-1">

      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 31.1471,
          longitude: 75.3412,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      />

      {/* Overlay Card */}

      <View className="absolute bottom-6 left-4 right-4 bg-white p-4 rounded-2xl shadow-lg">

        <Text className="text-lg font-semibold">
          High Risk Area
        </Text>

        <Text className="text-gray-500 mt-1">
          Theft incidents reported nearby
        </Text>

      </View>

    </View>
  );
}