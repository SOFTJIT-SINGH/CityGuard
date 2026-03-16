import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import "./global.css";

export default function App() {
  return (
    // GestureHandlerRootView is required for the Sidebar swipe animations
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* SafeAreaProvider is required for the useSafeAreaInsets notch spacing */}
      <SafeAreaProvider>
        {/* NavigationContainer is the missing piece causing your error! */}
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}