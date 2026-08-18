import { Alert, Platform, type AlertButton } from 'react-native';

export type AppAlertButton = AlertButton;

export type AppAlertRequest = {
  title: string;
  message: string;
  buttons: AppAlertButton[];
};

type Listener = (request: AppAlertRequest | null) => void;

let listener: Listener | null = null;
let pending: AppAlertRequest | null = null;

export function subscribeAppAlert(fn: Listener) {
  listener = fn;
  if (pending) {
    fn(pending);
    pending = null;
  }
  return () => {
    if (listener === fn) listener = null;
  };
}

export function showAlert(
  title: string,
  message?: string,
  buttons?: AppAlertButton[],
) {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }

  const request: AppAlertRequest = {
    title,
    message: message ?? '',
    buttons: buttons ?? [],
  };

  if (listener) listener(request);
  else pending = request;
}
