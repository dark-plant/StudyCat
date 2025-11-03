import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const config: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'activelearn',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(config);

// Database initialization
export const initializeDatabase = async () => {
  try {
    // Test connection
    const client = await pool.connect();
    console.log('Database connected successfully');
    client.release();

    // Create tables if they don't exist
    await createTables();
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

const createTables = async () => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      preferences JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const createDocumentsTable = `
    CREATE TABLE IF NOT EXISTS documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(500) NOT NULL,
      content_type VARCHAR(50) NOT NULL,
      original_content TEXT,
      processed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const createProcessedContentTable = `
    CREATE TABLE IF NOT EXISTS processed_content (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
      summary TEXT,
      key_points TEXT[],
      concepts TEXT[],
      difficulty VARCHAR(20) DEFAULT 'intermediate',
      processing_metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const createNotesTable = `
    CREATE TABLE IF NOT EXISTS notes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
      title VARCHAR(500) NOT NULL,
      content JSONB NOT NULL,
      ai_generated BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const createQuizzesTable = `
    CREATE TABLE IF NOT EXISTS quizzes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
      title VARCHAR(500) NOT NULL,
      questions JSONB NOT NULL,
      difficulty VARCHAR(20) DEFAULT 'intermediate',
      time_limit INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const createQuizResultsTable = `
    CREATE TABLE IF NOT EXISTS quiz_results (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
      answers JSONB NOT NULL,
      score INTEGER NOT NULL,
      total_points INTEGER NOT NULL,
      completed_at TIMESTAMP DEFAULT NOW(),
      time_spent INTEGER NOT NULL
    );
  `;

  const createFlashcardsTable = `
    CREATE TABLE IF NOT EXISTS flashcards (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
      term VARCHAR(500) NOT NULL,
      definition TEXT NOT NULL,
      difficulty VARCHAR(20) DEFAULT 'medium',
      category VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const createFlashcardProgressTable = `
    CREATE TABLE IF NOT EXISTS flashcard_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      flashcard_id UUID REFERENCES flashcards(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(20) DEFAULT 'new',
      last_reviewed TIMESTAMP DEFAULT NOW(),
      review_count INTEGER DEFAULT 0,
      correct_count INTEGER DEFAULT 0,
      next_review TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const createLearningSessionsTable = `
    CREATE TABLE IF NOT EXISTS learning_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
      start_time TIMESTAMP DEFAULT NOW(),
      end_time TIMESTAMP,
      activities JSONB DEFAULT '[]',
      total_time INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const createUserProgressTable = `
    CREATE TABLE IF NOT EXISTS user_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
      notes_progress JSONB DEFAULT '{}',
      quiz_progress JSONB DEFAULT '{}',
      flashcard_progress JSONB DEFAULT '{}',
      last_accessed TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const createFeedbackTable = `
    CREATE TABLE IF NOT EXISTS feedback (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      rating VARCHAR(50) NOT NULL,
      comment TEXT,
      context JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  // Create indexes for better performance
  const createIndexes = [
    'CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_documents_content_type ON documents(content_type);',
    'CREATE INDEX IF NOT EXISTS idx_processed_content_document_id ON processed_content(document_id);',
    'CREATE INDEX IF NOT EXISTS idx_notes_document_id ON notes(document_id);',
    'CREATE INDEX IF NOT EXISTS idx_quizzes_document_id ON quizzes(document_id);',
    'CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON quiz_results(quiz_id);',
    'CREATE INDEX IF NOT EXISTS idx_flashcards_document_id ON flashcards(document_id);',
    'CREATE INDEX IF NOT EXISTS idx_flashcard_progress_user_id ON flashcard_progress(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_flashcard_progress_flashcard_id ON flashcard_progress(flashcard_id);',
    'CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_id ON learning_sessions(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_learning_sessions_document_id ON learning_sessions(document_id);',
    'CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_user_progress_document_id ON user_progress(document_id);',
    'CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);',
  ];

  const tables = [
    createUsersTable,
    createDocumentsTable,
    createProcessedContentTable,
    createNotesTable,
    createQuizzesTable,
    createQuizResultsTable,
    createFlashcardsTable,
    createFlashcardProgressTable,
    createLearningSessionsTable,
    createUserProgressTable,
    createFeedbackTable,
  ];

  try {
    // Create tables
    for (const table of tables) {
      await pool.query(table);
    }

    // Create indexes
    for (const index of createIndexes) {
      await pool.query(index);
    }

    console.log('Database tables and indexes created successfully');
  } catch (error) {
    console.error('Error creating database tables:', error);
    throw error;
  }
};

export default pool;