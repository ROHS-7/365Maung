import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { Appearance, Platform, View } from 'react-native';
import 'react-native-reanimated';

import { LanguageProvider } from '@/contexts/language';
import { AuthProvider } from '@/contexts/auth';
import { AppConfigProvider } from '@/contexts/app-config';
import { AppAlertHost } from '@/components/app-alert-host';
import { WebCappedSafeArea } from '@/components/web-capped-safe-area';

if (Platform.OS !== 'web' && typeof Appearance.setColorScheme === 'function') {
  Appearance.setColorScheme('light');
}
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  document.documentElement.style.colorScheme = 'light';
  document.documentElement.style.backgroundColor = '#ffffff';
  document.body.style.backgroundColor = '#ffffff';
  document.body.style.color = '#1A2E22';
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
      <WebCappedSafeArea>
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
                <AppAlertHost />
              </ThemeProvider>
          </AppConfigProvider>
        </AuthProvider>
      </LanguageProvider>
      </WebCappedSafeArea>
    </View>
  );
}
