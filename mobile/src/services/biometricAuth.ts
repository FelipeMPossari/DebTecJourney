import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { UserSession } from '../types/auth';

const biometricPreferenceKey = '@DebTecJourney:biometric-enabled';
const lastSessionKey = 'DebTecJourney.last-session';
const rememberedCredentialsKey = 'DebTecJourney.remembered-credentials';

export type BiometricAvailability = {
  isAvailable: boolean;
  reason?: string;
};

export type RememberedCredentials = {
  email: string;
  password: string;
};

export async function getBiometricAvailability(): Promise<BiometricAvailability> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();

  if (!hasHardware) {
    return {
      isAvailable: false,
      reason: 'Este aparelho não possui biometria disponível.',
    };
  }

  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!isEnrolled) {
    return {
      isAvailable: false,
      reason: 'Nenhuma biometria está cadastrada neste aparelho.',
    };
  }

  return { isAvailable: true };
}

export async function authenticateWithBiometrics() {
  return LocalAuthentication.authenticateAsync({
    promptMessage: 'Entrar no DebTec Journey',
    cancelLabel: 'Cancelar',
    fallbackLabel: 'Usar senha do aparelho',
    disableDeviceFallback: false,
  });
}

export async function getBiometricPreference() {
  return (await AsyncStorage.getItem(biometricPreferenceKey)) === 'true';
}

export async function setBiometricPreference(enabled: boolean) {
  await AsyncStorage.setItem(biometricPreferenceKey, String(enabled));
}

export async function saveLastSession(session: UserSession) {
  await SecureStore.setItemAsync(lastSessionKey, JSON.stringify(session));
}

export async function getLastSession(): Promise<UserSession | null> {
  const storedSession = await SecureStore.getItemAsync(lastSessionKey);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession) as UserSession;
  } catch {
    await SecureStore.deleteItemAsync(lastSessionKey);
    return null;
  }
}

export async function clearLastSession() {
  await SecureStore.deleteItemAsync(lastSessionKey);
}

export async function saveRememberedCredentials(credentials: RememberedCredentials) {
  await SecureStore.setItemAsync(rememberedCredentialsKey, JSON.stringify(credentials));
}

export async function getRememberedCredentials(): Promise<RememberedCredentials | null> {
  const storedCredentials = await SecureStore.getItemAsync(rememberedCredentialsKey);

  if (!storedCredentials) {
    return null;
  }

  try {
    return JSON.parse(storedCredentials) as RememberedCredentials;
  } catch {
    await SecureStore.deleteItemAsync(rememberedCredentialsKey);
    return null;
  }
}

export async function clearRememberedCredentials() {
  await SecureStore.deleteItemAsync(rememberedCredentialsKey);
}
