import { useEffect, useMemo, useState } from 'react';
import { Check, FingerprintPattern } from 'lucide-react-native';
import {
  Keyboard,
  KeyboardAvoidingView,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  authenticateWithBiometrics,
  clearRememberedCredentials,
  getBiometricAvailability,
  getBiometricPreference,
  getLastSession,
  getRememberedCredentials,
  saveLastSession,
  saveRememberedCredentials,
  setBiometricPreference,
} from '../services/biometricAuth';
import { login } from '../services/authApi';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeProvider';
import { UserSession } from '../types/auth';

const logoImage = require('../../assets/logoDTJourney.png');

type LoginScreenProps = {
  onLogin: (session: UserSession) => void;
  onOpenRegister: () => void;
};

export function LoginScreen({ onLogin, onOpenRegister }: LoginScreenProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biometricSession, setBiometricSession] = useState<UserSession | null>(null);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => email.trim().includes('@') && password.trim().length >= 4, [email, password]);

  useEffect(() => {
    let isMounted = true;

    async function loadLoginState() {
      const [enabled, storedSession, rememberedCredentials] = await Promise.all([
        getBiometricPreference(),
        getLastSession(),
        getRememberedCredentials(),
      ]);

      if (!isMounted) {
        return;
      }

      setIsBiometricEnabled(enabled);
      setBiometricSession(storedSession);

      if (rememberedCredentials) {
        setEmail(rememberedCredentials.email);
        setPassword(rememberedCredentials.password);
        setRememberMe(true);
      }
    }

    loadLoginState();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleLogin() {
    if (!canSubmit) {
      setError('Informe um e-mail válido e uma senha com pelo menos 4 caracteres.');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    setError(null);
    setIsSubmitting(true);

    try {
      const session = await login(normalizedEmail, password);

      if (rememberMe) {
        await saveRememberedCredentials({ email: normalizedEmail, password });
      } else {
        await clearRememberedCredentials();
      }

      await saveLastSession(session);
      onLogin(session);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Não foi possível entrar.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleBiometricLogin() {
    if (!biometricSession) {
      setError('Entre com e-mail e senha uma vez antes de usar biometria.');
      return;
    }

    setError(null);
    setIsBiometricLoading(true);

    try {
      const availability = await getBiometricAvailability();

      if (!availability.isAvailable) {
        setIsBiometricEnabled(false);
        await setBiometricPreference(false);
        setError(availability.reason ?? 'Biometria indisponível neste aparelho.');
        return;
      }

      const result = await authenticateWithBiometrics();

      if (result.success) {
        onLogin(biometricSession);
        return;
      }

      setError('Autenticação biométrica cancelada ou não reconhecida.');
    } finally {
      setIsBiometricLoading(false);
    }
  }

  function handleRememberMeChange() {
    const nextValue = !rememberMe;
    setRememberMe(nextValue);

    if (!nextValue) {
      void clearRememberedCredentials();
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <View style={styles.brandBlock}>
              <Image source={logoImage} style={styles.logo} resizeMode="contain" />
            </View>

            <View style={styles.formPanel}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  placeholder="seuemail@exemplo.com"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Senha</Text>
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor={colors.muted}
                  secureTextEntry
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <Pressable style={styles.rememberRow} onPress={handleRememberMeChange}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe ? <Check color={colors.primaryOn} size={16} strokeWidth={3} /> : null}
                </View>
                <Text style={styles.rememberText}>Lembrar de mim</Text>
              </Pressable>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  (!canSubmit || isSubmitting) && styles.primaryButtonDisabled,
                  pressed && canSubmit && !isSubmitting && styles.primaryButtonPressed,
                ]}
                onPress={handleLogin}
                disabled={!canSubmit || isSubmitting}
              >
                <Text style={styles.primaryButtonText}>{isSubmitting ? 'Entrando...' : 'Entrar'}</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
                onPress={onOpenRegister}
              >
                <Text style={styles.secondaryButtonText}>Criar conta</Text>
              </Pressable>

              {isBiometricEnabled ? (
                <Pressable
                  disabled={isBiometricLoading || !biometricSession}
                  style={({ pressed }) => [
                    styles.biometricButton,
                    (!biometricSession || isBiometricLoading) && styles.biometricButtonDisabled,
                    pressed && biometricSession && !isBiometricLoading && styles.biometricButtonPressed,
                  ]}
                  onPress={handleBiometricLogin}
                  accessibilityLabel="Entrar com biometria"
                >
                  <FingerprintPattern color={colors.primary} size={28} strokeWidth={2.5} />
                </Pressable>
              ) : null}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      gap: 28,
      paddingHorizontal: 20,
      paddingVertical: 34,
    },
    brandBlock: {
      alignItems: 'center',
    },
    logo: {
      width: '100%',
      maxWidth: 1000,
      height: 230,
    },
    formPanel: {
      gap: 16,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    fieldGroup: {
      gap: 8,
    },
    label: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    input: {
      minHeight: 52,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.background,
      color: colors.text,
      fontSize: 16,
    },
    rememberRow: {
      minHeight: 36,
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 10,
    },
    checkbox: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 6,
      backgroundColor: colors.background,
    },
    checkboxChecked: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    rememberText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '800',
    },
    errorText: {
      color: colors.danger,
      fontSize: 13,
      fontWeight: '700',
      lineHeight: 19,
    },
    primaryButton: {
      minHeight: 50,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: colors.primary,
    },
    primaryButtonPressed: {
      backgroundColor: colors.primaryDark,
    },
    primaryButtonDisabled: {
      opacity: 0.45,
    },
    primaryButtonText: {
      color: colors.primaryOn,
      fontSize: 16,
      fontWeight: '900',
    },
    secondaryButton: {
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    secondaryButtonPressed: {
      backgroundColor: colors.surfaceAlt,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '900',
    },
    biometricButton: {
      width: 58,
      height: 58,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    biometricButtonPressed: {
      backgroundColor: colors.surfaceAlt,
    },
    biometricButtonDisabled: {
      opacity: 0.45,
    },
  });
}
