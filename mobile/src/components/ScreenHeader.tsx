import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeProvider';

type ScreenHeaderProps = {
  title: string;
  eyebrow?: string;
  onBack?: () => void;
};

export function ScreenHeader({ title, eyebrow, onBack }: ScreenHeaderProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]} onPress={onBack}>
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>
      ) : null}

      <View style={styles.titleBlock}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    backButton: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    backButtonPressed: {
      backgroundColor: colors.surfaceAlt,
    },
    backButtonText: {
      color: colors.text,
      fontSize: 32,
      fontWeight: '900',
      lineHeight: 34,
    },
    titleBlock: {
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
      fontSize: 24,
      fontWeight: '900',
    },
  });
}
