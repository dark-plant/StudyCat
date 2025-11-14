import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Avatar,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  motion,
} from 'framer-motion';
import {
  ArrowBack,
  Settings,
  Person,
  Notifications,
  DarkMode,
  LightMode,
  Email,
  Lock,
  VolumeUp,
  Language,
  Help,
  Info,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { setTheme } from '../../features/ui/uiSlice';
import { updateUserProfile } from '../../features/auth/authSlice';
import { addNotification } from '../../features/ui/uiSlice';

const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const user = useAppSelector((state) => state.auth.user);
  const currentTheme = useAppSelector((state) => state.ui.theme);

  const [notifications, setNotifications] = useState(user?.preferences?.notifications ?? true);
  const [studyReminders, setStudyReminders] = useState(user?.preferences?.study_reminders ?? true);
  const [language, setLanguage] = useState(user?.preferences?.language ?? 'en');
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleThemeToggle = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
    dispatch(addNotification({
      type: 'success',
      title: 'Theme Updated',
      message: `Switched to ${newTheme} mode`,
      duration: 3000,
    }));
  };

  const handleNotificationToggle = (setting: 'notifications' | 'study_reminders') => {
    const newValue = setting === 'notifications' ? !notifications : !studyReminders;

    if (setting === 'notifications') {
      setNotifications(newValue);
    } else {
      setStudyReminders(newValue);
    }

    if (user) {
      dispatch(updateUserProfile({
        preferences: {
          ...user.preferences,
          [setting]: newValue,
        },
      }));
    }

    dispatch(addNotification({
      type: 'success',
      title: 'Settings Updated',
      message: `${setting === 'notifications' ? 'Notifications' : 'Study reminders'} ${newValue ? 'enabled' : 'disabled'}`,
      duration: 3000,
    }));
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);

    if (user) {
      dispatch(updateUserProfile({
        preferences: {
          ...user.preferences,
          language: newLanguage,
        },
      }));
    }

    dispatch(addNotification({
      type: 'success',
      title: 'Language Updated',
      message: `Language changed to ${newLanguage}`,
      duration: 3000,
    }));
  };

  const handleSaveProfile = () => {
    if (user) {
      dispatch(updateUserProfile({
        name: profileName,
      }));
    }
    setShowProfileDialog(false);
    dispatch(addNotification({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your profile has been updated successfully',
      duration: 3000,
    }));
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      dispatch(addNotification({
        type: 'error',
        title: 'Password Mismatch',
        message: 'New password and confirmation do not match',
        duration: 5000,
      }));
      return;
    }

    if (newPassword.length < 8) {
      dispatch(addNotification({
        type: 'error',
        title: 'Password Too Short',
        message: 'Password must be at least 8 characters long',
        duration: 5000,
      }));
      return;
    }

    // In a real app, this would call the password change API
    setShowPasswordDialog(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    dispatch(addNotification({
      type: 'success',
      title: 'Password Changed',
      message: 'Your password has been updated successfully',
      duration: 3000,
    }));
  };

  const settingsCategories = [
    {
      title: 'Appearance',
      icon: currentTheme === 'light' ? <LightMode /> : <DarkMode />,
      items: [
        {
          key: 'theme',
          label: 'Theme Mode',
          description: currentTheme === 'light' ? 'Light mode' : 'Dark mode',
          action: 'toggle',
          value: currentTheme === 'dark',
        },
      ],
    },
    {
      title: 'Notifications',
      icon: <Notifications />,
      items: [
        {
          key: 'notifications',
          label: 'Push Notifications',
          description: 'Receive notifications about your learning progress',
          action: 'toggle',
          value: notifications,
        },
        {
          key: 'studyReminders',
          label: 'Study Reminders',
          description: 'Get reminded to study and review materials',
          action: 'toggle',
          value: studyReminders,
        },
      ],
    },
    {
      title: 'Preferences',
      icon: <Settings />,
      items: [
        {
          key: 'language',
          label: 'Language',
          description: 'Choose your preferred language',
          action: 'select',
          value: language,
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Español' },
            { value: 'fr', label: 'Français' },
            { value: 'de', label: 'Deutsch' },
            { value: 'zh', label: '中文' },
          ],
        },
      ],
    },
    {
      title: 'Account',
      icon: <Person />,
      items: [
        {
          key: 'profile',
          label: 'Edit Profile',
          description: 'Update your name and profile information',
          action: 'dialog',
        },
        {
          key: 'password',
          label: 'Change Password',
          description: 'Update your account password',
          action: 'dialog',
        },
        {
          key: 'email',
          label: 'Email Address',
          description: user?.email || '',
          action: 'readonly',
        },
      ],
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.light}11 100%)`,
        py: 4,
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" component="h1" fontWeight={600}>
              Settings
            </Typography>
          </Box>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Paper
            elevation={2}
            sx={{
              p: 3,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.light}05 100%)`,
            }}
          >
            <Avatar
              sx={{
                width: 64,
                height: 64,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                fontSize: '1.5rem',
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                {user?.name || 'Active Learner'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              onClick={() => setShowProfileDialog(true)}
            >
              Edit Profile
            </Button>
          </Paper>
        </motion.div>

        {/* Settings Categories */}
        {settingsCategories.map((category, categoryIndex) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + categoryIndex * 0.1 }}
          >
            <Paper
              elevation={1}
              sx={{
                mb: 3,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: 2, backgroundColor: theme.palette.primary.main + '08' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: theme.palette.primary.main }}>
                    {category.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={600}>
                    {category.title}
                  </Typography>
                </Box>
              </Box>

              <List sx={{ p: 0 }}>
                {category.items.map((item, itemIndex) => (
                  <React.Fragment key={item.key}>
                    <ListItem
                      sx={{
                        py: 2,
                        px: 3,
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {item.key === 'theme' && (currentTheme === 'light' ? <LightMode /> : <DarkMode />)}
                        {item.key === 'notifications' && <Notifications />}
                        {item.key === 'studyReminders' && <VolumeUp />}
                        {item.key === 'language' && <Language />}
                        {item.key === 'profile' && <Person />}
                        {item.key === 'password' && <Lock />}
                        {item.key === 'email' && <Email />}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        secondary={item.description}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                      <Box>
                        {item.action === 'toggle' && (
                          <Switch
                            checked={item.value}
                            onChange={() => {
                              if (item.key === 'theme') {
                                handleThemeToggle();
                              } else {
                                handleNotificationToggle(item.key as 'notifications' | 'study_reminders');
                              }
                            }}
                          />
                        )}
                        {item.action === 'select' && (
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={item.value}
                              onChange={(e) => handleLanguageChange(e.target.value)}
                            >
                              {item.options?.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                        {item.action === 'dialog' && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              if (item.key === 'profile') {
                                setShowProfileDialog(true);
                              } else if (item.key === 'password') {
                                setShowPasswordDialog(true);
                              }
                            }}
                          >
                            {item.key === 'profile' ? 'Edit' : 'Change'}
                          </Button>
                        )}
                        {item.action === 'readonly' && (
                          <Typography variant="body2" color="text.secondary">
                            {item.value}
                          </Typography>
                        )}
                      </Box>
                    </ListItem>
                    {itemIndex < category.items.length - 1 && (
                      <Divider />
                    )}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </motion.div>
        ))}

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Paper
            elevation={1}
            sx={{
              p: 3,
              textAlign: 'center',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
              <Info color="primary" />
              <Typography variant="h6" fontWeight={600}>
                About ActiveLearn
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Version 1.0.0 • Made with 🐱 love for better learning
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button variant="text" size="small">
                Privacy Policy
              </Button>
              <Button variant="text" size="small">
                Terms of Service
              </Button>
              <Button variant="text" size="small" startIcon={<Help />}>
                Help & Support
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Container>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onClose={() => setShowProfileDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowProfileDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveProfile} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Current Password"
            type="password"
            fullWidth
            variant="outlined"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Confirm New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsScreen;