import MapView, { Marker } from 'react-native-maps';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useRef, useState, useMemo } from 'react';
export default function CrimeMapScreen() {
  const [selectedCrime, setSelectedCrime] = useState<any>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['10%', '35%'], []);

  const handleMarkerPress = (crime: any) => {
    setSelectedCrime(crime);
    bottomSheetRef.current?.snapToIndex(1);
  };

const crimes = [
  {
    id: 1,
    title: "Mobile Theft",
    description: "Phone stolen near bus stand",
    category: "Theft",
    time: "10 mins ago",
    image:
      "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc",
    latitude: 31.326,
    longitude: 75.5762,
  },
  {
    id: 2,
    title: "Chain Snatching",
    description: "Two suspects on bike",
    category: "Robbery",
    time: "25 mins ago",
    image:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
    latitude: 31.3275,
    longitude: 75.579,
  },
];
  return (
    <View className="flex-1">
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 31.1471,
          longitude: 75.3412,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}>
        {crimes.map((crime) => (
          <Marker
            key={crime.id}
            coordinate={{
              latitude: crime.latitude,
              longitude: crime.longitude,
            }}
            onPress={() => handleMarkerPress(crime)}
          />
        ))}
      </MapView>

<BottomSheet
  ref={bottomSheetRef}
  index={0}
  snapPoints={snapPoints}
>

  <View className="p-4">

    {selectedCrime ? (
      <>
        {/* Crime Image */}

        <Image
          source={{ uri: selectedCrime.image }}
          className="h-40 w-full rounded-xl"
        />

        {/* Crime Title */}

        <Text className="mt-3 text-xl font-bold">
          {selectedCrime.title}
        </Text>

        {/* Category + Time */}

        <View className="mt-1 flex-row justify-between">

          <Text className="text-red-500 font-semibold">
            {selectedCrime.category}
          </Text>

          <Text className="text-gray-500">
            {selectedCrime.time}
          </Text>

        </View>

        {/* Description */}

        <Text className="mt-3 text-gray-600">
          {selectedCrime.description}
        </Text>

        {/* Action Button */}

        <TouchableOpacity className="mt-4 rounded-xl bg-blue-600 p-3">

          <Text className="text-center text-white font-semibold">
            View Full Report
          </Text>

        </TouchableOpacity>
      </>
    ) : (
      <Text>Select a crime marker</Text>
    )}

  </View>

</BottomSheet>
      {/* Refresh Button */}

      <TouchableOpacity className="absolute right-4 top-12 rounded-xl bg-white p-3 shadow">
        <Text>Refresh</Text>
      </TouchableOpacity>

      {/* Info Card */}

      <View className="absolute bottom-6 left-4 right-4 rounded-2xl bg-white/80 p-4 shadow-lg">
        <Text className="text-lg font-semibold">Crime Hotspot</Text>

        <Text className="mt-1 text-gray-600">Multiple theft reports detected in this area.</Text>
      </View>
    </View>
  );
}
