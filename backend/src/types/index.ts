// User and authentication types
export interface User {
  id: string;
  email: string;
  password_hash: string;
  name?: string;
  preferences: UserPreferences;
  created_at: Date;
  updated_at: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  study_reminders: boolean;
  language: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Document and content types
export interface Document {
  id: string;
  user_id: string;
  title: string;
  content_type: 'pdf' | 'docx' | 'text' | 'youtube';
  original_content: string;
  processed_at?: Date;
  created_at: Date;
}

export interface ProcessedContent {
  document_id: string;
  summary: string;
  key_points: string[];
  concepts: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  processing_metadata: {
    word_count: number;
    processing_time: number;
    confidence_score: number;
  };
}

// Learning material types
export interface Notes {
  id: string;
  document_id: string;
  title: string;
  content: NoteSection[];
  ai_generated: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface NoteSection {
  id: string;
  title: string;
  content: string;
  key_points: string[];
  is_highlighted: boolean;
  order: number;
}

export interface Quiz {
  id: string;
  document_id: string;
  title: string;
  questions: QuizQuestion[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  time_limit?: number;
  created_at: Date;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correct_answer: string | string[];
  explanation: string;
  points: number;
  order: number;
}

export interface QuizResult {
  id: string;
  user_id: string;
  quiz_id: string;
  answers: QuizAnswer[];
  score: number;
  total_points: number;
  completed_at: Date;
  time_spent: number;
}

export interface QuizAnswer {
  question_id: string;
  answer: string | string[];
  is_correct: boolean;
  time_spent: number;
}

export interface Flashcard {
  id: string;
  document_id: string;
  term: string;
  definition: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
  created_at: Date;
}

export interface FlashcardDeck {
  id: string;
  document_id: string;
  title: string;
  flashcards: Flashcard[];
  created_at: Date;
}

export interface FlashcardProgress {
  id: string;
  flashcard_id: string;
  user_id: string;
  status: 'new' | 'learning' | 'review' | 'known';
  last_reviewed: Date;
  review_count: number;
  correct_count: number;
  next_review: Date;
  created_at: Date;
}

// Learning session types
export interface LearningSession {
  id: string;
  user_id: string;
  document_id: string;
  start_time: Date;
  end_time?: Date;
  activities: SessionActivity[];
  total_time: number;
  created_at: Date;
}

export interface SessionActivity {
  id: string;
  session_id: string;
  type: 'notes' | 'quiz' | 'flashcard';
  item_id: string;
  start_time: Date;
  end_time: Date;
  data: any;
  created_at: Date;
}

// Progress tracking types
export interface UserProgress {
  id: string;
  user_id: string;
  document_id: string;
  notes_progress: NotesProgress;
  quiz_progress: QuizProgress;
  flashcard_progress: FlashcardProgressSummary;
  last_accessed: Date;
  created_at: Date;
  updated_at: Date;
}

export interface NotesProgress {
  sections_read: number;
  total_sections: number;
  time_spent: number;
  reading_speed: number; // words per minute
}

export interface QuizProgress {
  quizzes_taken: number;
  average_score: number;
  best_score: number;
  time_spent: number;
  accuracy: number;
}

export interface FlashcardProgressSummary {
  total_cards: number;
  known_cards: number;
  learning_cards: number;
  review_cards: number;
  accuracy: number;
  retention_rate: number;
}

// AI and processing types
export interface AIProcessingRequest {
  document_id: string;
  content: string;
  content_type: string;
  processing_options: ProcessingOptions;
}

export interface ProcessingOptions {
  generate_notes: boolean;
  generate_quiz: boolean;
  generate_flashcards: boolean;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  quiz_questions_count?: number;
  flashcards_count?: number;
}

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    timestamp: string;
  };
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
  refresh_token: string;
}

// File upload types
export interface FileUploadRequest {
  file: Express.Multer.File;
  user_id: string;
  title?: string;
}

export interface YouTubeTranscriptRequest {
  url: string;
  user_id: string;
}

export interface ProcessingStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  stage: 'uploading' | 'extracting' | 'analyzing' | 'generating' | 'complete';
  progress: number;
  message: string;
  error?: string;
  created_at: Date;
  updated_at: Date;
}

// Database query types
export interface DatabaseQueryOptions {
  limit?: number;
  offset?: number;
  order_by?: string;
  order_direction?: 'ASC' | 'DESC';
  filters?: Record<string, any>;
}

// Error types
export interface AppError extends Error {
  code: string;
  statusCode: number;
  details?: any;
}

// JWT types
export interface JWTPayload {
  user_id: string;
  email: string;
  iat: number;
  exp: number;
}

// Environment types
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  OPENAI_API_KEY: string;
  CORS_ORIGIN: string;
  UPLOAD_DIR: string;
  MAX_FILE_SIZE: number;
}