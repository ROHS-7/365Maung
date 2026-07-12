import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { LanguageProvider } from '@/contexts/language';
import { AuthProvider } from '@/contexts/auth';
import { AppConfigProvider } from '@/contexts/app-config';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <LanguageProvider>
      <AuthProvider>
        <AppConfigProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack initialRouteName="(tabs)">
                <Stack.Screen name="(tabs)"          options={{ headerShown: false }} />
                <Stack.Screen name="login"           options={{ headerShown: false }} />
                <Stack.Screen name="register"        options={{ headerShown: false }} />
                <Stack.Screen name="profile"         options={{ headerShown: false }} />
                <Stack.Screen name="modal"           options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
              <StatusBar style="light" />
            </ThemeProvider>
        </AppConfigProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
