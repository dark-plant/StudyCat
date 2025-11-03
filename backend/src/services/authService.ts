import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { User, LoginCredentials, CreateUserData, AuthResponse, JWTPayload } from '../types';

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
  private static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-production';
  private static readonly JWT_EXPIRES_IN = '15m';
  private static readonly JWT_REFRESH_EXPIRES_IN = '7d';

  // Register a new user
  static async register(userData: CreateUserData): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await UserModel.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Create new user
      const user = await UserModel.create(userData);

      // Generate tokens
      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Return user data without password hash
      const { password_hash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        token,
        refresh_token: refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  // Login user
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const user = await UserModel.verifyPassword(credentials.email, credentials.password);

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Generate tokens
      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Return user data without password hash
      const { password_hash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        token,
        refresh_token: refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  // Refresh access token
  static async refreshToken(refreshToken: string): Promise<{ token: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as JWTPayload;

      // Get user from database
      const user = await UserModel.findById(decoded.user_id);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new access token
      const token = this.generateToken(user);

      return { token };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  // Generate access token
  private static generateToken(user: User): string {
    const payload: JWTPayload = {
      user_id: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  // Generate refresh token
  private static generateRefreshToken(user: User): string {
    const payload: JWTPayload = {
      user_id: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN,
    });
  }

  // Verify access token
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Get user from token
  static async getUserFromToken(token: string): Promise<User | null> {
    try {
      const decoded = this.verifyToken(token);
      return await UserModel.findById(decoded.user_id);
    } catch (error) {
      return null;
    }
  }

  // Logout (client-side responsibility - just delete tokens)
  static async logout(): Promise<void> {
    // In a more advanced implementation, you might want to maintain a blacklist
    // of invalidated tokens or store refresh tokens in the database
    // For now, we'll rely on client-side token deletion
  }
}