import { pool } from '../config/database';
import { User, CreateUserData, UserPreferences } from '../types';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export class UserModel {
  // Create a new user
  static async create(userData: CreateUserData): Promise<User> {
    const { email, password, name } = userData;
    const password_hash = await bcrypt.hash(password, 12);

    const defaultPreferences: UserPreferences = {
      theme: 'light',
      notifications: true,
      study_reminders: true,
      language: 'en',
    };

    const query = `
      INSERT INTO users (email, password_hash, name, preferences)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [email, password_hash, name, defaultPreferences]);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';

    try {
      const result = await pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return null;
    }

    return user;
  }

  // Update user profile
  static async update(id: string, updates: Partial<Omit<User, 'id' | 'email' | 'password_hash' | 'created_at'>>): Promise<User | null> {
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    // Build dynamic update query
    if (updates.name !== undefined) {
      setClause.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }

    if (updates.preferences !== undefined) {
      setClause.push(`preferences = $${paramIndex++}`);
      values.push(JSON.stringify(updates.preferences));
    }

    if (setClause.length === 0) {
      return this.findById(id);
    }

    // Add updated_at timestamp
    setClause.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE users
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Update user preferences
  static async updatePreferences(id: string, preferences: Partial<UserPreferences>): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) {
      return null;
    }

    const updatedPreferences = {
      ...user.preferences,
      ...preferences,
    };

    return this.update(id, { preferences: updatedPreferences });
  }

  // Change password
  static async changePassword(id: string, newPassword: string): Promise<boolean> {
    const password_hash = await bcrypt.hash(newPassword, 12);

    const query = `
      UPDATE users
      SET password_hash = $1, updated_at = NOW()
      WHERE id = $2
    `;

    try {
      const result = await pool.query(query, [password_hash, id]);
      return result.rowCount > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete user account
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1';

    try {
      const result = await pool.query(query, [id]);
      return result.rowCount > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get user statistics
  static async getStatistics(id: string): Promise<any> {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM documents WHERE user_id = $1) as total_documents,
        (SELECT COUNT(*) FROM notes n JOIN documents d ON n.document_id = d.id WHERE d.user_id = $1) as total_notes,
        (SELECT COUNT(*) FROM quizzes q JOIN documents d ON q.document_id = d.id WHERE d.user_id = $1) as total_quizzes,
        (SELECT COUNT(*) FROM flashcards f JOIN documents d ON f.document_id = d.id WHERE d.user_id = $1) as total_flashcards,
        (SELECT AVG(score) FROM quiz_results qr JOIN quizzes q ON qr.quiz_id = q.id JOIN documents d ON q.document_id = d.id WHERE d.user_id = $1) as average_quiz_score,
        (SELECT COUNT(*) FROM learning_sessions WHERE user_id = $1) as total_sessions
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}