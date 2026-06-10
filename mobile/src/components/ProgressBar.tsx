import { StyleSheet, View } from 'react-native';
import type { DimensionValue } from 'react-native';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeProvider';

type ProgressBarProps = {
  value: number;
};

export function ProgressBar({ value }: ProgressBarProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const width = `${Math.max(0, Math.min(value, 1)) * 100}%` as DimensionValue;

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width }]} />
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
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
}
