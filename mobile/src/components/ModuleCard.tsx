import { StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from './ProgressBar';
import { colors } from '../theme/colors';
import { ModulePreview } from '../types/learning';

type ModuleCardProps = {
  module: ModulePreview;
};

export function ModuleCard({ module }: ModuleCardProps) {
  const completedLessons = module.lessons.filter((lesson) => lesson.status === 'completed').length;
  const availableLessons = module.lessons.filter((lesson) => lesson.status === 'available').length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.indexBadge}>
          <Text style={styles.indexText}>{module.title.slice(0, 1)}</Text>
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>{module.title}</Text>
          <Text style={styles.description}>{module.description}</Text>
        </View>
      </View>

      <ProgressBar value={module.progress} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>{completedLessons} concluída(s)</Text>
        <Text style={styles.footerText}>{availableLessons} disponível</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  indexBadge: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: colors.primaryDark,
  },
  indexText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  description: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  footerText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
