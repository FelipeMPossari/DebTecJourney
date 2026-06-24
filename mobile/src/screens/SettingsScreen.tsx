import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MenuButton } from '../components/MenuButton';
import {
  getBiometricAvailability,
  getBiometricPreference,
  saveLastSession,
  setBiometricPreference,
} from '../services/biometricAuth';
import { AppColors, AppThemeName } from '../theme/colors';
import { useTheme } from '../theme/ThemeProvider';
import { UserSession } from '../types/auth';

type SettingsScreenProps = {
  user: UserSession;
  onOpenMenu: () => void;
  onLogout: () => void;
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

export function SettingsScreen({ user, onOpenMenu, onLogout }: SettingsScreenProps) {
  const { colors, themeName, setThemeName } = useTheme();
  const styles = createStyles(colors);
  const [smartReview, setSmartReview] = useState(true);
  const [detailedFeedback, setDetailedFeedback] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(false);
  const [biometricLogin, setBiometricLogin] = useState(false);
  const [biometricMessage, setBiometricMessage] = useState<string | null>(null);
  const dailyGoalMinutes = user.dailyGoalMinutes ?? 10;
  const academicProfile = resolveSelectedOption(user.academicProfile, academicProfiles, academicProfiles[0]);
  const experienceLevel = resolveSelectedOption(user.experienceLevel, experienceLevels, experienceLevels[0]);
  const learningGoal = resolveSelectedOption(user.learningGoal, learningGoals, learningGoals[0]);

  useEffect(() => {
    let isMounted = true;

    async function loadBiometricPreference() {
      const enabled = await getBiometricPreference();

      if (isMounted) {
        setBiometricLogin(enabled);
      }
    }

    loadBiometricPreference();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleBiometricChange(enabled: boolean) {
    setBiometricMessage(null);

    if (!enabled) {
      setBiometricLogin(false);
      await setBiometricPreference(false);
      return;
    }

    const availability = await getBiometricAvailability();

    if (!availability.isAvailable) {
      setBiometricLogin(false);
      setBiometricMessage(availability.reason ?? 'Biometria indisponível neste aparelho.');
      await setBiometricPreference(false);
      return;
    }

    await saveLastSession(user);
    setBiometricLogin(true);
    setBiometricMessage('Biometria habilitada para os próximos logins.');
    await setBiometricPreference(true);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <MenuButton onPress={onOpenMenu} />
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>Conta</Text>
            <Text style={styles.title}>Configurações</Text>
          </View>
        </View>

        <View style={styles.profilePanel}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getDisplayName(user).slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.profileName}>{getDisplayName(user)}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aparência</Text>
          <ThemeSelector value={themeName} onChange={setThemeName} colors={colors} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Segurança</Text>
          <ToggleRow
            title="Entrar com biometria"
            description="Usar digital, rosto ou senha do aparelho na tela de login"
            enabled={biometricLogin}
            onChange={handleBiometricChange}
            colors={colors}
          />
          {biometricMessage ? <Text style={styles.helperText}>{biometricMessage}</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aprendizado</Text>
          <SettingRow
            title="Meta diária"
            description="Tempo planejado para manter sequência"
            value={`${dailyGoalMinutes} min`}
            colors={colors}
          />
          <ToggleRow
            title="Revisão inteligente"
            description="Priorizar conceitos com maior chance de esquecimento"
            enabled={smartReview}
            onChange={setSmartReview}
            colors={colors}
          />
          <ToggleRow
            title="Feedback detalhado"
            description="Mostrar explicação completa depois de cada resposta"
            enabled={detailedFeedback}
            onChange={setDetailedFeedback}
            colors={colors}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificações</Text>
          <ToggleRow
            title="Lembrete diário"
            description="Receber aviso para manter a sequência de estudos"
            enabled={dailyReminder}
            onChange={setDailyReminder}
            colors={colors}
          />
          <SettingRow title="Horário do lembrete" description="Melhor momento para estudar" value="19:00" colors={colors} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perfil de estudo</Text>
          <SelectedOptionGroup title="Perfil" options={academicProfiles} value={academicProfile} colors={colors} />
          <SelectedOptionGroup title="Experiência" options={experienceLevels} value={experienceLevel} colors={colors} />
          <SelectedOptionGroup title="Objetivo" options={learningGoals} value={learningGoal} colors={colors} />
          <SettingRow title="Conteúdo" description="Trilha selecionada" value="Dívida Técnica" colors={colors} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sessão</Text>
          <Pressable style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]} onPress={onLogout}>
            <LogOut color={colors.danger} size={18} strokeWidth={2.5} />
            <Text style={styles.logoutButtonText}>Sair</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getDisplayName(user: UserSession) {
  const normalizedName = user.name?.trim();
  return normalizedName || user.email.split('@')[0] || 'Estudante';
}

function resolveSelectedOption(value: string | undefined, options: string[], fallback: string) {
  const normalizedValue = normalizeLegacyText(value ?? '');
  return options.find((option) => normalizeLegacyText(option) === normalizedValue) ?? fallback;
}

function normalizeLegacyText(value: string) {
  return value
    .trim()
    .replaceAll('CiÃªncia', 'Ciência')
    .replaceAll('ComputaÃ§Ã£o', 'Computação')
    .replaceAll('IntermediÃ¡rio', 'Intermediário')
    .replaceAll('AvanÃ§ado', 'Avançado')
    .replaceAll('dÃ­vida', 'dívida')
    .replaceAll('tÃ©cnica', 'técnica');
}

type ThemeSelectorProps = {
  value: AppThemeName;
  onChange: (themeName: AppThemeName) => void;
  colors: AppColors;
};

function ThemeSelector({ value, onChange, colors }: ThemeSelectorProps) {
  const styles = createStyles(colors);

  return (
    <View style={styles.themePanel}>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>Tema</Text>
        <Text style={styles.settingDescription}>Escolha como o app deve aparecer neste aparelho</Text>
      </View>

      <View style={styles.themeButtons}>
        <ThemeButton label="Claro" themeName="light" activeTheme={value} onChange={onChange} colors={colors} />
        <ThemeButton label="Escuro" themeName="dark" activeTheme={value} onChange={onChange} colors={colors} />
      </View>
    </View>
  );
}

type ThemeButtonProps = {
  label: string;
  themeName: AppThemeName;
  activeTheme: AppThemeName;
  onChange: (themeName: AppThemeName) => void;
  colors: AppColors;
};

function ThemeButton({ label, themeName, activeTheme, onChange, colors }: ThemeButtonProps) {
  const styles = createStyles(colors);
  const isActive = themeName === activeTheme;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.themeButton,
        isActive && styles.themeButtonActive,
        pressed && !isActive && styles.themeButtonPressed,
      ]}
      onPress={() => onChange(themeName)}
    >
      <Text style={[styles.themeButtonText, isActive && styles.themeButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

type SettingRowProps = {
  title: string;
  description: string;
  value: string;
  colors: AppColors;
};

function SettingRow({ title, description, value, colors }: SettingRowProps) {
  const styles = createStyles(colors);

  return (
    <View style={styles.settingRow}>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Text style={styles.settingValue}>{value}</Text>
    </View>
  );
}

type ToggleRowProps = {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void | Promise<void>;
  colors: AppColors;
};

function ToggleRow({ title, description, enabled, onChange, colors }: ToggleRowProps) {
  const styles = createStyles(colors);

  return (
    <View style={styles.settingRow}>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        thumbColor={enabled ? colors.primaryOn : colors.muted}
        trackColor={{ false: colors.surfaceAlt, true: colors.primary }}
        value={enabled}
        onValueChange={(nextValue) => {
          void onChange(nextValue);
        }}
      />
    </View>
  );
}

type SelectedOptionGroupProps = {
  title: string;
  options: string[];
  value: string;
  colors: AppColors;
};

function SelectedOptionGroup({ title, options, value, colors }: SelectedOptionGroupProps) {
  const styles = createStyles(colors);

  return (
    <View style={styles.optionPanel}>
      <Text style={styles.settingTitle}>{title}</Text>
      <View style={styles.optionList}>
        {options.map((option) => {
          const isActive = option === value;

          return (
            <View key={option} style={[styles.optionChip, isActive && styles.optionChipActive]}>
              <Text style={[styles.optionChipText, isActive && styles.optionChipTextActive]}>{option}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      gap: 20,
      paddingHorizontal: 20,
      paddingTop: 26,
      paddingBottom: 34,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
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
      fontSize: 28,
      fontWeight: '900',
    },
    profilePanel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    avatar: {
      width: 52,
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: colors.primary,
    },
    avatarText: {
      color: colors.primaryOn,
      fontSize: 24,
      fontWeight: '900',
    },
    profileText: {
      flex: 1,
      gap: 4,
    },
    profileName: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '900',
    },
    profileEmail: {
      color: colors.muted,
      fontSize: 13,
    },
    section: {
      gap: 10,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '900',
    },
    themePanel: {
      gap: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    themeButtons: {
      flexDirection: 'row',
      gap: 10,
    },
    themeButton: {
      flex: 1,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    themeButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.selectedSurface,
    },
    themeButtonPressed: {
      backgroundColor: colors.surfaceAlt,
    },
    themeButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '900',
    },
    themeButtonTextActive: {
      color: colors.primary,
    },
    settingRow: {
      minHeight: 76,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    settingText: {
      flex: 1,
      gap: 4,
    },
    settingTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '900',
    },
    settingDescription: {
      color: colors.muted,
      fontSize: 13,
      lineHeight: 18,
    },
    settingValue: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '900',
    },
    helperText: {
      color: colors.muted,
      fontSize: 13,
      lineHeight: 18,
    },
    optionPanel: {
      gap: 10,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    optionList: {
      gap: 8,
    },
    optionChip: {
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    optionChipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.selectedSurface,
    },
    optionChipText: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: '800',
      lineHeight: 18,
    },
    optionChipTextActive: {
      color: colors.primary,
    },
    logoutButton: {
      minHeight: 54,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    logoutButtonPressed: {
      backgroundColor: colors.surfaceAlt,
    },
    logoutButtonText: {
      color: colors.danger,
      fontSize: 15,
      fontWeight: '900',
    },
  });
}
