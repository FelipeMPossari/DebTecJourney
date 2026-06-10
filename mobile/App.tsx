import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { AppDrawer } from './src/components/AppDrawer';
import { HomeScreen } from './src/screens/HomeScreen';
import { LessonScreen } from './src/screens/LessonScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { AnswerResult, Lesson } from './src/types/learning';
import { UserSession } from './src/types/auth';
import { AppTab } from './src/types/navigation';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';

type AppRoute =
  | { name: 'home' }
  | { name: 'settings' }
  | { name: 'lesson'; lessonId: string }
  | { name: 'result'; lesson: Lesson; result: AnswerResult };

function AppContent() {
  const { themeName } = useTheme();
  const [session, setSession] = useState<UserSession | null>(null);
  const [route, setRoute] = useState<AppRoute>({ name: 'home' });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  function handleFinishedLesson(lesson: Lesson, result: AnswerResult) {
    setRoute({ name: 'result', lesson, result });
  }

  function handleNavigate(tab: AppTab) {
    setRoute(tab === 'settings' ? { name: 'settings' } : { name: 'home' });
  }

  function handleLogout() {
    setSession(null);
    setRoute({ name: 'home' });
    setIsDrawerOpen(false);
  }

  function renderRoute() {
    if (!session) {
      return <LoginScreen onLogin={setSession} />;
    }

    if (route.name === 'lesson') {
      return (
        <LessonScreen
          lessonId={route.lessonId}
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

    return (
      <HomeScreen
        user={session}
        onOpenMenu={() => setIsDrawerOpen(true)}
        onStartLesson={(lessonId) => setRoute({ name: 'lesson', lessonId })}
      />
    );
  }

  const activeTab: AppTab = route.name === 'settings' ? 'settings' : 'home';

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
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
