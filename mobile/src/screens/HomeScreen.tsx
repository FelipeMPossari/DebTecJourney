import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MenuButton } from '../components/MenuButton';
import { ModuleCard } from '../components/ModuleCard';
import { ProgressBar } from '../components/ProgressBar';
import { demoCourse } from '../data/demoCourse';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeProvider';
import { UserSession } from '../types/auth';

type HomeScreenProps = {
  user: UserSession;
  onOpenMenu: () => void;
  onStartLesson: (lessonId: string) => void;
};

export function HomeScreen({ user, onOpenMenu, onStartLesson }: HomeScreenProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const currentLesson = demoCourse.modules[0].lessons[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <MenuButton onPress={onOpenMenu} />

          <View style={styles.headerText}>
            <Text style={styles.appName}>DebTec Journey</Text>
            <Text style={styles.subtitle}>Olá, {user.name} · Trilha atual: {demoCourse.title}</Text>
          </View>

          <View style={styles.levelBadge}>
            <Text style={styles.levelLabel}>Nível</Text>
            <Text style={styles.levelValue}>1</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>120</Text>
            <Text style={styles.metricLabel}>XP</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>3</Text>
            <Text style={styles.metricLabel}>dias</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>18%</Text>
            <Text style={styles.metricLabel}>dívida reduzida</Text>
          </View>
        </View>

        <View style={styles.currentLesson}>
          <View style={styles.lessonHeader}>
            <View style={styles.lessonHeaderText}>
              <Text style={styles.sectionLabel}>Próxima lição</Text>
              <Text style={styles.lessonTitle}>{currentLesson.title}</Text>
            </View>
            <Text style={styles.xpPill}>+{currentLesson.xpReward} XP</Text>
          </View>

          <Text style={styles.lessonCopy}>
            Entenda como uma decisão rápida pode criar custo futuro de manutenção e evolução.
          </Text>

          <ProgressBar value={0.34} />

          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
            onPress={() => onStartLesson(currentLesson.id)}
          >
            <Text style={styles.primaryButtonText}>Iniciar lição</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Módulos</Text>
          <View style={styles.moduleList}>
            {demoCourse.modules.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      gap: 22,
      paddingHorizontal: 20,
      paddingTop: 26,
      paddingBottom: 34,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    headerText: {
      flex: 1,
    },
    appName: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '900',
    },
    subtitle: {
      marginTop: 4,
      color: colors.muted,
      fontSize: 14,
      lineHeight: 20,
    },
    levelBadge: {
      width: 68,
      minHeight: 68,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    levelLabel: {
      color: colors.muted,
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    levelValue: {
      color: colors.accent,
      fontSize: 28,
      fontWeight: '900',
    },
    metricsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    metricBox: {
      flex: 1,
      minHeight: 86,
      justifyContent: 'center',
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    metricValue: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '900',
    },
    metricLabel: {
      marginTop: 4,
      color: colors.muted,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    currentLesson: {
      gap: 16,
      padding: 18,
      borderRadius: 8,
      backgroundColor: colors.surfaceAlt,
    },
    lessonHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },
    lessonHeaderText: {
      flex: 1,
    },
    sectionLabel: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    lessonTitle: {
      marginTop: 4,
      color: colors.text,
      fontSize: 24,
      fontWeight: '900',
    },
    xpPill: {
      minWidth: 70,
      paddingHorizontal: 10,
      paddingVertical: 7,
      overflow: 'hidden',
      borderRadius: 8,
      color: colors.accentOn,
      backgroundColor: colors.accent,
      fontSize: 13,
      fontWeight: '900',
      textAlign: 'center',
    },
    lessonCopy: {
      color: colors.muted,
      fontSize: 15,
      lineHeight: 22,
    },
    primaryButton: {
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: colors.primary,
    },
    primaryButtonPressed: {
      backgroundColor: colors.primaryDark,
    },
    primaryButtonText: {
      color: colors.primaryOn,
      fontSize: 16,
      fontWeight: '900',
    },
    section: {
      gap: 12,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '900',
    },
    moduleList: {
      gap: 12,
    },
  });
}
