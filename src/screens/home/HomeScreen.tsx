import { View, Text, TouchableOpacity } from 'react-native';
import GlassCard from '../../components/ui/GlassCard';
import * as Location from 'expo-location';
import { useEffect } from 'react';

export default function HomeScreen({ navigation }: any) {
  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});

      console.log(location.coords);
    };

    getLocation();
  }, []);
  
  return (
    <View className="flex-1 bg-slate-100 p-4">
      <Text className="mb-6 text-3xl font-bold">CityGuard</Text>

      {/* SOS */}

      <TouchableOpacity className="mb-6 rounded-2xl bg-red-500 p-6 shadow-lg">
        <Text className="text-center text-xl font-bold text-white">EMERGENCY SOS</Text>
      </TouchableOpacity>

      <View className="flex-row justify-between">
        <TouchableOpacity className="w-[48%]" onPress={() => navigation.navigate('ReportCrime')}>
          <GlassCard>
            <Text className="text-lg font-semibold">Report Crime</Text>

            <Text className="mt-1 text-gray-600">Upload incident</Text>
          </GlassCard>
        </TouchableOpacity>

        <TouchableOpacity className="w-[48%]">
          <GlassCard>
            <Text className="text-lg font-semibold">Crime Map</Text>

            <Text className="mt-1 text-gray-600">Nearby danger</Text>
          </GlassCard>
        </TouchableOpacity>
      </View>
    </View>
  );
}
