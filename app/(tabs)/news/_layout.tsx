import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { NewsTheme } from '@/constants/news-theme';

export default function NewsLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: NewsTheme.bg } }}>
        <Stack.Screen name="index" options={{ statusBarStyle: 'light' }} />
        <Stack.Screen name="[id]" options={{ statusBarStyle: 'dark' }} />
      </Stack>
    </>
  );
}
