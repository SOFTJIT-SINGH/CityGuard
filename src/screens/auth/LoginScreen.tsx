import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import GlassCard from '../../components/ui/GlassCard';

export default function LoginScreen({ navigation }: any) {
  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} className="flex-1 justify-center px-6">
      <StatusBar style="light" />
      
      <View className="items-center mb-10 mt-10">
        <Ionicons name="shield-checkmark" size={80} color="#3B82F6" />
        <Text className="text-4xl font-bold text-white mt-4 tracking-tight">CityGuard</Text>
        <Text className="text-blue-200 mt-2 text-center font-medium">Your Personal Safety Companion</Text>
      </View>

      <GlassCard>
        <Text className="text-2xl font-bold text-white mb-6 tracking-wide">Welcome Back</Text>
        
        {/* Recessed Inputs */}
        <View className="bg-black/20 rounded-xl px-4 py-2 mb-4 border border-white/10">
          <TextInput 
            placeholder="Email Address" 
            placeholderTextColor="#64748B"
            className="text-white text-lg h-12"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View className="bg-black/20 rounded-xl px-4 py-2 mb-8 border border-white/10">
          <TextInput 
            placeholder="Password" 
            placeholderTextColor="#64748B"
            secureTextEntry
            className="text-white text-lg h-12"
          />
        </View>

        {/* Premium Button */}
        <TouchableOpacity 
          className="bg-blue-600 rounded-xl h-14 items-center justify-center shadow-lg shadow-blue-500/50"
          onPress={() => console.log('Login pressed')}
        >
          <Text className="text-white text-lg font-bold tracking-wide">Sign In</Text>
        </TouchableOpacity>
      </GlassCard>

    </LinearGradient>
  );
}