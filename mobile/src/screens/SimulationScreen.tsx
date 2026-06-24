import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  CircleQuestionMark,
  Coins,
  Gamepad2,
  RotateCcw,
  ShieldCheck,
  TriangleAlert,
  UsersRound,
  X,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MenuButton } from '../components/MenuButton';
import {
  initialSimulationAttributes,
  simulationEvents,
  SimulationAttributeKey,
  SimulationAttributes,
  SimulationEffect,
  SimulationEvent,
} from '../data/simulationEvents';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeProvider';

type SimulationScreenProps = {
  onOpenMenu: () => void;
};

type Decision = 'accept' | 'reject';

type Outcome = {
  decision: Decision;
  text: string;
};

type SimulationResult = {
  tone: 'success' | 'danger';
  title: string;
  message: string;
};

type AttributeDefinition = {
  key: SimulationAttributeKey;
  label: string;
  icon: LucideIcon;
  fillColor: string;
};

const maxRounds = 20;
const swipeThreshold = 110;
const iconFrameSize = 42;
const baseDeadlineDecay = 3;
const simulationTutorialStorageKey = '@DebTecJourney:simulation-tutorial-seen';

const tutorialPages: Array<{ title: string; text: string; icon: LucideIcon }> = [
  {
    title: 'Você lidera um projeto em andamento',
    text:
      'A simulação coloca você no papel de quem precisa tomar decisões técnicas sob pressão. Cada carta traz uma situação comum em projetos de software com dívida técnica.',
    icon: Gamepad2,
  },
  {
    title: 'Leia os sinais do projeto',
    text:
      'Prazo, qualidade e moral do time ficam perigosos quando esvaziam. Custo e dívida técnica ficam perigosos quando enchem. Os ícones mostram uma estimativa visual, sem números exatos.',
    icon: ShieldCheck,
  },
  {
    title: 'Arraste para decidir',
    text:
      'Arraste a carta para a direita para seguir com a ação ou para a esquerda para rejeitar. Toda escolha consome tempo, e algumas decisões ainda reduzem o prazo extra.',
    icon: ArrowRight,
  },
];

export function SimulationScreen({ onOpenMenu }: SimulationScreenProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const position = useRef(new Animated.ValueXY()).current;
  const isResolvingRef = useRef(false);
  const [attributes, setAttributes] = useState<SimulationAttributes>(initialSimulationAttributes);
  const [round, setRound] = useState(1);
  const [currentEvent, setCurrentEvent] = useState<SimulationEvent>(() => pickRandomEvent());
  const [lastOutcome, setLastOutcome] = useState<Outcome | null>(null);
  const [recentChanges, setRecentChanges] = useState<SimulationEffect>({});
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isTutorialVisible, setIsTutorialVisible] = useState(false);
  const [tutorialPageIndex, setTutorialPageIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadTutorialPreference() {
      try {
        const storedPreference = await AsyncStorage.getItem(simulationTutorialStorageKey);

        if (isMounted && storedPreference !== 'seen') {
          setIsTutorialVisible(true);
        }
      } catch {
        if (isMounted) {
          setIsTutorialVisible(true);
        }
      }
    }

    loadTutorialPreference();

    return () => {
      isMounted = false;
    };
  }, []);

  const rotate = position.x.interpolate({
    inputRange: [-220, 0, 220],
    outputRange: ['-9deg', '0deg', '9deg'],
    extrapolate: 'clamp',
  });

  const acceptOpacity = position.x.interpolate({
    inputRange: [0, swipeThreshold],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const rejectOpacity = position.x.interpolate({
    inputRange: [-swipeThreshold, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !simulationResult,
    onMoveShouldSetPanResponder: (_, gesture) => !simulationResult && Math.abs(gesture.dx) > 8,
    onPanResponderMove: (_, gesture) => {
      if (!simulationResult && !isResolvingRef.current) {
        position.setValue({ x: gesture.dx, y: gesture.dy * 0.18 });
      }
    },
    onPanResponderRelease: (_, gesture) => {
      if (simulationResult || isResolvingRef.current) {
        resetCardPosition();
        return;
      }

      if (gesture.dx > swipeThreshold) {
        resolveDecision('accept');
        return;
      }

      if (gesture.dx < -swipeThreshold) {
        resolveDecision('reject');
        return;
      }

      resetCardPosition();
    },
  });

  function resetCardPosition() {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 6,
      tension: 68,
      useNativeDriver: false,
    }).start();
  }

  function resolveDecision(decision: Decision) {
    isResolvingRef.current = true;
    const direction = decision === 'accept' ? 1 : -1;

    Animated.timing(position, {
      toValue: { x: direction * 520, y: 24 },
      duration: 180,
      useNativeDriver: false,
    }).start(() => {
      applyDecision(decision);
      position.setValue({ x: 0, y: 0 });
      isResolvingRef.current = false;
    });
  }

  function applyDecision(decision: Decision) {
    const effects = decision === 'accept' ? currentEvent.acceptEffects : currentEvent.rejectEffects;
    const appliedEffects = applyEffects(attributes, effects);
    const nextAttributes = appliedEffects.attributes;
    const nextRound = round + 1;
    const result = evaluateResult(nextAttributes, nextRound);

    setAttributes(nextAttributes);
    setRecentChanges(appliedEffects.changes);
    setLastOutcome({
      decision,
      text: decision === 'accept' ? currentEvent.acceptOutcome : currentEvent.rejectOutcome,
    });
    setRound(nextRound);
    setSimulationResult(result);

    if (!result) {
      setCurrentEvent(pickRandomEvent(currentEvent.id));
    }
  }

  function resetSimulation() {
    position.setValue({ x: 0, y: 0 });
    isResolvingRef.current = false;
    setAttributes(initialSimulationAttributes);
    setRound(1);
    setCurrentEvent(pickRandomEvent(currentEvent.id));
    setLastOutcome(null);
    setRecentChanges({});
    setSimulationResult(null);
  }

  function openTutorial() {
    setTutorialPageIndex(0);
    setIsTutorialVisible(true);
  }

  async function closeTutorial() {
    setIsTutorialVisible(false);
    setTutorialPageIndex(0);

    try {
      await AsyncStorage.setItem(simulationTutorialStorageKey, 'seen');
    } catch {
      // O tutorial pode ser fechado mesmo se a preferência local não for persistida.
    }
  }

  function advanceTutorial() {
    if (tutorialPageIndex === tutorialPages.length - 1) {
      void closeTutorial();
      return;
    }

    setTutorialPageIndex((currentPage) => currentPage + 1);
  }

  const attributeDefinitions = getAttributeDefinitions(colors);
  const tutorialPage = tutorialPages[tutorialPageIndex];
  const TutorialIcon = tutorialPage.icon;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.header}>
          <MenuButton onPress={onOpenMenu} />

          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>Simulação</Text>
            <Text style={styles.title}>Projeto sob pressão</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.helpButton, pressed && styles.helpButtonPressed]}
            onPress={openTutorial}
            accessibilityLabel="Ver tutorial da simulação"
          >
            <CircleQuestionMark color={colors.text} size={22} strokeWidth={2.5} />
          </Pressable>

          <View style={styles.roundBadge}>
            <Gamepad2 color={colors.primary} size={20} strokeWidth={2.5} />
            <Text style={styles.roundText}>{Math.min(round, maxRounds)}</Text>
          </View>
        </View>

        {isTutorialVisible ? (
          <View style={styles.tutorialPanel}>
            <View style={styles.tutorialIcon}>
              <TutorialIcon color={colors.primary} size={34} strokeWidth={2.4} />
            </View>
            <Text style={styles.tutorialTitle}>{tutorialPage.title}</Text>
            <Text style={styles.tutorialText}>{tutorialPage.text}</Text>

            <View style={styles.tutorialDots}>
              {tutorialPages.map((page, index) => (
                <View key={page.title} style={[styles.tutorialDot, index === tutorialPageIndex && styles.tutorialDotActive]} />
              ))}
            </View>

            <View style={styles.tutorialActions}>
              <Pressable
                disabled={tutorialPageIndex === 0}
                style={({ pressed }) => [
                  styles.tutorialSecondaryButton,
                  tutorialPageIndex === 0 && styles.tutorialButtonDisabled,
                  pressed && tutorialPageIndex > 0 && styles.tutorialSecondaryButtonPressed,
                ]}
                onPress={() => setTutorialPageIndex((currentPage) => Math.max(0, currentPage - 1))}
              >
                <ArrowLeft color={tutorialPageIndex === 0 ? colors.muted : colors.text} size={18} strokeWidth={2.6} />
                <Text style={[styles.tutorialSecondaryButtonText, tutorialPageIndex === 0 && styles.tutorialButtonTextDisabled]}>Voltar</Text>
              </Pressable>

              <Pressable style={({ pressed }) => [styles.tutorialPrimaryButton, pressed && styles.tutorialPrimaryButtonPressed]} onPress={advanceTutorial}>
                <Text style={styles.tutorialPrimaryButtonText}>{tutorialPageIndex === tutorialPages.length - 1 ? 'Começar' : 'Próximo'}</Text>
                <ArrowRight color={colors.primaryOn} size={18} strokeWidth={2.6} />
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.attributeBar}>
              {attributeDefinitions.map((attribute) => (
                <AttributeMeter
                  key={attribute.key}
                  definition={attribute}
                  value={attributes[attribute.key]}
                  change={recentChanges[attribute.key]}
                  colors={colors}
                />
              ))}
            </View>

            <View style={styles.arena}>
              {simulationResult ? (
                <View style={[styles.resultPanel, simulationResult.tone === 'danger' && styles.resultPanelDanger]}>
                  <View style={styles.resultIcon}>
                    <Gamepad2 color={simulationResult.tone === 'danger' ? colors.danger : colors.primary} size={32} strokeWidth={2.4} />
                  </View>
                  <Text style={styles.resultTitle}>{simulationResult.title}</Text>
                  <Text style={styles.resultMessage}>{simulationResult.message}</Text>
                  <Pressable style={({ pressed }) => [styles.resetButton, pressed && styles.resetButtonPressed]} onPress={resetSimulation}>
                    <RotateCcw color={colors.primaryOn} size={18} strokeWidth={2.6} />
                    <Text style={styles.resetButtonText}>Recomeçar</Text>
                  </Pressable>
                </View>
              ) : (
                <Animated.View
                  {...panResponder.panHandlers}
                  style={[
                    styles.card,
                    {
                      transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }],
                    },
                  ]}
                >
                  <Text style={styles.cardEyebrow}>Decisão técnica</Text>
                  <Text style={styles.cardTitle}>{currentEvent.title}</Text>
                  <Text style={styles.cardContext}>{currentEvent.context}</Text>

                  <View style={styles.cardChoices}>
                    <View style={styles.choiceBlock}>
                      <View style={[styles.choiceIcon, styles.choiceIconReject]}>
                        <ArrowLeft color={colors.danger} size={18} strokeWidth={2.6} />
                      </View>
                      <Text style={styles.choiceBlockText}>{currentEvent.rejectLabel}</Text>
                    </View>
                    <View style={styles.choiceDivider} />
                    <View style={styles.choiceBlock}>
                      <View style={[styles.choiceIcon, styles.choiceIconAccept]}>
                        <ArrowRight color={colors.primary} size={18} strokeWidth={2.6} />
                      </View>
                      <Text style={styles.choiceBlockText}>{currentEvent.acceptLabel}</Text>
                    </View>
                  </View>

                  <Animated.View pointerEvents="none" style={[styles.cardDecisionTint, styles.acceptDecisionTint, { opacity: acceptOpacity }]}>
                    <Check color={colors.primaryOn} size={76} strokeWidth={2.6} />
                  </Animated.View>
                  <Animated.View pointerEvents="none" style={[styles.cardDecisionTint, styles.rejectDecisionTint, { opacity: rejectOpacity }]}>
                    <X color={colors.white} size={76} strokeWidth={2.6} />
                  </Animated.View>
                </Animated.View>
              )}
            </View>

            {lastOutcome ? (
              <View style={styles.outcomeBox}>
                <Text style={[styles.outcomeLabel, lastOutcome.decision === 'accept' ? styles.acceptText : styles.rejectText]}>Impacto da decisão</Text>
                <Text style={styles.outcomeText}>{lastOutcome.text}</Text>
              </View>
            ) : null}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

type AttributeMeterProps = {
  definition: AttributeDefinition;
  value: number;
  change: number | undefined;
  colors: AppColors;
};

function AttributeMeter({ definition, value, change, colors }: AttributeMeterProps) {
  const styles = createStyles(colors);
  const Icon = definition.icon;
  const clampedValue = clamp(value, 0, 100);
  const rawFillHeight = (iconFrameSize * clampedValue) / 100;
  const fillHeight = clampedValue === 0 ? 0 : Math.max(3, rawFillHeight);
  const tone = getChangeTone(definition.key, change);

  return (
    <View style={[styles.attributeItem, tone === 'good' && styles.attributeItemGood, tone === 'bad' && styles.attributeItemBad]}>
      <View style={styles.attributeIconFrame}>
        <Icon color={colors.border} size={32} strokeWidth={2.35} />
        <View style={[styles.attributeFillMask, { height: fillHeight }]}>
          <View style={styles.attributeFillIcon}>
            <Icon color={definition.fillColor} size={32} strokeWidth={2.55} />
          </View>
        </View>
      </View>
      <Text style={styles.attributeLabel} numberOfLines={1}>
        {definition.label}
      </Text>
    </View>
  );
}

function getAttributeDefinitions(colors: AppColors): AttributeDefinition[] {
  return [
    { key: 'deadline', label: 'Prazo', icon: CalendarClock, fillColor: colors.accent },
    { key: 'cost', label: 'Custo', icon: Coins, fillColor: '#2f9dff' },
    { key: 'quality', label: 'Qualid.', icon: ShieldCheck, fillColor: colors.primary },
    { key: 'morale', label: 'Time', icon: UsersRound, fillColor: '#b66cff' },
    { key: 'debt', label: 'Dívida', icon: TriangleAlert, fillColor: colors.danger },
  ];
}

function pickRandomEvent(previousId?: string) {
  const availableEvents = previousId ? simulationEvents.filter((event) => event.id !== previousId) : simulationEvents;
  return availableEvents[Math.floor(Math.random() * availableEvents.length)];
}

function applyEffects(attributes: SimulationAttributes, effects: SimulationEffect) {
  const nextAttributes = { ...attributes };
  const rawChanges: SimulationEffect = { deadline: -baseDeadlineDecay };
  const changes: SimulationEffect = {};

  (Object.entries(effects) as Array<[SimulationAttributeKey, number]>).forEach(([key, effect]) => {
    const normalizedEffect = key === 'deadline' ? Math.min(effect, 0) : effect;
    const variance = normalizedEffect === 0 || key === 'deadline' ? 0 : Math.floor(Math.random() * 3) - 1;
    rawChanges[key] = (rawChanges[key] ?? 0) + normalizedEffect + variance;
  });

  (Object.entries(rawChanges) as Array<[SimulationAttributeKey, number]>).forEach(([key, rawChange]) => {
    const previousValue = nextAttributes[key];
    const nextValue = clamp(previousValue + rawChange, 0, 100);
    nextAttributes[key] = nextValue;
    changes[key] = nextValue - previousValue;
  });

  return { attributes: nextAttributes, changes };
}

function evaluateResult(attributes: SimulationAttributes, nextRound: number): SimulationResult | null {
  const collapseResult = getCollapseResult(attributes);

  if (collapseResult) {
    return collapseResult;
  }

  if (nextRound > maxRounds) {
    return {
      tone: 'success',
      title: 'Entrega sustentada',
      message: 'O projeto chegou ao fim com seus principais indicadores vivos. Nem tudo ficou perfeito, mas a dívida seguiu sob controle.',
    };
  }

  return null;
}

function getCollapseResult(attributes: SimulationAttributes): SimulationResult | null {
  if (attributes.deadline <= 0) {
    return {
      tone: 'danger',
      title: 'Prazo estourado',
      message: 'O cronograma colapsou antes de o produto chegar a uma versão entregável.',
    };
  }

  if (attributes.cost >= 100) {
    return {
      tone: 'danger',
      title: 'Custo fora de controle',
      message: 'O projeto ficou caro demais para sustentar a entrega no cenário atual.',
    };
  }

  if (attributes.quality <= 0) {
    return {
      tone: 'danger',
      title: 'Qualidade em crise',
      message: 'A experiência ficou instável demais para seguir como uma entrega confiável.',
    };
  }

  if (attributes.morale <= 0) {
    return {
      tone: 'danger',
      title: 'Time esgotado',
      message: 'A equipe perdeu motivação e energia para continuar tomando boas decisões técnicas.',
    };
  }

  if (attributes.debt >= 100) {
    return {
      tone: 'danger',
      title: 'Dívida impagável',
      message: 'A dívida técnica tomou o projeto. Cada mudança ficou cara demais para sustentar a entrega.',
    };
  }

  return null;
}

function getChangeTone(key: SimulationAttributeKey, change?: number) {
  if (!change) {
    return 'neutral';
  }

  const isRiskAttribute = key === 'debt' || key === 'cost';
  const isGood = isRiskAttribute ? change < 0 : change > 0;

  return isGood ? 'good' : 'bad';
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      gap: 16,
      paddingHorizontal: 20,
      paddingTop: 22,
      paddingBottom: 22,
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
    eyebrow: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '900',
    },
    roundBadge: {
      width: 54,
      height: 54,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    roundText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '900',
    },
    helpButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    helpButtonPressed: {
      backgroundColor: colors.surfaceAlt,
    },
    tutorialPanel: {
      flex: 1,
      justifyContent: 'center',
      gap: 18,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    tutorialIcon: {
      width: 66,
      height: 66,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: colors.selectedSurface,
    },
    tutorialTitle: {
      color: colors.text,
      fontSize: 26,
      fontWeight: '900',
      lineHeight: 32,
    },
    tutorialText: {
      color: colors.muted,
      fontSize: 16,
      fontWeight: '700',
      lineHeight: 24,
    },
    tutorialDots: {
      flexDirection: 'row',
      gap: 8,
      paddingTop: 4,
    },
    tutorialDot: {
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: colors.border,
    },
    tutorialDotActive: {
      width: 24,
      backgroundColor: colors.primary,
    },
    tutorialActions: {
      flexDirection: 'row',
      gap: 10,
      paddingTop: 6,
    },
    tutorialSecondaryButton: {
      minHeight: 48,
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    tutorialSecondaryButtonPressed: {
      backgroundColor: colors.surfaceAlt,
    },
    tutorialPrimaryButton: {
      minHeight: 48,
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 8,
      backgroundColor: colors.primary,
    },
    tutorialPrimaryButtonPressed: {
      backgroundColor: colors.primaryDark,
    },
    tutorialButtonDisabled: {
      opacity: 0.45,
    },
    tutorialSecondaryButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '900',
    },
    tutorialPrimaryButtonText: {
      color: colors.primaryOn,
      fontSize: 15,
      fontWeight: '900',
    },
    tutorialButtonTextDisabled: {
      color: colors.muted,
    },
    attributeBar: {
      flexDirection: 'row',
      gap: 8,
      padding: 10,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    attributeItem: {
      flex: 1,
      minWidth: 0,
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: 'transparent',
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    attributeItemGood: {
      borderColor: colors.primary,
      backgroundColor: colors.successSurface,
    },
    attributeItemBad: {
      borderColor: colors.danger,
      backgroundColor: colors.dangerSurface,
    },
    attributeIconFrame: {
      width: iconFrameSize,
      height: iconFrameSize,
      alignItems: 'center',
      justifyContent: 'center',
    },
    attributeFillMask: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      left: 0,
      overflow: 'hidden',
    },
    attributeFillIcon: {
      position: 'absolute',
      right: 0,
      bottom: 5,
      left: 0,
      alignItems: 'center',
    },
    attributeLabel: {
      color: colors.muted,
      fontSize: 10,
      fontWeight: '900',
      textAlign: 'center',
      textTransform: 'uppercase',
    },
    arena: {
      flex: 1,
      minHeight: 330,
      justifyContent: 'center',
      gap: 10,
    },
    acceptText: {
      color: colors.primary,
    },
    rejectText: {
      color: colors.danger,
    },
    card: {
      minHeight: 308,
      justifyContent: 'space-between',
      gap: 18,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.16,
      shadowRadius: 18,
      elevation: 6,
      overflow: 'hidden',
    },
    cardDecisionTint: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      zIndex: 4,
    },
    acceptDecisionTint: {
      backgroundColor: 'rgba(64, 201, 162, 0.88)',
    },
    rejectDecisionTint: {
      backgroundColor: 'rgba(240, 93, 94, 0.88)',
    },
    cardEyebrow: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    cardTitle: {
      color: colors.text,
      fontSize: 25,
      fontWeight: '900',
      lineHeight: 30,
    },
    cardContext: {
      color: colors.muted,
      fontSize: 15,
      fontWeight: '700',
      lineHeight: 22,
    },
    cardChoices: {
      flexDirection: 'row',
      gap: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    choiceBlock: {
      flex: 1,
      gap: 4,
    },
    choiceIcon: {
      width: 30,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
    },
    choiceIconReject: {
      backgroundColor: colors.dangerSurface,
    },
    choiceIconAccept: {
      backgroundColor: colors.successSurface,
    },
    choiceBlockText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '800',
      lineHeight: 18,
    },
    choiceDivider: {
      width: 1,
      backgroundColor: colors.border,
    },
    outcomeBox: {
      minHeight: 86,
      justifyContent: 'center',
      gap: 6,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surfaceAlt,
    },
    outcomeLabel: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    outcomeText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
      lineHeight: 20,
    },
    resultPanel: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
      minHeight: 308,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 8,
      backgroundColor: colors.successSurface,
    },
    resultPanelDanger: {
      borderColor: colors.danger,
      backgroundColor: colors.dangerSurface,
    },
    resultIcon: {
      width: 62,
      height: 62,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    resultTitle: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '900',
      textAlign: 'center',
    },
    resultMessage: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
      lineHeight: 22,
      textAlign: 'center',
    },
    resetButton: {
      minHeight: 46,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 18,
      borderRadius: 8,
      backgroundColor: colors.primary,
    },
    resetButtonPressed: {
      backgroundColor: colors.primaryDark,
    },
    resetButtonText: {
      color: colors.primaryOn,
      fontSize: 15,
      fontWeight: '900',
    },
  });
}
