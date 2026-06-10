import { Pressable, StyleSheet, Text } from 'react-native';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeProvider';

type MenuButtonProps = {
  onPress: () => void;
};

export function MenuButton({ onPress }: MenuButtonProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={onPress}>
      <Text style={styles.buttonText}>☰</Text>
    </Pressable>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    button: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    buttonPressed: {
      backgroundColor: colors.surfaceAlt,
    },
    buttonText: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '900',
      lineHeight: 28,
    },
  });
}
