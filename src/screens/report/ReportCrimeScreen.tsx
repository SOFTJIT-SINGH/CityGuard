import { View, Text, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function ReportCrimeScreen() {

  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // PICK IMAGE FROM GALLERY

  const pickImage = async () => {

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // OPEN CAMERA

  const openCamera = async () => {

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // GET GPS LOCATION

  const getLocation = async () => {

    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission denied");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
  };

  // SUBMIT REPORT

  const submitReport = () => {

    console.log({
      title,
      description,
      image,
      location
    });

    Alert.alert("Report submitted");
  };

  return (
    <View className="flex-1 bg-slate-100 p-4">

      <Text className="text-2xl font-bold mb-4">
        Report Crime
      </Text>

      {/* TITLE */}

      <TextInput
        placeholder="Crime title"
        value={title}
        onChangeText={setTitle}
        className="bg-white p-4 rounded-xl mb-3"
      />

      {/* DESCRIPTION */}

      <TextInput
        placeholder="Describe incident"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
        className="bg-white p-4 rounded-xl mb-3"
      />

      {/* IMAGE PREVIEW */}

      {image && (
        <Image
          source={{ uri: image }}
          className="h-40 w-full rounded-xl mb-3"
        />
      )}

      {/* IMAGE BUTTONS */}

      <View className="flex-row justify-between mb-3">

        <TouchableOpacity
          onPress={openCamera}
          className="bg-blue-600 p-3 rounded-xl w-[48%] flex-row justify-center items-center"
        >
          <Ionicons name="camera" size={18} color="white" />
          <Text className="text-white ml-2">Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={pickImage}
          className="bg-gray-800 p-3 rounded-xl w-[48%] flex-row justify-center items-center"
        >
          <Ionicons name="image" size={18} color="white" />
          <Text className="text-white ml-2">Gallery</Text>
        </TouchableOpacity>

      </View>

      {/* LOCATION BUTTON */}

      <TouchableOpacity
        onPress={getLocation}
        className="bg-green-600 p-3 rounded-xl mb-4 flex-row justify-center items-center"
      >
        <Ionicons name="location" size={18} color="white" />
        <Text className="text-white ml-2">Use Current Location</Text>
      </TouchableOpacity>

      {/* SHOW LOCATION */}

      {location && (
        <Text className="mb-3 text-gray-700">
          Lat: {location.latitude}  |  Lng: {location.longitude}
        </Text>
      )}

      {/* SUBMIT BUTTON */}

      <TouchableOpacity
        onPress={submitReport}
        className="bg-red-500 p-4 rounded-xl"
      >
        <Text className="text-center text-white font-bold">
          Submit Report
        </Text>
      </TouchableOpacity>

    </View>
  );
}