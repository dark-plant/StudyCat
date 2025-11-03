import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { PersistGate } from 'redux-persist/integration/react';

import { store, persistor } from './features/store';
import { lightTheme, darkTheme } from './styles/theme';
import { useAppSelector, useAppDispatch } from './hooks/redux';
import { fetchUserProfile } from './features/auth/authSlice';
import { setTheme } from './features/ui/uiSlice';

// Screen imports
import WelcomeScreen from './screens/Welcome/WelcomeScreen';
import InputScreen from './screens/Input/InputScreen';
import ProcessingScreen from './screens/Processing/ProcessingScreen';
import DashboardScreen from './screens/Dashboard/DashboardScreen';
import SettingsScreen from './screens/Settings/SettingsScreen';

// Component imports
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingScreen from './components/common/LoadingScreen';
import NotificationContainer from './components/common/NotificationContainer';
import AIAssistant from './components/ai/AIAssistant';

// Main App component
function AppContent() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  // Initialize app and fetch user profile if token exists
  useEffect(() => {
    const initializeApp = async () => {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
      if (savedTheme) {
        dispatch(setTheme(savedTheme));
      }

      const token = localStorage.getItem('token');
      if (token && !isAuthenticated) {
        try {
          await dispatch(fetchUserProfile()).unwrap();
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          localStorage.removeItem('token');
        }
      }
    };

    initializeApp();
  }, [dispatch, isAuthenticated]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <WelcomeScreen />
            }
          />

          {/* Protected routes */}
          <Route
            path="/input"
            element={
              <ProtectedRoute>
                <InputScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/processing"
            element={
              <ProtectedRoute>
                <ProcessingScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsScreen />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global components */}
        <NotificationContainer />
        <AIAssistant />
      </Router>
    </ThemeProvider>
  );
}

// Main App wrapper
function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

export default App;
