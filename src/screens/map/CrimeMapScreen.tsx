import MapView from "react-native-maps";
import { View } from "react-native";

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

    </View>
  );
}