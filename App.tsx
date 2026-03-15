import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <RootNavigator />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
