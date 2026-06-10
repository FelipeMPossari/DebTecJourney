import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react-native';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { MenuButton } from '../components/MenuButton';
import { getBiometricAvailability, getBiometricPreference, setBiometricPreference } from '../services/biometricAuth';
import { AppColors, AppThemeName } from '../theme/colors';
import { useTheme } from '../theme/ThemeProvider';
import { UserSession } from '../types/auth';

type SettingsScreenProps = {
  user: UserSession;
  onOpenMenu: () => void;
  onLogout: () => void;
};

export function SettingsScreen({ user, onOpenMenu, onLogout }: SettingsScreenProps) {
  const { colors, themeName, setThemeName } = useTheme();
  const styles = createStyles(colors);
  const [smartReview, setSmartReview] = useState(true);
  const [detailedFeedback, setDetailedFeedback] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(false);
  const [biometricLogin, setBiometricLogin] = useState(false);
  const [biometricMessage, setBiometricMessage] = useState<string | null>(null);

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
            <Text style={styles.avatarText}>{user.name.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.profileName}>{user.name}</Text>
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
          <SettingRow title="Meta diária" description="10 minutos por dia" value="10 min" colors={colors} />
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
          <Text style={styles.sectionTitle}>Experiência</Text>
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
  onChange: (enabled: boolean) => void;
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
        onValueChange={onChange}
      />
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
