import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * SecureStore on native; localStorage on web.
 * Web cannot use hardware-backed SecureStore — localStorage is the browser equivalent.
 */
export async function getSecureItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage === 'undefined') return null;
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function deleteSecureItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
