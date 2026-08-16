import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { Appearance, Platform, View } from 'react-native';
import 'react-native-reanimated';

import { LanguageProvider } from '@/contexts/language';
import { AuthProvider } from '@/contexts/auth';
import { AppConfigProvider } from '@/contexts/app-config';

if (Platform.OS !== 'web' && typeof Appearance.setColorScheme === 'function') {
  Appearance.setColorScheme('light');
}
void SystemUI.setBackgroundColorAsync('#ffffff');

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff',
  },
};

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
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
    </View>
  );
}
