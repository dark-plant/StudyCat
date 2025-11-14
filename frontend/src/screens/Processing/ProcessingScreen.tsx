import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  LinearProgress,
  Paper,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import CatLoader from '../../components/animations/CatLoader';
import { setProcessingStage, setProcessingProgress, clearCurrentDocument } from '../../features/content/contentSlice';
import { addNotification } from '../../features/ui/uiSlice';

const ProcessingScreen: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const processingStage = useAppSelector((state) => state.content.processingStage);
  const processingProgress = useAppSelector((state) => state.content.processingProgress);
  const currentDocument = useAppSelector((state) => state.content.currentDocument);
  const isProcessing = useAppSelector((state) => state.content.isProcessing);

  const [stages, setStages] = useState([
    { name: 'uploading', label: 'Uploading Content', completed: false },
    { name: 'extracting', label: 'Extracting Text', completed: false },
    { name: 'analyzing', label: 'AI Analysis', completed: false },
    { name: 'generating', label: 'Creating Materials', completed: false },
    { name: 'complete', label: 'Complete!', completed: false },
  ]);

  // Simulate processing stages
  useEffect(() => {
    if (!isProcessing) return;

    const stageSequence = ['uploading', 'extracting', 'analyzing', 'generating', 'complete'];
    let currentStageIndex = 0;

    const processStages = () => {
      if (currentStageIndex < stageSequence.length) {
        const stage = stageSequence[currentStageIndex];
        dispatch(setProcessingStage(stage as any));

        // Update progress
        const progress = ((currentStageIndex + 1) / stageSequence.length) * 100;
        dispatch(setProcessingProgress(progress));

        // Update stage completion
        setStages(prev => prev.map((s, i) => ({
          ...s,
          completed: i <= currentStageIndex,
        })));

        currentStageIndex++;

        if (stage === 'complete') {
          // Processing complete - navigate to dashboard
          setTimeout(() => {
            dispatch(addNotification({
              type: 'success',
              title: 'Processing Complete!',
              message: 'Your learning materials are ready. Let\'s start studying!',
              duration: 5000,
            }));
            navigate('/dashboard');
          }, 2000);
          return;
        }

        // Continue to next stage
        const delay = stage === 'analyzing' ? 3000 : 2000; // AI analysis takes longer
        setTimeout(processStages, delay);
      }
    };

    // Start processing
    const timer = setTimeout(processStages, 1000);

    return () => clearTimeout(timer);
  }, [dispatch, navigate, isProcessing]);

  const handleCancel = () => {
    dispatch(clearCurrentDocument());
    dispatch(setProcessingStage('idle'));
    navigate('/input');
  };

  const getStageColor = (stage: { name: string; completed: boolean }) => {
    if (stage.completed) return theme.palette.success.main;
    if (processingStage === stage.name) return theme.palette.primary.main;
    return theme.palette.grey[400];
  };

  const getStageIcon = (stageName: string) => {
    switch (stageName) {
      case 'uploading':
        return '📤';
      case 'extracting':
        return '📄';
      case 'analyzing':
        return '🧠';
      case 'generating':
        return '✨';
      case 'complete':
        return '✅';
      default:
        return '⏳';
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
            No document found
          </Typography>
          <Button variant="contained" onClick={() => navigate('/input')}>
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
        display: 'flex',
        flexDirection: 'column',
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
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" fontWeight={600} sx={{ mb: 2 }}>
              Processing Your Content
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {currentDocument.title}
            </Typography>
          </Box>
        </motion.div>

        {/* Main Processing Area */}
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 4,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.light}05 100%)`,
          }}
        >
          {/* Background decoration */}
          <Box
            sx={{
              position: 'absolute',
              top: -100,
              right: -100,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${theme.palette.primary.main}10 0%, transparent 70%)`,
              opacity: 0.5,
            }}
          />

          {/* Cat Loader */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <Box sx={{ mb: 4 }}>
              <CatLoader
                size={isMobile ? 80 : 120}
                stage={processingStage}
                speed={processingStage === 'analyzing' ? 3 : 2}
              />
            </Box>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Processing Progress
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(processingProgress)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={processingProgress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  },
                }}
              />
            </Box>
          </motion.div>

          {/* Stage Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Processing Stages
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 2, sm: 1 },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'stretch', sm: 'center' },
                }}
              >
                {stages.map((stage, index) => (
                  <motion.div
                    key={stage.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: stage.completed
                          ? `${theme.palette.success.main}10`
                          : processingStage === stage.name
                          ? `${theme.palette.primary.main}10`
                          : 'transparent',
                        border: `2px solid ${getStageColor(stage)}30`,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <motion.div
                        animate={{
                          scale: processingStage === stage.name ? [1, 1.2, 1] : 1,
                        }}
                        transition={{
                          duration: 1,
                          repeat: processingStage === stage.name ? Infinity : 0,
                          ease: "easeInOut",
                        }}
                      >
                        <Typography
                          variant="h4"
                          sx={{
                            fontSize: '2rem',
                            filter: stage.completed ? 'none' : 'grayscale(80%)',
                          }}
                        >
                          {getStageIcon(stage.name)}
                        </Typography>
                      </motion.div>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: stage.completed || processingStage === stage.name ? 600 : 400,
                          color: getStageColor(stage),
                          textAlign: 'center',
                        }}
                      >
                        {stage.label}
                      </Typography>
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </Box>
          </motion.div>

          {/* Status Messages */}
          <AnimatePresence mode="wait">
            <motion.div
              key={processingStage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ mb: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  {processingStage === 'uploading' && 'Your file is being securely uploaded to our servers...'}
                  {processingStage === 'extracting' && 'Extracting text content from your document...'}
                  {processingStage === 'analyzing' && 'Our AI is analyzing the content to identify key concepts...'}
                  {processingStage === 'generating' && 'Creating personalized learning materials just for you...'}
                  {processingStage === 'complete' && 'All done! Your learning materials are ready.'}
                </Typography>
              </Box>
            </motion.div>
          </AnimatePresence>

          {/* Cancel Button */}
          {processingStage !== 'complete' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Button
                variant="outlined"
                onClick={handleCancel}
                sx={{
                  borderRadius: 8,
                  px: 4,
                }}
              >
                Cancel Processing
              </Button>
            </motion.div>
          )}

          {/* Complete Button */}
          {processingStage === 'complete' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/dashboard')}
                sx={{
                  borderRadius: 8,
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                }}
              >
                Start Learning
              </Button>
            </motion.div>
          )}
        </Paper>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Paper
            elevation={1}
            sx={{
              mt: 4,
              p: 3,
              borderRadius: 3,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              💡 Pro Tips
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Processing time varies based on content size and complexity
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                AI analysis ensures your learning materials are personalized to your content
              </Typography>
              <Typography component="li" variant="body2">
                All materials are stored securely and accessible anytime
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ProcessingScreen;