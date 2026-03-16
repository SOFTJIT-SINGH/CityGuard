import { View, Text, TextInput, TouchableOpacity, Image, Alert, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function ReportCrimeScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") { Alert.alert("Permission denied"); return; }
    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
  };

  const submitReport = () => { Alert.alert("Intel Uploaded", "Secure transmission successful."); };

  return (
    <KeyboardAvoidingView className="flex-1 bg-gray-950" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView className="p-6">
        
        <View className="mb-6 flex-row items-center justify-between border-b border-gray-800 pb-4">
            <View>
                <Text className="text-2xl font-black text-white tracking-tight">File Report</Text>
                <Text className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mt-1">Classified Incident Log</Text>
            </View>
            <Ionicons name="shield-checkmark" size={28} color="#10B981" />
        </View>

        <TextInput placeholder="Incident Designation (Title)" value={title} onChangeText={setTitle} placeholderTextColor="#6B7280" className="bg-gray-900 border border-gray-800 text-white p-4 rounded-2xl mb-4 font-bold" />
        <TextInput placeholder="Detailed Observation" multiline numberOfLines={4} value={description} onChangeText={setDescription} placeholderTextColor="#6B7280" className="bg-gray-900 border border-gray-800 text-white p-4 rounded-2xl mb-4 h-32 align-top" />

        {image && <Image source={{ uri: image }} className="h-48 w-full rounded-2xl mb-4 border border-gray-800 opacity-90" />}

        <View className="flex-row justify-between mb-4">
          <TouchableOpacity onPress={openCamera} className="bg-blue-600/20 border border-blue-500/30 p-4 rounded-2xl w-[48%] flex-row justify-center items-center">
            <Ionicons name="camera" size={20} color="#3B82F6" />
            <Text className="text-blue-500 font-bold ml-2">Capture</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage} className="bg-gray-800 border border-gray-700 p-4 rounded-2xl w-[48%] flex-row justify-center items-center">
            <Ionicons name="folder-open" size={20} color="#9CA3AF" />
            <Text className="text-gray-300 font-bold ml-2">Upload</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={getLocation} className="bg-emerald-600/20 border border-emerald-500/30 p-4 rounded-2xl mb-4 flex-row justify-center items-center">
          <Ionicons name="location" size={20} color="#10B981" />
          <Text className="text-emerald-500 font-bold ml-2">Acquire GPS Coords</Text>
        </TouchableOpacity>

        {location && <Text className="mb-4 text-gray-500 font-mono text-center text-xs">LAT: {location.latitude.toFixed(4)} | LNG: {location.longitude.toFixed(4)}</Text>}

        <TouchableOpacity onPress={submitReport} className="bg-red-600 border border-red-500 p-4 rounded-2xl shadow-lg shadow-red-600/20 mt-4">
          <Text className="text-center text-white font-black tracking-widest uppercase">Transmit Intel</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}