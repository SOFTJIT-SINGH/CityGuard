import { View, Text, TextInput, Button } from "react-native";

export default function ReportCrimeScreen() {

  return (
    <View className="flex-1 p-4">

      <Text className="text-2xl font-bold mb-4">
        Report Crime
      </Text>

      <TextInput
        placeholder="Crime Title"
        className="border p-3 rounded-lg mb-3"
      />

      <TextInput
        placeholder="Description"
        multiline
        numberOfLines={4}
        className="border p-3 rounded-lg mb-3"
      />

      <Button title="Upload Evidence" />

      <View className="mt-4">
        <Button title="Submit Report" />
      </View>

    </View>
  );
}