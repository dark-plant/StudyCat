import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { UserModel } from '../models/User';
import { authenticate } from '../middleware/auth';
import { LoginCredentials, CreateUserData } from '../types';

const router = Router();

// Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const userData: CreateUserData = req.body;

    // Validate required fields
    if (!userData.email || !userData.password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Validate password strength
    if (userData.password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long',
      });
    }

    const result = await AuthService.register(userData);

    res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Registration failed',
    });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const credentials: LoginCredentials = req.body;

    // Validate required fields
    if (!credentials.email || !credentials.password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const result = await AuthService.login(credentials);

    res.json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message || 'Login failed',
    });
  }
});

// Refresh access token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
    }

    const result = await AuthService.refreshToken(refresh_token);

    res.json({
      success: true,
      data: result,
      message: 'Token refreshed successfully',
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message || 'Token refresh failed',
    });
  }
});

// Get current user profile
router.get('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: { user: userWithoutPassword },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch profile',
    });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const updates = req.body;

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Allowed updates
    const allowedUpdates = ['name', 'preferences'];
    const actualUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    if (Object.keys(actualUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid updates provided',
      });
    }

    const updatedUser = await UserModel.update(user.id, actualUpdates);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      data: { user: userWithoutPassword },
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update profile',
    });
  }
});

// Change password
router.put('/password', authenticate, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { current_password, new_password } = req.body;

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required',
      });
    }

    // Validate new password strength
    if (new_password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long',
      });
    }

    // Verify current password
    const isValidUser = await UserModel.verifyPassword(user.email, current_password);
    if (!isValidUser) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect',
      });
    }

    // Update password
    await UserModel.changePassword(user.id, new_password);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to change password',
    });
  }
});

// Logout user
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  try {
    // In a more advanced implementation, you might want to
    // invalidate the token or add it to a blacklist
    await AuthService.logout();

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Logout failed',
    });
  }
});

// Get user statistics
router.get('/statistics', authenticate, async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const statistics = await UserModel.getStatistics(user.id);

    res.json({
      success: true,
      data: statistics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch statistics',
    });
  }
});

export default router;