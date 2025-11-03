import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Document,
  ProcessedContent,
  Notes,
  Quiz,
  QuizResult,
  FlashcardDeck,
  FlashcardProgress,
  UserProgress,
  LearningSession
} from '../../types';
import { contentAPI } from '../../services/api';

// Async thunks for content operations
export const uploadDocument = createAsyncThunk(
  'content/uploadDocument',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await contentAPI.uploadDocument(formData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Upload failed');
    }
  }
);

export const processYouTubeContent = createAsyncThunk(
  'content/processYouTube',
  async (url: string, { rejectWithValue }) => {
    try {
      const response = await contentAPI.processYouTube(url);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'YouTube processing failed');
    }
  }
);

export const fetchDocuments = createAsyncThunk(
  'content/fetchDocuments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await contentAPI.getDocuments();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch documents');
    }
  }
);

export const fetchDocument = createAsyncThunk(
  'content/fetchDocument',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await contentAPI.getDocument(documentId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch document');
    }
  }
);

export const fetchProcessedContent = createAsyncThunk(
  'content/fetchProcessedContent',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await contentAPI.getProcessedContent(documentId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch processed content');
    }
  }
);

export const generateNotes = createAsyncThunk(
  'content/generateNotes',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await contentAPI.generateNotes(documentId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to generate notes');
    }
  }
);

export const fetchNotes = createAsyncThunk(
  'content/fetchNotes',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await contentAPI.getNotes(documentId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch notes');
    }
  }
);

export const updateNotes = createAsyncThunk(
  'content/updateNotes',
  async ({ notesId, updates }: { notesId: string; updates: Partial<Notes> }, { rejectWithValue }) => {
    try {
      const response = await contentAPI.updateNotes(notesId, updates);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update notes');
    }
  }
);

export const generateQuiz = createAsyncThunk(
  'content/generateQuiz',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await contentAPI.generateQuiz(documentId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to generate quiz');
    }
  }
);

export const fetchQuiz = createAsyncThunk(
  'content/fetchQuiz',
  async (quizId: string, { rejectWithValue }) => {
    try {
      const response = await contentAPI.getQuiz(quizId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch quiz');
    }
  }
);

export const submitQuizResult = createAsyncThunk(
  'content/submitQuizResult',
  async (quizResult: Omit<QuizResult, 'userId' | 'completedAt'>, { rejectWithValue }) => {
    try {
      const response = await contentAPI.submitQuizResult(quizResult);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to submit quiz result');
    }
  }
);

export const generateFlashcards = createAsyncThunk(
  'content/generateFlashcards',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await contentAPI.generateFlashcards(documentId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to generate flashcards');
    }
  }
);

export const fetchFlashcardDeck = createAsyncThunk(
  'content/fetchFlashcardDeck',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await contentAPI.getFlashcardDeck(documentId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch flashcards');
    }
  }
);

export const updateFlashcardProgress = createAsyncThunk(
  'content/updateFlashcardProgress',
  async (progress: Omit<FlashcardProgress, 'userId' | 'lastReviewed'>, { rejectWithValue }) => {
    try {
      const response = await contentAPI.updateFlashcardProgress(progress);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update flashcard progress');
    }
  }
);

export const fetchUserProgress = createAsyncThunk(
  'content/fetchUserProgress',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await contentAPI.getUserProgress(documentId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user progress');
    }
  }
);

export const startLearningSession = createAsyncThunk(
  'content/startLearningSession',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await contentAPI.startLearningSession(documentId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to start learning session');
    }
  }
);

export const endLearningSession = createAsyncThunk(
  'content/endLearningSession',
  async ({ sessionId, activities }: { sessionId: string; activities: any[] }, { rejectWithValue }) => {
    try {
      const response = await contentAPI.endLearningSession(sessionId, activities);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to end learning session');
    }
  }
);

// State interface
interface ContentState {
  documents: Document[];
  currentDocument: Document | null;
  processedContent: ProcessedContent | null;
  notes: Notes | null;
  quiz: Quiz | null;
  flashcardDeck: FlashcardDeck | null;
  userProgress: UserProgress | null;
  currentSession: LearningSession | null;
  isLoading: boolean;
  isProcessing: boolean;
  processingStage: 'uploading' | 'extracting' | 'analyzing' | 'generating' | 'complete' | 'idle';
  processingProgress: number;
  error: string | null;
}

// Initial state
const initialState: ContentState = {
  documents: [],
  currentDocument: null,
  processedContent: null,
  notes: null,
  quiz: null,
  flashcardDeck: null,
  userProgress: null,
  currentSession: null,
  isLoading: false,
  isProcessing: false,
  processingStage: 'idle',
  processingProgress: 0,
  error: null,
};

// Content slice
const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
      state.processedContent = null;
      state.notes = null;
      state.quiz = null;
      state.flashcardDeck = null;
      state.userProgress = null;
    },
    setProcessingStage: (state, action: PayloadAction<ContentState['processingStage']>) => {
      state.processingStage = action.payload;
    },
    setProcessingProgress: (state, action: PayloadAction<number>) => {
      state.processingProgress = action.payload;
    },
    updateLocalNotes: (state, action: PayloadAction<Partial<Notes>>) => {
      if (state.notes) {
        state.notes = { ...state.notes, ...action.payload };
      }
    },
    addSessionActivity: (state, action: PayloadAction<any>) => {
      if (state.currentSession) {
        state.currentSession.activities.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    // Upload document
    builder
      .addCase(uploadDocument.pending, (state) => {
        state.isLoading = true;
        state.isProcessing = true;
        state.processingStage = 'uploading';
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDocument = action.payload.document;
        state.processedContent = action.payload.processedContent;
        state.documents.push(action.payload.document);
        state.processingStage = 'complete';
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.isProcessing = false;
        state.processingStage = 'idle';
        state.error = action.payload as string;
      });

    // Process YouTube content
    builder
      .addCase(processYouTubeContent.pending, (state) => {
        state.isLoading = true;
        state.isProcessing = true;
        state.processingStage = 'extracting';
        state.error = null;
      })
      .addCase(processYouTubeContent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDocument = action.payload.document;
        state.processedContent = action.payload.processedContent;
        state.documents.push(action.payload.document);
        state.processingStage = 'complete';
      })
      .addCase(processYouTubeContent.rejected, (state, action) => {
        state.isLoading = false;
        state.isProcessing = false;
        state.processingStage = 'idle';
        state.error = action.payload as string;
      });

    // Fetch documents
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = action.payload.documents;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Generate notes
    builder
      .addCase(generateNotes.pending, (state) => {
        state.isLoading = true;
        state.processingStage = 'generating';
        state.error = null;
      })
      .addCase(generateNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes = action.payload.notes;
        state.processingStage = 'complete';
      })
      .addCase(generateNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.processingStage = 'idle';
        state.error = action.payload as string;
      });

    // Generate quiz
    builder
      .addCase(generateQuiz.pending, (state) => {
        state.isLoading = true;
        state.processingStage = 'generating';
        state.error = null;
      })
      .addCase(generateQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quiz = action.payload.quiz;
        state.processingStage = 'complete';
      })
      .addCase(generateQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.processingStage = 'idle';
        state.error = action.payload as string;
      });

    // Generate flashcards
    builder
      .addCase(generateFlashcards.pending, (state) => {
        state.isLoading = true;
        state.processingStage = 'generating';
        state.error = null;
      })
      .addCase(generateFlashcards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.flashcardDeck = action.payload.flashcardDeck;
        state.processingStage = 'complete';
      })
      .addCase(generateFlashcards.rejected, (state, action) => {
        state.isLoading = false;
        state.processingStage = 'idle';
        state.error = action.payload as string;
      });

    // Start learning session
    builder
      .addCase(startLearningSession.fulfilled, (state, action) => {
        state.currentSession = action.payload.session;
      });

    // End learning session
    builder
      .addCase(endLearningSession.fulfilled, (state) => {
        state.currentSession = null;
      });
  },
});

// Export actions
export const {
  clearError,
  clearCurrentDocument,
  setProcessingStage,
  setProcessingProgress,
  updateLocalNotes,
  addSessionActivity,
} = contentSlice.actions;

// Selectors
export const selectContent = (state: { content: ContentState }) => state.content;
export const selectDocuments = (state: { content: ContentState }) => state.content.documents;
export const selectCurrentDocument = (state: { content: ContentState }) => state.content.currentDocument;
export const selectProcessedContent = (state: { content: ContentState }) => state.content.processedContent;
export const selectNotes = (state: { content: ContentState }) => state.content.notes;
export const selectQuiz = (state: { content: ContentState }) => state.content.quiz;
export const selectFlashcardDeck = (state: { content: ContentState }) => state.content.flashcardDeck;
export const selectUserProgress = (state: { content: ContentState }) => state.content.userProgress;
export const selectCurrentSession = (state: { content: ContentState }) => state.content.currentSession;
export const selectContentLoading = (state: { content: ContentState }) => state.content.isLoading;
export const selectIsProcessing = (state: { content: ContentState }) => state.content.isProcessing;
export const selectProcessingStage = (state: { content: ContentState }) => state.content.processingStage;
export const selectProcessingProgress = (state: { content: ContentState }) => state.content.processingProgress;
export const selectContentError = (state: { content: ContentState }) => state.content.error;

// Export reducer
export default contentSlice.reducer;