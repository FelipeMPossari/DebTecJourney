import { useEffect, useMemo, useState } from 'react';
import { FingerprintPattern } from 'lucide-react-native';
import {
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Pressable,
  SafeAreaView,
  TouchableWithoutFeedback,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  authenticateWithBiometrics,
  getBiometricAvailability,
  getBiometricPreference,
  getLastSession,
  saveLastSession,
  setBiometricPreference,
} from '../services/biometricAuth';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeProvider';
import { UserSession } from '../types/auth';

type LoginScreenProps = {
  onLogin: (session: UserSession) => void;
};

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [biometricSession, setBiometricSession] = useState<UserSession | null>(null);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);

  const canSubmit = useMemo(() => email.trim().includes('@') && password.trim().length >= 4, [email, password]);

  useEffect(() => {
    let isMounted = true;

    async function loadBiometricState() {
      const [enabled, storedSession] = await Promise.all([getBiometricPreference(), getLastSession()]);

      if (isMounted) {
        setIsBiometricEnabled(enabled);
        setBiometricSession(storedSession);
      }
    }

    loadBiometricState();

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
    const displayName = normalizedEmail.split('@')[0] || 'Estudante';

    const session = {
      email: normalizedEmail,
      name: displayName,
    };

    setError(null);
    await saveLastSession(session);
    onLogin(session);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <View style={styles.brandBlock}>
              <Text style={styles.appName}>DebTec Journey</Text>
              <Text style={styles.subtitle}>Entre para continuar sua trilha de dívida técnica.</Text>
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

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  !canSubmit && styles.primaryButtonDisabled,
                  pressed && canSubmit && styles.primaryButtonPressed,
                ]}
                onPress={handleLogin}
              >
                <Text style={styles.primaryButtonText}>Entrar</Text>
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
      gap: 8,
    },
    appName: {
      color: colors.text,
      fontSize: 34,
      fontWeight: '900',
    },
    subtitle: {
      color: colors.muted,
      fontSize: 16,
      lineHeight: 23,
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
