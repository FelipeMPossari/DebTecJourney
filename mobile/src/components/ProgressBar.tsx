import { DimensionValue, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

type ProgressBarProps = {
  value: number;
};

export function ProgressBar({ value }: ProgressBarProps) {
  const width = `${Math.max(0, Math.min(value, 1)) * 100}%` as DimensionValue;

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
  },
  fill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
});
