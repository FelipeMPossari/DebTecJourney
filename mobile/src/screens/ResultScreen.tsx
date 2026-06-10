import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from '../components/ProgressBar';
import { ScreenHeader } from '../components/ScreenHeader';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeProvider';
import { AnswerResult, Lesson } from '../types/learning';

type ResultScreenProps = {
  lesson: Lesson;
  result: AnswerResult;
  onBackHome: () => void;
};

export function ResultScreen({ lesson, result, onBackHome }: ResultScreenProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const earnedXp = lesson.xpReward + result.xpEarned;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <ScreenHeader title="Lição concluída" eyebrow="Resultado" />

        <View style={styles.resultCard}>
          <Text style={styles.status}>{result.isCorrect ? 'Muito bem!' : 'Boa tentativa'}</Text>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.copy}>
            {result.isCorrect
              ? 'Você reduziu um pouco da dívida técnica do projeto e avançou na trilha.'
              : 'Você ainda avançou na lição. Revise o feedback e tente consolidar o conceito.'}
          </Text>

          <View style={styles.xpBox}>
            <Text style={styles.xpValue}>+{earnedXp}</Text>
            <Text style={styles.xpLabel}>XP total da lição</Text>
          </View>

          <View style={styles.progressBlock}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Dívida reduzida</Text>
              <Text style={styles.progressValue}>{result.isCorrect ? '24%' : '20%'}</Text>
            </View>
            <ProgressBar value={result.isCorrect ? 0.24 : 0.2} />
          </View>

          <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]} onPress={onBackHome}>
            <Text style={styles.primaryButtonText}>Voltar para trilha</Text>
          </Pressable>
        </View>
      </View>
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
      flex: 1,
      gap: 20,
      paddingHorizontal: 20,
      paddingTop: 26,
      paddingBottom: 34,
    },
    resultCard: {
      flex: 1,
      justifyContent: 'center',
      gap: 18,
      padding: 20,
      borderRadius: 8,
      backgroundColor: colors.surfaceAlt,
    },
    status: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    title: {
      color: colors.text,
      fontSize: 30,
      fontWeight: '900',
    },
    copy: {
      color: colors.muted,
      fontSize: 16,
      lineHeight: 23,
    },
    xpBox: {
      alignItems: 'center',
      gap: 4,
      paddingVertical: 22,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    xpValue: {
      color: colors.accent,
      fontSize: 42,
      fontWeight: '900',
    },
    xpLabel: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    progressBlock: {
      gap: 10,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    progressLabel: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '900',
    },
    progressValue: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '900',
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
    primaryButtonText: {
      color: colors.primaryOn,
      fontSize: 16,
      fontWeight: '900',
    },
  });
}
