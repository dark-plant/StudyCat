import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Fab,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  motion,
  AnimatePresence,
} from 'framer-motion';
import {
  Psychology,
  Settings,
  ArrowBack,
  Menu,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { setCurrentTab } from '../../features/ui/uiSlice';
import { openAIAssistant } from '../../features/ui/uiSlice';

// Tab components
import NotesTab from '../../components/learning/NotesTab';
import QuizzesTab from '../../components/learning/QuizzesTab';
import FlashcardsTab from '../../components/learning/FlashcardsTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <AnimatePresence mode="wait">
      {value === index && (
        <motion.div
          key={`tab-${index}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{ py: 3 }}>
            {children}
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const DashboardScreen: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const currentTab = useAppSelector((state) => state.ui.navigation.currentTab);
  const currentDocument = useAppSelector((state) => state.content.currentDocument);
  const notes = useAppSelector((state) => state.content.notes);
  const quiz = useAppSelector((state) => state.content.quiz);
  const flashcardDeck = useAppSelector((state) => state.content.flashcardDeck);
  const userProgress = useAppSelector((state) => state.content.userProgress);

  const [tabValue, setTabValue] = useState(0);

  const tabs = [
    { label: 'Notes', value: 'notes', icon: '📝' },
    { label: 'Quizzes', value: 'quizzes', icon: '🎯' },
    { label: 'Flashcards', value: 'flashcards', icon: '🎴' },
  ];

  useEffect(() => {
    // Map Redux state to local tab value
    const tabIndex = tabs.findIndex(tab => tab.value === currentTab);
    if (tabIndex !== -1 && tabIndex !== tabValue) {
      setTabValue(tabIndex);
    }
  }, [currentTab, tabValue]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    const tabName = tabs[newValue].value as 'notes' | 'quizzes' | 'flashcards';
    dispatch(setCurrentTab(tabName));
  };

  const handleBack = () => {
    navigate('/input');
  };

  const handleAskAI = () => {
    dispatch(openAIAssistant({
      context: currentTab,
      initialMessage: `Hi! I'm looking at the ${currentTab} for "${currentDocument?.title || 'this content'}". Can you help me understand it better?`
    }));
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const getTabBadge = (tabValue: string) => {
    switch (tabValue) {
      case 'notes':
        return notes ? 1 : 0;
      case 'quizzes':
        return quiz ? 1 : 0;
      case 'flashcards':
        return flashcardDeck?.flashcards.length || 0;
      default:
        return 0;
    }
  };

  if (!currentDocument) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No document loaded
          </Typography>
          <Button variant="contained" onClick={handleBack}>
            Upload Content
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.light}11 100%)`,
        pb: 8, // Extra padding for floating buttons
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          elevation={2}
          sx={{
            borderRadius: { xs: 0, md: 2 },
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.light}05 100%)`,
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ py: 3 }}>
              {/* Top Navigation */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconButton onClick={handleBack} sx={{ mr: 1 }}>
                    <ArrowBack />
                  </IconButton>
                  <Box>
                    <Typography variant="h4" component="h1" fontWeight={600}>
                      Learning Dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {currentDocument.title}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Tooltip title="Settings">
                    <IconButton onClick={handleSettings}>
                      <Settings />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="AI Assistant">
                    <IconButton onClick={handleAskAI}>
                      <Psychology />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Document Info Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    background: `${theme.palette.primary.main}08`,
                    border: `1px solid ${theme.palette.primary.main}20`,
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Type:
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {currentDocument.contentType.toUpperCase()}
                      </Typography>
                    </Box>

                    {userProgress && (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Progress:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {Math.round((userProgress.notesProgress.sectionsRead / Math.max(userProgress.notesProgress.totalSections, 1)) * 100)}%
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Study Time:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {Math.round((userProgress.notesProgress.timeSpent + userProgress.quizProgress.timeSpent) / 60)} min
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </Paper>
              </motion.div>

              {/* Tab Navigation */}
              <Box sx={{ mt: 3 }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant={isMobile ? 'fullWidth' : 'standard'}
                  sx={{
                    '& .MuiTabs-indicator': {
                      background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      height: 3,
                    },
                  }}
                >
                  {tabs.map((tab, index) => (
                    <Tab
                      key={tab.value}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{tab.icon}</span>
                          <span>{tab.label}</span>
                          {getTabBadge(tab.value) > 0 && (
                            <Badge
                              badgeContent={getTabBadge(tab.value)}
                              color="primary"
                              sx={{
                                '& .MuiBadge-badge': {
                                  fontSize: '0.6rem',
                                  height: 16,
                                  minWidth: 16,
                                },
                              }}
                            />
                          )}
                        </Box>
                      }
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '1rem',
                        minHeight: 48,
                        px: 2,
                      }}
                    />
                  ))}
                </Tabs>
              </Box>
            </Box>
          </Container>
        </Paper>
      </motion.div>

      {/* Tab Content */}
      <Container maxWidth="lg" sx={{ mt: 2 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <TabPanel value={tabValue} index={0}>
            <NotesTab />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <QuizzesTab />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <FlashcardsTab />
          </TabPanel>
        </motion.div>
      </Container>

      {/* Floating AI Assistant Button */}
      <Fab
        color="secondary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        }}
        onClick={handleAskAI}
      >
        <Psychology />
      </Fab>

      {/* Mobile Menu Button (if needed) */}
      {isMobile && (
        <Fab
          color="default"
          size="small"
          sx={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            zIndex: 1000,
          }}
          onClick={() => {
            // Mobile menu functionality
          }}
        >
          <Menu />
        </Fab>
      )}
    </Box>
  );
};

export default DashboardScreen;