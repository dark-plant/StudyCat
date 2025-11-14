import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Avatar,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  motion,
  AnimatePresence,
} from 'framer-motion';
import {
  School,
  Psychology,
  EmojiEvents,
  Pets,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/redux';
import { openAIAssistant } from '../../features/ui/uiSlice';

const WelcomeScreen: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isHovered, setIsHovered] = useState(false);

  const features = [
    {
      icon: <School sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Smart Learning',
      description: 'AI-powered content analysis turns any material into interactive learning experiences',
    },
    {
      icon: <Psychology sx={{ fontSize: 40, color: theme.palette.secondary.main }} />,
      title: 'Personalized Tutor',
      description: 'Get instant explanations and help from your AI assistant available 24/7',
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 40, color: theme.palette.accent?.main || '#4CAF50' }} />,
      title: 'Track Progress',
      description: 'Monitor your learning journey with detailed progress tracking and achievements',
    },
  ];

  const handleStartLearning = () => {
    navigate('/input');
  };

  const handleLogin = () => {
    // For now, navigate to input screen (guest mode)
    // In a real app, this would open a login modal
    navigate('/input');
  };

  const handleAskAI = () => {
    dispatch(openAIAssistant({
      context: 'general',
      initialMessage: "Hi! I'm new to ActiveLearn. How does this work?"
    }));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.light}22 100%)`,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.primary.main}22 0%, transparent 70%)`,
          opacity: 0.6,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.secondary.main}22 0%, transparent 70%)`,
          opacity: 0.4,
        }}
      />

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                {/* Cat Avatar */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  sx={{ display: 'inline-block', mb: 3 }}
                >
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      fontSize: '2.5rem',
                      mb: 2,
                      mx: { xs: 'auto', md: 0 },
                    }}
                  >
                    🐱
                  </Avatar>
                </motion.div>

                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    mb: 2,
                    lineHeight: 1.2,
                  }}
                >
                  Welcome to{' '}
                  <Box component="span" sx={{ color: theme.palette.secondary.main }}>
                    ActiveLearn
                  </Box>
                  !
                </Typography>

                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    color: theme.palette.text.secondary,
                    mb: 4,
                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                    lineHeight: 1.5,
                  }}
                >
                  Let's make learning interactive and fun!
                </Typography>

                {/* CTA Buttons */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    mb: 4,
                    justifyContent: { xs: 'center', md: 'flex-start' },
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleStartLearning}
                      sx={{
                        px: 4,
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        borderRadius: 8,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        boxShadow: theme.shadows[4],
                        '&:hover': {
                          boxShadow: theme.shadows[8],
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      Start Your Learning Journey
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={handleLogin}
                      sx={{
                        px: 4,
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        borderRadius: 8,
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2,
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      Login / Sign Up
                    </Button>
                  </motion.div>
                </Box>

                {/* Quick AI Chat */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1 }}
                >
                  <Button
                    variant="text"
                    onClick={handleAskAI}
                    startIcon={<Psychology />}
                    sx={{
                      color: theme.palette.text.secondary,
                      '&:hover': {
                        backgroundColor: 'transparent',
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    Ask AI how it works
                  </Button>
                </motion.div>
              </Box>
            </motion.div>
          </Grid>

          {/* Features Section */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Paper
                      elevation={2}
                      sx={{
                        p: 3,
                        borderRadius: 4,
                        display: 'flex',
                        gap: 3,
                        alignItems: 'flex-start',
                        backgroundColor: theme.palette.background.paper,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: theme.shadows[4],
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Box sx={{ flexShrink: 0 }}>
                        {feature.icon}
                      </Box>
                      <Box>
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{
                            fontWeight: 600,
                            mb: 1,
                            color: theme.palette.text.primary,
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                            lineHeight: 1.6,
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </Box>
                    </Paper>
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          textAlign: 'center',
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Made with 🐱 love for better learning
        </Typography>
      </Box>
    </Box>
  );
};

export default WelcomeScreen;