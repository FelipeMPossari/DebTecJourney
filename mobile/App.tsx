import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppDrawer } from './src/components/AppDrawer';
import { HomeScreen } from './src/screens/HomeScreen';
import { LessonScreen } from './src/screens/LessonScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SimulationScreen } from './src/screens/SimulationScreen';
import { AnswerResult, Lesson } from './src/types/learning';
import { UserSession } from './src/types/auth';
import { AppTab } from './src/types/navigation';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';

type AppRoute =
  | { name: 'home' }
  | { name: 'simulation' }
  | { name: 'settings' }
  | { name: 'lesson'; lessonId: string }
  | { name: 'result'; lesson: Lesson; result: AnswerResult };

function AppContent() {
  const { themeName } = useTheme();
  const [session, setSession] = useState<UserSession | null>(null);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const [route, setRoute] = useState<AppRoute>({ name: 'home' });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  function handleFinishedLesson(lesson: Lesson, result: AnswerResult) {
    setRoute({ name: 'result', lesson, result });
  }

  function handleNavigate(tab: AppTab) {
    if (tab === 'settings') {
      setRoute({ name: 'settings' });
      return;
    }

    if (tab === 'simulation') {
      setRoute({ name: 'simulation' });
      return;
    }

    setRoute({ name: 'home' });
  }

  function handleLogout() {
    setSession(null);
    setAuthScreen('login');
    setRoute({ name: 'home' });
    setIsDrawerOpen(false);
  }

  function handleAuthenticated(nextSession: UserSession) {
    setAuthScreen('login');
    setSession(nextSession);
  }

  function renderRoute() {
    if (!session) {
      if (authScreen === 'register') {
        return <RegisterScreen onBack={() => setAuthScreen('login')} onRegistered={handleAuthenticated} />;
      }

      return <LoginScreen onLogin={handleAuthenticated} onOpenRegister={() => setAuthScreen('register')} />;
    }

    if (route.name === 'lesson') {
      return (
        <LessonScreen
          lessonId={route.lessonId}
          token={session.token}
          onBack={() => setRoute({ name: 'home' })}
          onFinished={handleFinishedLesson}
        />
      );
    }

    if (route.name === 'result') {
      return <ResultScreen lesson={route.lesson} result={route.result} onBackHome={() => setRoute({ name: 'home' })} />;
    }

    if (route.name === 'settings') {
      return <SettingsScreen user={session} onOpenMenu={() => setIsDrawerOpen(true)} onLogout={handleLogout} />;
    }

    if (route.name === 'simulation') {
      return <SimulationScreen onOpenMenu={() => setIsDrawerOpen(true)} />;
    }

    return (
      <HomeScreen
        user={session}
        onOpenMenu={() => setIsDrawerOpen(true)}
        onStartLesson={(lessonId) => setRoute({ name: 'lesson', lessonId })}
      />
    );
  }

  const activeTab: AppTab = route.name === 'settings' || route.name === 'simulation' ? route.name : 'home';

  return (
    <>
      <StatusBar style={themeName === 'dark' ? 'light' : 'dark'} />
      {renderRoute()}
      {session ? (
        <AppDrawer
          activeTab={activeTab}
          isOpen={isDrawerOpen}
          user={session}
          onClose={() => setIsDrawerOpen(false)}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      ) : null}
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
