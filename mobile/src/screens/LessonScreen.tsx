import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from '../components/ProgressBar';
import { ScreenHeader } from '../components/ScreenHeader';
import { answerQuestion, getLesson } from '../services/learningApi';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeProvider';
import { AnswerResult, Lesson, LessonPage } from '../types/learning';

type LessonScreenProps = {
  lessonId: string;
  onBack: () => void;
  onFinished: (lesson: Lesson, result: AnswerResult) => void;
};

export function LessonScreen({ lessonId, onBack, onFinished }: LessonScreenProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadLesson() {
      try {
        setIsLoading(true);
        setError(null);
        setCurrentPageIndex(0);
        setSelectedAnswerId(null);
        setAnswerResult(null);

        const data = await getLesson(lessonId);

        if (isMounted) {
          setLesson(data);
        }
      } catch {
        if (isMounted) {
          setError('Não foi possível carregar a lição. Verifique se a API está rodando e se o adb reverse da porta 5228 foi configurado.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadLesson();

    return () => {
      isMounted = false;
    };
  }, [lessonId]);

  async function handleSubmit() {
    const question = lesson?.questions[0];

    if (!question || !selectedAnswerId) {
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await answerQuestion(question.id, selectedAnswerId);
      setAnswerResult(result);
    } catch {
      setError('Não foi possível enviar sua resposta. Confira a conexão com a API e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.stateText}>Carregando lição...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !lesson) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <ScreenHeader title="Algo travou" eyebrow="Conexão" onBack={onBack} />
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{error ?? 'Lição não encontrada.'}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const loadedLesson = lesson;
  const pages = getLessonPages(loadedLesson);
  const isQuizStep = currentPageIndex >= pages.length;
  const totalSteps = pages.length + 1;
  const currentStep = isQuizStep ? totalSteps : currentPageIndex + 1;
  const progress = currentStep / totalSteps;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title={loadedLesson.title} eyebrow={isQuizStep ? 'Desafio final' : 'Lição'} onBack={onBack} />

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>{isQuizStep ? 'Quiz desbloqueado' : `Página ${currentPageIndex + 1} de ${pages.length}`}</Text>
            <Text style={styles.progressValue}>{currentStep}/{totalSteps}</Text>
          </View>
          <ProgressBar value={progress} />
        </View>

        {isQuizStep ? renderQuiz(loadedLesson, pages) : renderPage(pages[currentPageIndex], pages)}
      </ScrollView>
    </SafeAreaView>
  );

  function renderPage(page: LessonPage, pages: LessonPage[]) {
    const isFirstPage = currentPageIndex === 0;
    const isLastPage = currentPageIndex === pages.length - 1;

    return (
      <View style={styles.lessonCard}>
        <Text style={styles.sectionLabel}>Conteúdo</Text>
        <Text style={styles.pageTitle}>{page.title}</Text>
        <Text style={styles.contentText}>{page.body}</Text>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightLabel}>Ponto-chave</Text>
          <Text style={styles.highlightText}>{page.highlight}</Text>
        </View>

        <View style={styles.navRow}>
          <Pressable
            disabled={isFirstPage}
            style={({ pressed }) => [
              styles.secondaryButton,
              isFirstPage && styles.disabledButton,
              pressed && !isFirstPage && styles.secondaryButtonPressed,
            ]}
            onPress={() => setCurrentPageIndex((index) => Math.max(index - 1, 0))}
          >
            <Text style={styles.secondaryButtonText}>Anterior</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
            onPress={() => setCurrentPageIndex((index) => (isLastPage ? pages.length : index + 1))}
          >
            <Text style={styles.primaryButtonText}>{isLastPage ? 'Ir para o quiz' : 'Próxima'}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function renderQuiz(loadedLesson: Lesson, pages: LessonPage[]) {
    const question = loadedLesson.questions[0];

    return (
      <View style={styles.quizCard}>
        <Text style={styles.quizLabel}>Desafio rápido</Text>
        <Text style={styles.question}>{question.statement}</Text>

        <View style={styles.options}>
          {question.answerOptions.map((option) => {
            const isSelected = option.id === selectedAnswerId;

            return (
              <Pressable
                key={option.id}
                disabled={Boolean(answerResult)}
                style={({ pressed }) => [
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected,
                  pressed && !answerResult && styles.optionButtonPressed,
                ]}
                onPress={() => setSelectedAnswerId(option.id)}
              >
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option.text}</Text>
              </Pressable>
            );
          })}
        </View>

        {answerResult ? (
          <View style={[styles.feedbackBox, answerResult.isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <Text style={styles.feedbackTitle}>{answerResult.isCorrect ? 'Resposta correta' : 'Quase lá'}</Text>
            <Text style={styles.feedbackText}>{answerResult.feedback}</Text>
            <Text style={styles.explanationText}>{answerResult.explanation}</Text>
          </View>
        ) : null}

        <View style={styles.navRow}>
          <Pressable
            disabled={Boolean(answerResult)}
            style={({ pressed }) => [
              styles.secondaryButton,
              Boolean(answerResult) && styles.disabledButton,
              pressed && !answerResult && styles.secondaryButtonPressed,
            ]}
            onPress={() => setCurrentPageIndex(Math.max(pages.length - 1, 0))}
          >
            <Text style={styles.secondaryButtonText}>Revisar</Text>
          </Pressable>

          {answerResult ? (
            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
              onPress={() => onFinished(loadedLesson, answerResult)}
            >
              <Text style={styles.primaryButtonText}>Ver resultado</Text>
            </Pressable>
          ) : (
            <Pressable
              disabled={!selectedAnswerId || isSubmitting}
              style={({ pressed }) => [
                styles.primaryButton,
                (!selectedAnswerId || isSubmitting) && styles.disabledButton,
                pressed && selectedAnswerId && !isSubmitting && styles.primaryButtonPressed,
              ]}
              onPress={handleSubmit}
            >
              <Text style={styles.primaryButtonText}>{isSubmitting ? 'Enviando...' : 'Responder'}</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }
}

function getLessonPages(lesson: Lesson): LessonPage[] {
  if (lesson.pages.length > 0) {
    return [...lesson.pages].sort((left, right) => left.order - right.order);
  }

  return [
    {
      id: `${lesson.id}-fallback-page`,
      lessonId: lesson.id,
      title: lesson.summary,
      body: lesson.content,
      highlight: 'Complete a leitura para desbloquear o quiz.',
      order: 1,
    },
  ];
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
      paddingTop: 26,
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
      textAlign: 'center',
    },
    messageBox: {
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
    progressCard: {
      gap: 10,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    progressLabel: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    progressValue: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '900',
    },
    lessonCard: {
      gap: 16,
      padding: 18,
      borderRadius: 8,
      backgroundColor: colors.surfaceAlt,
    },
    sectionLabel: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    pageTitle: {
      color: colors.text,
      fontSize: 26,
      fontWeight: '900',
      lineHeight: 32,
    },
    contentText: {
      color: colors.muted,
      fontSize: 16,
      lineHeight: 25,
    },
    highlightBox: {
      gap: 6,
      padding: 14,
      borderLeftWidth: 4,
      borderLeftColor: colors.accent,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    highlightLabel: {
      color: colors.accent,
      fontSize: 11,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    highlightText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '800',
      lineHeight: 22,
    },
    quizCard: {
      gap: 16,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    quizLabel: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    question: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '900',
      lineHeight: 27,
    },
    options: {
      gap: 10,
    },
    optionButton: {
      minHeight: 56,
      justifyContent: 'center',
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    optionButtonSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.selectedSurface,
    },
    optionButtonPressed: {
      backgroundColor: colors.surfaceAlt,
    },
    optionText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
      lineHeight: 21,
    },
    optionTextSelected: {
      color: colors.text,
    },
    feedbackBox: {
      gap: 8,
      padding: 14,
      borderRadius: 8,
    },
    feedbackCorrect: {
      backgroundColor: colors.successSurface,
    },
    feedbackWrong: {
      backgroundColor: colors.dangerSurface,
    },
    feedbackTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '900',
    },
    feedbackText: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 20,
    },
    explanationText: {
      color: colors.muted,
      fontSize: 13,
      lineHeight: 19,
    },
    navRow: {
      flexDirection: 'row',
      gap: 10,
    },
    primaryButton: {
      flex: 1,
      minHeight: 50,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: colors.primary,
    },
    primaryButtonPressed: {
      backgroundColor: colors.primaryDark,
    },
    secondaryButton: {
      flex: 1,
      minHeight: 50,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    secondaryButtonPressed: {
      backgroundColor: colors.surface,
    },
    disabledButton: {
      opacity: 0.45,
    },
    primaryButtonText: {
      color: colors.primaryOn,
      fontSize: 15,
      fontWeight: '900',
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '900',
    },
  });
}
