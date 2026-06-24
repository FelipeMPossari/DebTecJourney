import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BookOpen, CheckCircle2, ChevronRight, Lock, Play, RotateCcw } from 'lucide-react-native';
import { ProgressBar } from './ProgressBar';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeProvider';
import { LessonPreview, ModulePreview } from '../types/learning';

type ModuleCardProps = {
  module: ModulePreview;
  onStartLesson: (lessonId: string) => void;
};

export function ModuleCard({ module, onStartLesson }: ModuleCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const completedLessons = module.lessons.filter((lesson) => lesson.status === 'completed').length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.moduleIcon}>
          <BookOpen color={colors.primaryOn} size={21} strokeWidth={2.5} />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>{module.title}</Text>
          <Text style={styles.description}>{module.description}</Text>
        </View>

        <Text style={styles.counter}>{completedLessons}/{module.lessons.length}</Text>
      </View>

      <ProgressBar value={module.progress} />

      <View style={styles.lessonList}>
        {module.lessons.map((lesson) => (
          <LessonRow key={lesson.id} lesson={lesson} onStartLesson={onStartLesson} colors={colors} />
        ))}
      </View>
    </View>
  );
}

type LessonRowProps = {
  lesson: LessonPreview;
  onStartLesson: (lessonId: string) => void;
  colors: AppColors;
};

function LessonRow({ lesson, onStartLesson, colors }: LessonRowProps) {
  const styles = createStyles(colors);
  const isLocked = lesson.status === 'locked';
  const isCompleted = lesson.status === 'completed';

  return (
    <Pressable
      disabled={isLocked}
      style={({ pressed }) => [
        styles.lessonRow,
        isCompleted && styles.lessonRowCompleted,
        isLocked && styles.lessonRowLocked,
        pressed && !isLocked && styles.lessonRowPressed,
      ]}
      onPress={() => onStartLesson(lesson.id)}
    >
      <View style={[styles.statusIcon, isCompleted && styles.statusIconCompleted, isLocked && styles.statusIconLocked]}>
        {isCompleted ? (
          <CheckCircle2 color={colors.primary} size={18} strokeWidth={2.6} />
        ) : isLocked ? (
          <Lock color={colors.muted} size={17} strokeWidth={2.5} />
        ) : (
          <Play color={colors.primary} size={17} fill={colors.primary} strokeWidth={2.5} />
        )}
      </View>

      <View style={styles.lessonText}>
        <Text style={[styles.lessonTitle, isLocked && styles.lessonTitleLocked]} numberOfLines={2}>
          {lesson.title}
        </Text>
        <Text style={styles.lessonMeta}>{isCompleted ? 'Revisão' : `+${lesson.xpReward} XP`}</Text>
      </View>

      {isCompleted ? (
        <RotateCcw color={colors.primary} size={18} strokeWidth={2.4} />
      ) : isLocked ? (
        <Lock color={colors.muted} size={17} strokeWidth={2.4} />
      ) : (
        <ChevronRight color={colors.primary} size={20} strokeWidth={2.6} />
      )}
    </Pressable>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    card: {
      gap: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    moduleIcon: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: colors.primaryDark,
    },
    headerText: {
      flex: 1,
      gap: 3,
    },
    title: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '900',
    },
    description: {
      color: colors.muted,
      fontSize: 12,
      lineHeight: 17,
    },
    counter: {
      minWidth: 42,
      color: colors.primary,
      fontSize: 14,
      fontWeight: '900',
      textAlign: 'right',
    },
    lessonList: {
      gap: 8,
    },
    lessonRow: {
      minHeight: 58,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    lessonRowCompleted: {
      borderColor: colors.primary,
      backgroundColor: colors.selectedSurface,
    },
    lessonRowLocked: {
      opacity: 0.55,
    },
    lessonRowPressed: {
      backgroundColor: colors.surfaceAlt,
    },
    statusIcon: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    statusIconCompleted: {
      backgroundColor: colors.successSurface,
    },
    statusIconLocked: {
      backgroundColor: colors.surfaceAlt,
    },
    lessonText: {
      flex: 1,
      gap: 2,
    },
    lessonTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '800',
      lineHeight: 19,
    },
    lessonTitleLocked: {
      color: colors.muted,
    },
    lessonMeta: {
      color: colors.muted,
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
  });
}
