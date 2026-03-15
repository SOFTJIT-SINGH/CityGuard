import { View, Text, TouchableOpacity } from "react-native";

export default function HomeScreen({ navigation }: any) {

  return (
    <View className="flex-1 bg-gray-100 p-4">

      <Text className="text-2xl font-bold mb-6">
        CityGuard Dashboard
      </Text>

      <TouchableOpacity
        className="bg-red-600 p-4 rounded-xl mb-4"
        onPress={() => navigation.navigate("ReportCrime")}
      >
        <Text className="text-white text-center text-lg">
          Report Crime
        </Text>
      </TouchableOpacity>

      <View className="bg-white p-4 rounded-xl mb-4">
        <Text className="text-lg font-semibold">
          Crime Heatmap
        </Text>
        <Text>View dangerous areas nearby</Text>
      </View>

      <View className="bg-white p-4 rounded-xl mb-4">
        <Text className="text-lg font-semibold">
          AI Crime Prediction
        </Text>
        <Text>Upcoming risk zones</Text>
      </View>

      <View className="bg-white p-4 rounded-xl">
        <Text className="text-lg font-semibold">
          SOS Emergency
        </Text>
        <Text>Send instant alert to police</Text>
      </View>

    </View>
  );
}