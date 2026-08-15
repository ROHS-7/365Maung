import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { LanguageProvider } from '@/contexts/language';
import { AuthProvider } from '@/contexts/auth';
import { AppConfigProvider } from '@/contexts/app-config';

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff',
  },
};

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppConfigProvider>
            <ThemeProvider value={LightTheme}>
              <Stack
                initialRouteName="(tabs)"
                screenOptions={{ contentStyle: { backgroundColor: '#ffffff' } }}
              >
                <Stack.Screen name="(tabs)"          options={{ headerShown: false }} />
                <Stack.Screen name="login"           options={{ headerShown: false }} />
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
