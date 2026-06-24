import { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react-native';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { register } from '../services/authApi';
import { saveLastSession } from '../services/biometricAuth';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeProvider';
import { RegisterPayload, UserSession } from '../types/auth';

type RegisterScreenProps = {
  onBack: () => void;
  onRegistered: (session: UserSession) => void;
};

const academicProfiles = [
  'Estudante de Ciência da Computação',
  'Estudante de Engenharia de Software',
  'Profissional iniciante',
];

const experienceLevels = ['Iniciante', 'Intermediário', 'Avançado'];

const learningGoals = [
  'Aprender conceitos de dívida técnica',
  'Apoiar disciplina ou TCC',
  'Aplicar em projetos reais',
];

const dailyGoals = [5, 10, 15];

export function RegisterScreen({ onBack, onRegistered }: RegisterScreenProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [academicProfile, setAcademicProfile] = useState(academicProfiles[0]);
  const [experienceLevel, setExperienceLevel] = useState(experienceLevels[0]);
  const [learningGoal, setLearningGoal] = useState(learningGoals[0]);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      name.trim().length >= 2 &&
      email.trim().includes('@') &&
      password.trim().length >= 4 &&
      password === passwordConfirmation
    );
  }, [email, name, password, passwordConfirmation]);

  async function handleRegister() {
    if (!canSubmit) {
      setError('Revise os dados: nome, e-mail, senha e confirmação precisam estar válidos.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const payload: RegisterPayload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      academicProfile,
      experienceLevel,
      learningGoal,
      dailyGoalMinutes,
    };

    try {
      const session = await register(payload);
      await saveLastSession(session);
      onRegistered(session);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Não foi possível criar sua conta.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]} onPress={onBack}>
                <ArrowLeft color={colors.text} size={22} strokeWidth={2.5} />
              </Pressable>

              <View style={styles.headerText}>
                <Text style={styles.eyebrow}>Nova conta</Text>
                <Text style={styles.title}>Cadastro</Text>
              </View>
            </View>

            <View style={styles.formPanel}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nome</Text>
                <TextInput
                  autoCapitalize="words"
                  placeholder="Seu nome"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                />
              </View>

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

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Confirmar senha</Text>
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor={colors.muted}
                  secureTextEntry
                  style={styles.input}
                  value={passwordConfirmation}
                  onChangeText={setPasswordConfirmation}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Perfil</Text>
              <OptionGroup options={academicProfiles} value={academicProfile} onChange={setAcademicProfile} colors={colors} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Experiência</Text>
              <OptionGroup options={experienceLevels} value={experienceLevel} onChange={setExperienceLevel} colors={colors} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Objetivo</Text>
              <OptionGroup options={learningGoals} value={learningGoal} onChange={setLearningGoal} colors={colors} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Meta diária</Text>
              <View style={styles.goalRow}>
                {dailyGoals.map((goal) => (
                  <Pressable
                    key={goal}
                    style={({ pressed }) => [
                      styles.goalButton,
                      dailyGoalMinutes === goal && styles.optionButtonActive,
                      pressed && dailyGoalMinutes !== goal && styles.optionButtonPressed,
                    ]}
                    onPress={() => setDailyGoalMinutes(goal)}
                  >
                    <Text style={[styles.optionButtonText, dailyGoalMinutes === goal && styles.optionButtonTextActive]}>
                      {goal} min
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              disabled={!canSubmit || isSubmitting}
              style={({ pressed }) => [
                styles.primaryButton,
                (!canSubmit || isSubmitting) && styles.primaryButtonDisabled,
                pressed && canSubmit && !isSubmitting && styles.primaryButtonPressed,
              ]}
              onPress={handleRegister}
            >
              <Text style={styles.primaryButtonText}>{isSubmitting ? 'Criando conta...' : 'Criar conta'}</Text>
            </Pressable>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type OptionGroupProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  colors: AppColors;
};

function OptionGroup({ options, value, onChange, colors }: OptionGroupProps) {
  const styles = createStyles(colors);

  return (
    <View style={styles.optionList}>
      {options.map((option) => {
        const isActive = option === value;

        return (
          <Pressable
            key={option}
            style={({ pressed }) => [
              styles.optionButton,
              isActive && styles.optionButtonActive,
              pressed && !isActive && styles.optionButtonPressed,
            ]}
            onPress={() => onChange(option)}
          >
            <Text style={[styles.optionButtonText, isActive && styles.optionButtonTextActive]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
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
      gap: 18,
      paddingHorizontal: 20,
      paddingTop: 26,
      paddingBottom: 34,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    backButton: {
      width: 46,
      height: 46,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    backButtonPressed: {
      backgroundColor: colors.surfaceAlt,
    },
    headerText: {
      flex: 1,
      gap: 4,
    },
    eyebrow: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    title: {
      color: colors.text,
      fontSize: 30,
      fontWeight: '900',
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
    section: {
      gap: 10,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '900',
    },
    optionList: {
      gap: 10,
    },
    optionButton: {
      minHeight: 48,
      justifyContent: 'center',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    optionButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.selectedSurface,
    },
    optionButtonPressed: {
      backgroundColor: colors.surfaceAlt,
    },
    optionButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '800',
      lineHeight: 20,
    },
    optionButtonTextActive: {
      color: colors.primary,
    },
    goalRow: {
      flexDirection: 'row',
      gap: 10,
    },
    goalButton: {
      flex: 1,
      minHeight: 46,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    errorText: {
      color: colors.danger,
      fontSize: 13,
      fontWeight: '700',
      lineHeight: 19,
    },
    primaryButton: {
      minHeight: 52,
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
  });
}
