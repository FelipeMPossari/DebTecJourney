import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { AppColors } from '../theme/colors';
import { useTheme } from '../theme/ThemeProvider';
import { UserSession } from '../types/auth';
import { AppTab } from '../types/navigation';

type AppDrawerProps = {
  activeTab: AppTab;
  isOpen: boolean;
  user: UserSession;
  onClose: () => void;
  onNavigate: (tab: AppTab) => void;
  onLogout: () => void;
};

const drawerItems: Array<{ label: string; tab: AppTab }> = [
  { label: 'Início', tab: 'home' },
  { label: 'Configurações', tab: 'settings' },
];

export function AppDrawer({ activeTab, isOpen, user, onClose, onNavigate, onLogout }: AppDrawerProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  function handleNavigate(tab: AppTab) {
    onNavigate(tab);
    onClose();
  }

  function handleLogout() {
    onClose();
    onLogout();
  }

  return (
    <Modal animationType="fade" transparent visible={isOpen} onRequestClose={onClose}>
      <View style={styles.container}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.drawer}>
          <View style={styles.profileBlock}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name.slice(0, 1).toUpperCase()}</Text>
            </View>
            <View style={styles.profileText}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.navList}>
            {drawerItems.map((item) => {
              const isActive = item.tab === activeTab;

              return (
                <Pressable
                  key={item.tab}
                  style={({ pressed }) => [
                    styles.navButton,
                    isActive && styles.navButtonActive,
                    pressed && !isActive && styles.navButtonPressed,
                  ]}
                  onPress={() => handleNavigate(item.tab)}
                >
                  <Text style={[styles.navButtonText, isActive && styles.navButtonTextActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.footer}>
            <Pressable style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]} onPress={handleLogout}>
              <LogOut color={colors.danger} size={18} strokeWidth={2.5} />
              <Text style={styles.logoutButtonText}>Sair</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: colors.overlay,
    },
    drawer: {
      width: 292,
      maxWidth: '82%',
      paddingTop: 54,
      paddingHorizontal: 18,
      paddingBottom: 22,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      backgroundColor: colors.background,
    },
    profileBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingBottom: 22,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    avatar: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: colors.primary,
    },
    avatarText: {
      color: colors.primaryOn,
      fontSize: 22,
      fontWeight: '900',
    },
    profileText: {
      flex: 1,
      gap: 3,
    },
    userName: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '900',
    },
    userEmail: {
      color: colors.muted,
      fontSize: 12,
    },
    navList: {
      gap: 10,
      paddingTop: 22,
    },
    navButton: {
      minHeight: 48,
      justifyContent: 'center',
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    navButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.selectedSurface,
    },
    navButtonPressed: {
      backgroundColor: colors.surfaceAlt,
    },
    navButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '900',
    },
    navButtonTextActive: {
      color: colors.primary,
    },
    footer: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    logoutButton: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    logoutButtonPressed: {
      backgroundColor: colors.surfaceAlt,
    },
    logoutButtonText: {
      color: colors.danger,
      fontSize: 15,
      fontWeight: '900',
    },
  });
}
