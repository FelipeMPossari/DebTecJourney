import { ReactNode, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BookOpen, Play, Target, Trophy } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MenuButton } from '../components/MenuButton';
import { ModuleCard } from '../components/ModuleCard';
import { ProgressBar } from '../components/ProgressBar';
import { getCourseOverview } from '../services/learningApi';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeProvider';
import { UserSession } from '../types/auth';
import { CourseOverview, LessonPreview } from '../types/learning';

type HomeScreenProps = {
  user: UserSession;
  onOpenMenu: () => void;
  onStartLesson: (lessonId: string) => void;
};

export function HomeScreen({ user, onOpenMenu, onStartLesson }: HomeScreenProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [course, setCourse] = useState<CourseOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const displayName = getDisplayName(user);

  async function loadCourse() {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCourseOverview(user.token);
      setCourse(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Não foi possível carregar sua trilha.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCourse();
  }, [user.token]);

  const currentLesson = useMemo(() => findCurrentLesson(course), [course]);
  const level = course?.currentLevel ?? user.currentLevel;
  const totalXp = course?.totalXp ?? user.totalXp;
  const debtReducedPercent = course?.debtReducedPercent ?? 0;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.stateText}>Carregando trilha</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !course) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <MenuButton onPress={onOpenMenu} />
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Olá, {displayName}</Text>
              <Text style={styles.appName}>DebTec Journey</Text>
            </View>
          </View>

          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{error ?? 'Nenhuma trilha publicada foi encontrada.'}</Text>
            <Pressable style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]} onPress={loadCourse}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <MenuButton onPress={onOpenMenu} />

          <View style={styles.headerText}>
            <Text style={styles.greeting}>Olá, {displayName}</Text>
            <Text style={styles.appName}>{course.title}</Text>
          </View>

          <View style={styles.levelBadge}>
            <Trophy color={colors.accent} size={20} strokeWidth={2.5} />
            <Text style={styles.levelValue}>{level}</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <Metric icon={<Trophy color={colors.accent} size={20} strokeWidth={2.5} />} value={String(totalXp)} label="XP" colors={colors} />
          <Metric
            icon={<BookOpen color={colors.primary} size={20} strokeWidth={2.5} />}
            value={String(course.modules.length)}
            label="Módulos"
            colors={colors}
          />
          <Metric
            icon={<Target color={colors.primary} size={20} strokeWidth={2.5} />}
            value={`${debtReducedPercent}%`}
            label="Progresso"
            colors={colors}
          />
        </View>

        <View style={styles.heroPanel}>
          <View style={styles.heroTop}>
            <Pressable
              disabled={!currentLesson}
              style={({ pressed }) => [
                styles.heroIcon,
                !currentLesson && styles.heroIconDisabled,
                pressed && currentLesson && styles.heroIconPressed,
              ]}
              onPress={() => currentLesson && onStartLesson(currentLesson.id)}
              accessibilityLabel={currentLesson ? 'Iniciar próxima lição' : 'Trilha concluída'}
            >
              <Play color={colors.primaryOn} size={24} fill={colors.primaryOn} strokeWidth={2.4} />
            </Pressable>

            <View style={styles.heroText}>
              <Text style={styles.heroEyebrow}>{currentLesson ? 'Próxima lição' : 'Trilha concluída'}</Text>
              <Text style={styles.heroTitle}>{currentLesson?.title ?? 'Tudo em dia'}</Text>
            </View>
          </View>

          <ProgressBar value={debtReducedPercent / 100} />

          <View style={styles.heroFooter}>
            <Text style={styles.heroMeta}>{currentLesson ? `+${currentLesson.xpReward} XP` : 'Revisões disponíveis nos módulos'}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Módulos</Text>
          <Text style={styles.sectionMeta}>{debtReducedPercent}%</Text>
        </View>

        <View style={styles.moduleList}>
          {course.modules.map((module) => (
            <ModuleCard key={module.id} module={module} onStartLesson={onStartLesson} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type MetricProps = {
  icon: ReactNode;
  value: string;
  label: string;
  colors: AppColors;
};

function Metric({ icon, value, label, colors }: MetricProps) {
  const styles = createStyles(colors);

  return (
    <View style={styles.metricBox}>
      <View style={styles.metricIcon}>{icon}</View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function getDisplayName(user: UserSession) {
  const normalizedName = user.name?.trim();

  if (normalizedName) {
    return normalizedName;
  }

  return user.email.split('@')[0] || 'Estudante';
}

function findCurrentLesson(course: CourseOverview | null): LessonPreview | null {
  if (!course) {
    return null;
  }

  return course.modules.flatMap((module) => module.lessons).find((lesson) => lesson.status === 'available') ?? null;
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      gap: 18,
      paddingHorizontal: 20,
      paddingTop: 22,
      paddingBottom: 34,
    },
    centerState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
      padding: 24,
    },
    stateText: {
      color: colors.muted,
      fontSize: 15,
      fontWeight: '800',
      textAlign: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerText: {
      flex: 1,
      gap: 2,
    },
    greeting: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: '800',
    },
    appName: {
      color: colors.text,
      fontSize: 25,
      fontWeight: '900',
    },
    levelBadge: {
      width: 58,
      height: 58,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    levelValue: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '900',
    },
    metricsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    metricBox: {
      flex: 1,
      minHeight: 92,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      padding: 10,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    metricIcon: {
      width: 30,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    metricValue: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '900',
    },
    metricLabel: {
      color: colors.muted,
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    heroPanel: {
      gap: 16,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surfaceAlt,
    },
    heroTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    heroIcon: {
      width: 54,
      height: 54,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: colors.primary,
    },
    heroIconPressed: {
      backgroundColor: colors.primaryDark,
    },
    heroIconDisabled: {
      opacity: 0.45,
    },
    heroText: {
      flex: 1,
      gap: 4,
    },
    heroEyebrow: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    heroTitle: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '900',
      lineHeight: 28,
    },
    heroFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    heroMeta: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: '800',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '900',
    },
    sectionMeta: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '900',
    },
    moduleList: {
      gap: 12,
    },
    messageBox: {
      gap: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    messageText: {
      color: colors.text,
      fontSize: 15,
      lineHeight: 22,
    },
    retryButton: {
      minHeight: 46,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: colors.primary,
    },
    retryButtonPressed: {
      backgroundColor: colors.primaryDark,
    },
    retryButtonText: {
      color: colors.primaryOn,
      fontSize: 15,
      fontWeight: '900',
    },
  });
}
