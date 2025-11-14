// Core user and authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  studyReminders: boolean;
  language: string;
}

// Authentication types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

// Content and document types
export interface Document {
  id: string;
  userId: string;
  title: string;
  contentType: 'pdf' | 'docx' | 'text' | 'youtube';
  originalContent: string;
  processedAt?: string;
  createdAt: string;
}

export interface ProcessedContent {
  documentId: string;
  summary: string;
  keyPoints: string[];
  concepts: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Learning material types
export interface Notes {
  id: string;
  documentId: string;
  title: string;
  content: NoteSection[];
  aiGenerated: boolean;
  createdAt: string;
}

export interface NoteSection {
  id: string;
  title: string;
  content: string;
  keyPoints: string[];
  isHighlighted: boolean;
}

export interface Quiz {
  id: string;
  documentId: string;
  title: string;
  questions: QuizQuestion[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit?: number;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer: string | string[];
  explanation: string;
  points: number;
}

export interface QuizResult {
  quizId: string;
  userId: string;
  answers: QuizAnswer[];
  score: number;
  totalPoints: number;
  completedAt: string;
  timeSpent: number;
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  timeSpent: number;
}

export interface Flashcard {
  id: string;
  documentId: string;
  term: string;
  definition: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
  createdAt: string;
}

export interface FlashcardDeck {
  id: string;
  documentId: string;
  title: string;
  flashcards: Flashcard[];
  createdAt: string;
}

export interface FlashcardProgress {
  flashcardId: string;
  userId: string;
  status: 'new' | 'learning' | 'review' | 'known';
  lastReviewed: string;
  reviewCount: number;
  correctCount: number;
  nextReview: string;
}

// AI Assistant types
export interface AIAssistant {
  isOpen: boolean;
  messages: AIMessage[];
  context: 'notes' | 'quiz' | 'flashcard' | 'general';
  isLoading: boolean;
}

export interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: string;
}

// UI State types
export interface UIState {
  theme: 'light' | 'dark';
  loadingScreen: LoadingScreenState;
  navigation: NavigationState;
  notifications: Notification[];
}

export interface LoadingScreenState {
  isLoading: boolean;
  message: string;
  progress: number;
  stage: 'uploading' | 'extracting' | 'analyzing' | 'generating' | 'complete';
}

export interface NavigationState {
  currentTab: 'notes' | 'quizzes' | 'flashcards';
  previousTab?: 'notes' | 'quizzes' | 'flashcards';
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: string;
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadResponse {
  documentId: string;
  status: 'processing' | 'completed' | 'error';
  message: string;
}

// Session and Progress types
export interface LearningSession {
  id: string;
  userId: string;
  documentId: string;
  startTime: string;
  endTime?: string;
  activities: SessionActivity[];
  totalTime: number;
}

export interface SessionActivity {
  type: 'notes' | 'quiz' | 'flashcard';
  itemId: string;
  startTime: string;
  endTime: string;
  data: any; // Specific activity data
}

export interface UserProgress {
  userId: string;
  documentId: string;
  notesProgress: {
    sectionsRead: number;
    totalSections: number;
    timeSpent: number;
  };
  quizProgress: {
    quizzesTaken: number;
    averageScore: number;
    bestScore: number;
    timeSpent: number;
  };
  flashcardProgress: {
    totalCards: number;
    knownCards: number;
    learningCards: number;
    reviewCards: number;
    accuracy: number;
  };
  lastAccessed: string;
}

// File upload types
export interface FileUpload {
  file: File;
  type: 'pdf' | 'docx' | 'text';
  preview?: string;
}

export interface YouTubeInput {
  url: string;
  videoId?: string;
  title?: string;
}

// Form types
export interface FeedbackData {
  type: 'session' | 'content' | 'feature';
  rating: 'very-helpful' | 'helpful' | 'neutral' | 'not-helpful';
  comment?: string;
  context?: string;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}