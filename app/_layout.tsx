// Powered by OnSpace.AI
import { AlertProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { SplashOverlay } from '@/components/ui/SplashOverlay';
import { useState } from 'react';
import { View } from 'react-native';

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <AlertProvider>
      <SafeAreaProvider>
        <ThemeProvider>
          <FavoritesProvider>
            <View style={{ flex: 1 }}>
              <Stack screenOptions={{ headerShown: false }} />
              {!splashDone && (
                <SplashOverlay onFinish={() => setSplashDone(true)} />
              )}
            </View>
          </FavoritesProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
