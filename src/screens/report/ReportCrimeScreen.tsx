import { View, Text, TextInput, TouchableOpacity } from "react-native";

export default function ReportCrimeScreen() {

  return (
    <View className="flex-1 bg-slate-50 p-4">

      <Text className="text-2xl font-bold mb-6">
        Report Incident
      </Text>

      <TextInput
        placeholder="Crime Title"
        className="bg-white p-4 rounded-xl mb-4 shadow"
      />

      <TextInput
        placeholder="Describe incident..."
        multiline
        numberOfLines={4}
        className="bg-white p-4 rounded-xl mb-4 shadow"
      />

      <TouchableOpacity className="bg-gray-900 p-4 rounded-xl mb-4">
        <Text className="text-white text-center">
          Upload Image / Video
        </Text>
      </TouchableOpacity>

      <TouchableOpacity className="bg-blue-600 p-4 rounded-xl">
        <Text className="text-white text-center font-semibold">
          Submit Report
        </Text>
      </TouchableOpacity>

    </View>
  );
}