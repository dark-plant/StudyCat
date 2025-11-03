import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../features/store';

// Base API configuration
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('content-type', 'application/json');
    return headers;
  },
});

// Base API with error handling
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  // Handle 401 errors - try to refresh token
  if (result.error && result.error.status === 401) {
    console.log('Token expired, attempting refresh...');
    const refreshResult = await baseQuery(
      {
        url: '/auth/refresh',
        method: 'POST',
        body: { token: (api.getState() as RootState).auth.token },
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      // Store the new token
      api.dispatch({
        type: 'auth/setToken',
        payload: (refreshResult.data as any).token,
      });
      // Retry the original request
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed, logout user
      api.dispatch({ type: 'auth/clearAuth' });
    }
  }

  return result;
};

// Create API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Document', 'Notes', 'Quiz', 'Flashcard', 'Progress'],
  endpoints: (builder) => ({
    // Authentication endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    refreshToken: builder.mutation({
      query: (token) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: { token },
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    getProfile: builder.query({
      query: () => '/auth/profile',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (userData) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    // Document and content endpoints
    uploadDocument: builder.mutation({
      query: (formData) => ({
        url: '/upload/file',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['Document'],
    }),
    processYouTube: builder.mutation({
      query: (url) => ({
        url: '/upload/youtube',
        method: 'POST',
        body: { url },
      }),
      invalidatesTags: ['Document'],
    }),
    getDocuments: builder.query({
      query: () => '/documents',
      providesTags: ['Document'],
    }),
    getDocument: builder.query({
      query: (documentId) => `/documents/${documentId}`,
      providesTags: ['Document'],
    }),
    deleteDocument: builder.mutation({
      query: (documentId) => ({
        url: `/documents/${documentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Document'],
    }),

    // Content processing endpoints
    getProcessedContent: builder.query({
      query: (documentId) => `/content/${documentId}/processed`,
      providesTags: ['Document'],
    }),
    generateNotes: builder.mutation({
      query: (documentId) => ({
        url: `/content/${documentId}/notes/generate`,
        method: 'POST',
      }),
      invalidatesTags: ['Notes'],
    }),
    getNotes: builder.query({
      query: ({ documentId, notesId }) => `/content/${documentId}/notes/${notesId}`,
      providesTags: ['Notes'],
    }),
    updateNotes: builder.mutation({
      query: ({ notesId, updates }) => ({
        url: `/content/notes/${notesId}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Notes'],
    }),
    generateQuiz: builder.mutation({
      query: (documentId) => ({
        url: `/content/${documentId}/quiz/generate`,
        method: 'POST',
      }),
      invalidatesTags: ['Quiz'],
    }),
    getQuiz: builder.query({
      query: (quizId) => `/content/quiz/${quizId}`,
      providesTags: ['Quiz'],
    }),
    submitQuizResult: builder.mutation({
      query: (quizResult) => ({
        url: '/content/quiz/result',
        method: 'POST',
        body: quizResult,
      }),
      invalidatesTags: ['Progress'],
    }),
    generateFlashcards: builder.mutation({
      query: (documentId) => ({
        url: `/content/${documentId}/flashcards/generate`,
        method: 'POST',
      }),
      invalidatesTags: ['Flashcard'],
    }),
    getFlashcardDeck: builder.query({
      query: (documentId) => `/content/${documentId}/flashcards`,
      providesTags: ['Flashcard'],
    }),
    updateFlashcardProgress: builder.mutation({
      query: (progress) => ({
        url: '/content/flashcards/progress',
        method: 'POST',
        body: progress,
      }),
      invalidatesTags: ['Progress'],
    }),

    // Progress and session endpoints
    getUserProgress: builder.query({
      query: (documentId) => `/progress/${documentId}`,
      providesTags: ['Progress'],
    }),
    startLearningSession: builder.mutation({
      query: (documentId) => ({
        url: '/sessions/start',
        method: 'POST',
        body: { documentId },
      }),
    }),
    endLearningSession: builder.mutation({
      query: ({ sessionId, activities }) => ({
        url: `/sessions/${sessionId}/end`,
        method: 'POST',
        body: { activities },
      }),
      invalidatesTags: ['Progress'],
    }),

    // AI Assistant endpoints
    askAI: builder.mutation({
      query: ({ message, context, documentId }) => ({
        url: '/ai/chat',
        method: 'POST',
        body: { message, context, documentId },
      }),
    }),
    getAIExplanation: builder.mutation({
      query: ({ content, type, context }) => ({
        url: '/ai/explain',
        method: 'POST',
        body: { content, type, context },
      }),
    }),

    // Feedback endpoints
    submitFeedback: builder.mutation({
      query: (feedback) => ({
        url: '/feedback',
        method: 'POST',
        body: feedback,
      }),
    }),

    // Upload status endpoint
    getUploadStatus: builder.query({
      query: (uploadId) => `/upload/status/${uploadId}`,
    }),
  }),
});

// Export hooks
export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,

  useUploadDocumentMutation,
  useProcessYouTubeMutation,
  useGetDocumentsQuery,
  useGetDocumentQuery,
  useDeleteDocumentMutation,

  useGetProcessedContentQuery,
  useGenerateNotesMutation,
  useGetNotesQuery,
  useUpdateNotesMutation,
  useGenerateQuizMutation,
  useGetQuizQuery,
  useSubmitQuizResultMutation,
  useGenerateFlashcardsMutation,
  useGetFlashcardDeckQuery,
  useUpdateFlashcardProgressMutation,

  useGetUserProgressQuery,
  useStartLearningSessionMutation,
  useEndLearningSessionMutation,

  useAskAIMutation,
  useGetAIExplanationMutation,

  useSubmitFeedbackMutation,

  useGetUploadStatusQuery,
} = apiSlice;

// Export API utilities for non-hook usage
export const authAPI = {
  login: async (credentials: any) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },
  register: async (userData: any) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },
  refreshToken: async (token: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return response.json();
  },
  logout: async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },
  getProfile: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/profile`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
  updateProfile: async (userData: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },
};

export const contentAPI = {
  uploadDocument: async (formData: FormData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/upload/file`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    return response.json();
  },
  processYouTube: async (url: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/upload/youtube`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ url }),
    });
    return response.json();
  },
  getDocuments: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/documents`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
  getDocument: async (documentId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/documents/${documentId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
  getProcessedContent: async (documentId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/content/${documentId}/processed`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
  generateNotes: async (documentId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/content/${documentId}/notes/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
  getNotes: async (documentId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/content/${documentId}/notes`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
  updateNotes: async (notesId: string, updates: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/content/notes/${notesId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    return response.json();
  },
  generateQuiz: async (documentId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/content/${documentId}/quiz/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
  getQuiz: async (quizId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/content/quiz/${quizId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
  submitQuizResult: async (quizResult: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/content/quiz/result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(quizResult),
    });
    return response.json();
  },
  generateFlashcards: async (documentId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/content/${documentId}/flashcards/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
  getFlashcardDeck: async (documentId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/content/${documentId}/flashcards`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
  updateFlashcardProgress: async (progress: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/content/flashcards/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(progress),
    });
    return response.json();
  },
  getUserProgress: async (documentId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/progress/${documentId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
  startLearningSession: async (documentId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/sessions/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ documentId }),
    });
    return response.json();
  },
  endLearningSession: async (sessionId: string, activities: any[]) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/sessions/${sessionId}/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ activities }),
    });
    return response.json();
  },
};

export default apiSlice;