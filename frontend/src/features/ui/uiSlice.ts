import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState, Notification, AIAssistant } from '../../types';

// UI slice for managing UI state
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
    loadingScreen: {
      isLoading: false,
      message: '',
      progress: 0,
      stage: 'uploading',
    },
    navigation: {
      currentTab: 'notes' as const,
      previousTab: undefined,
    },
    notifications: [],
    aiAssistant: {
      isOpen: false,
      messages: [],
      context: 'general',
      isLoading: false,
    },
  } as UIState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    setLoadingScreen: (state, action: PayloadAction<Partial<UIState['loadingScreen']>>) => {
      state.loadingScreen = { ...state.loadingScreen, ...action.payload };
    },
    setCurrentTab: (state, action: PayloadAction<'notes' | 'quizzes' | 'flashcards'>) => {
      state.navigation.previousTab = state.navigation.currentTab;
      state.navigation.currentTab = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    openAIAssistant: (state, action: PayloadAction<{ context?: 'notes' | 'quiz' | 'flashcard' | 'general'; initialMessage?: string }>) => {
      state.aiAssistant.isOpen = true;
      state.aiAssistant.context = action.payload.context || 'general';
      if (action.payload.initialMessage) {
        state.aiAssistant.messages.push({
          id: Date.now().toString(),
          type: 'user',
          content: action.payload.initialMessage,
          timestamp: new Date().toISOString(),
        });
      }
    },
    closeAIAssistant: (state) => {
      state.aiAssistant.isOpen = false;
      state.aiAssistant.isLoading = false;
    },
    addAIMessage: (state, action: PayloadAction<{ type: 'user' | 'assistant'; content: string; context?: string }>) => {
      const message = {
        id: Date.now().toString(),
        type: action.payload.type,
        content: action.payload.content,
        timestamp: new Date().toISOString(),
        context: action.payload.context,
      };
      state.aiAssistant.messages.push(message);
    },
    setAILoading: (state, action: PayloadAction<boolean>) => {
      state.aiAssistant.isLoading = action.payload;
    },
    clearAIMessages: (state) => {
      state.aiAssistant.messages = [];
    },
  },
});

// Export actions
export const {
  setTheme,
  setLoadingScreen,
  setCurrentTab,
  addNotification,
  removeNotification,
  clearNotifications,
  openAIAssistant,
  closeAIAssistant,
  addAIMessage,
  setAILoading,
  clearAIMessages,
} = uiSlice.actions;

// Selectors
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectLoadingScreen = (state: { ui: UIState }) => state.ui.loadingScreen;
export const selectCurrentTab = (state: { ui: UIState }) => state.ui.navigation.currentTab;
export const selectPreviousTab = (state: { ui: UIState }) => state.ui.navigation.previousTab;
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications;
export const selectAIAssistant = (state: { ui: UIState }) => state.ui.aiAssistant;

// Export reducer
export default uiSlice.reducer;