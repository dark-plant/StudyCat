import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  useTheme,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  useMediaQuery,
} from '@mui/material';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import {
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Psychology,
  FlipCameraAndroid,
  Shuffle,
  Refresh,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { generateFlashcards, fetchFlashcardDeck, updateFlashcardProgress } from '../../features/content/contentSlice';
import { openAIAssistant } from '../../features/ui/uiSlice';
import { Flashcard, FlashcardProgress } from '../../types';

const FlashcardsTab: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const currentDocument = useAppSelector((state) => state.content.currentDocument);
  const flashcardDeck = useAppSelector((state) => state.content.flashcardDeck);
  const isLoading = useAppSelector((state) => state.content.isLoading);
  const isProcessing = useAppSelector((state) => state.content.isProcessing);

  const [isFlipped, setIsFlipped] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [studyMode, setStudyMode] = useState<'all' | 'unknown' | 'learning'>('all');
  const [showStats, setShowStats] = useState(false);
  const [dragX, setDragX] = useState(0);

  // Motion values for card swipe
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-30, 0, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 0.5, 1, 0.5, 0]);

  useEffect(() => {
    if (currentDocument && !flashcardDeck) {
      dispatch(generateFlashcards(currentDocument.id));
    }
  }, [currentDocument, flashcardDeck, dispatch]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNextCard = () => {
    if (flashcardDeck && currentCardIndex < flashcardDeck.flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
      x.set(0);
    }
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setIsFlipped(false);
      x.set(0);
    }
  };

  const handleCardResponse = (status: 'known' | 'learning' | 'review') => {
    if (!flashcardDeck) return;

    const currentCard = flashcardDeck.flashcards[currentCardIndex];

    // Update progress (in a real app, this would be saved to backend)
    dispatch(updateFlashcardProgress({
      flashcardId: currentCard.id,
      status,
    }));

    // Move to next card
    if (currentCardIndex < flashcardDeck.flashcards.length - 1) {
      handleNextCard();
    } else {
      // Show completion message
      setShowStats(true);
    }
  };

  const handleDragEnd = () => {
    const threshold = 100;

    if (dragX > threshold) {
      // Swipe right - mark as known
      handleCardResponse('known');
    } else if (dragX < -threshold) {
      // Swipe left - mark as learning
      handleCardResponse('learning');
    } else {
      // Reset position
      x.set(0);
    }
  };

  const handleShuffle = () => {
    if (flashcardDeck) {
      const shuffled = [...flashcardDeck.flashcards].sort(() => Math.random() - 0.5);
      // In a real app, this would update the deck order
      setCurrentCardIndex(0);
      setIsFlipped(false);
    }
  };

  const handleAskAI = (card: Flashcard) => {
    dispatch(openAIAssistant({
      context: 'flashcard',
      initialMessage: `Can you give me more examples of "${card.term}" or explain it in a different way?`
    }));
  };

  const getFilteredCards = () => {
    if (!flashcardDeck) return [];

    switch (studyMode) {
      case 'unknown':
        return flashcardDeck.flashcards.filter(card => card.difficulty === 'hard');
      case 'learning':
        return flashcardDeck.flashcards.filter(card => card.difficulty === 'medium');
      default:
        return flashcardDeck.flashcards;
    }
  };

  const filteredCards = getFilteredCards();
  const currentCard = filteredCards[currentCardIndex];

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Generating your flashcards...
        </Typography>
      </Box>
    );
  }

  if (!flashcardDeck || flashcardDeck.flashcards.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          No flashcards available
        </Typography>
        <Button
          variant="contained"
          onClick={() => currentDocument && dispatch(generateFlashcards(currentDocument.id))}
          disabled={isProcessing}
        >
          Generate Flashcards
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Flashcards Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 3,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.light}05 100%)`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" component="h2" fontWeight={600} sx={{ mb: 1 }}>
                🎴 {flashcardDeck.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {flashcardDeck.flashcards.length} cards • Swipe right for known, left for needs review
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={handleShuffle}>
                <Shuffle />
              </IconButton>
              <IconButton onClick={() => setShowStats(true)}>
                <CheckCircle />
              </IconButton>
            </Box>
          </Box>

          {/* Study Mode Filter */}
          <Box sx={{ mt: 2 }}>
            <Chip
              label="All Cards"
              onClick={() => setStudyMode('all')}
              color={studyMode === 'all' ? 'primary' : 'default'}
              sx={{ mr: 1 }}
            />
            <Chip
              label="Hard Cards"
              onClick={() => setStudyMode('unknown')}
              color={studyMode === 'unknown' ? 'primary' : 'default'}
              sx={{ mr: 1 }}
            />
            <Chip
              label="Learning"
              onClick={() => setStudyMode('learning')}
              color={studyMode === 'learning' ? 'primary' : 'default'}
            />
          </Box>
        </Paper>
      </motion.div>

      {/* Progress Bar */}
      <Box sx={{ mb: 3, px: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Progress: {currentCardIndex + 1} of {filteredCards.length}
        </Typography>
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.grey[200],
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${((currentCardIndex + 1) / filteredCards.length) * 100}%`,
              borderRadius: 4,
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              transition: 'width 0.3s ease',
            }}
          />
        </Box>
      </Box>

      {/* Flashcard */}
      {currentCard && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              perspective: '1000px',
              marginBottom: '2rem',
            }}
          >
            <motion.div
              style={{
                rotateY: isFlipped ? 180 : 0,
                transformStyle: 'preserve-3d',
                transition: 'transform 0.6s',
              }}
            >
              {/* Front of card */}
              <Card
                elevation={4}
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: 300,
                  backfaceVisibility: 'hidden',
                  cursor: 'pointer',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 2,
                }}
                onClick={handleFlip}
              >
                <CardContent sx={{ textAlign: 'center', color: 'white' }}>
                  <Typography variant="h5" component="h3" fontWeight={600} sx={{ mb: 2 }}>
                    {currentCard.term}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Tap to flip
                  </Typography>
                </CardContent>
              </Card>

              {/* Back of card */}
              <Card
                elevation={4}
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: 300,
                  backfaceVisibility: 'hidden',
                  rotateY: 180,
                  transformStyle: 'preserve-3d',
                  cursor: 'pointer',
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 2,
                }}
                onClick={handleFlip}
              >
                <CardContent sx={{ textAlign: 'center', color: 'white' }}>
                  <Typography variant="h6" component="h3" fontWeight={500} sx={{ mb: 2 }}>
                    {currentCard.definition}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Tap to flip back
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Action Buttons */}
      {currentCard && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
          <IconButton
            onClick={handleAskAI.bind(null, currentCard)}
            color="primary"
            sx={{
              backgroundColor: `${theme.palette.primary.main}10`,
              '&:hover': {
                backgroundColor: `${theme.palette.primary.main}20`,
              },
            }}
          >
            <Psychology />
          </IconButton>

          <IconButton
            onClick={handleFlip}
            color="secondary"
            sx={{
              backgroundColor: `${theme.palette.secondary.main}10`,
              '&:hover': {
                backgroundColor: `${theme.palette.secondary.main}20`,
              },
            }}
          >
            <FlipCameraAndroid />
          </IconButton>
        </Box>
      )}

      {/* Response Buttons */}
      {currentCard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleCardResponse('learning')}
              sx={{ minWidth: 120 }}
            >
              Still Learning
            </Button>

            <Button
              variant="outlined"
              color="warning"
              onClick={() => handleCardResponse('review')}
              sx={{ minWidth: 120 }}
            >
              Needs Review
            </Button>

            <Button
              variant="contained"
              color="success"
              onClick={() => handleCardResponse('known')}
              sx={{ minWidth: 120 }}
            >
              Know It
            </Button>
          </Box>
        </motion.div>
      )}

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handlePreviousCard}
          disabled={currentCardIndex === 0}
        >
          Previous
        </Button>

        <Typography variant="body2" color="text.secondary">
          {currentCardIndex + 1} / {filteredCards.length}
        </Typography>

        <Button
          variant="outlined"
          endIcon={<ArrowForward />}
          onClick={handleNextCard}
          disabled={currentCardIndex === filteredCards.length - 1}
        >
          Next
        </Button>
      </Box>

      {/* Stats Dialog */}
      <Dialog
        open={showStats}
        onClose={() => setShowStats(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Study Progress</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            🎉 Great job studying!
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Total cards: {flashcardDeck.flashcards.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cards studied: {currentCardIndex + 1}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Session progress: {Math.round(((currentCardIndex + 1) / filteredCards.length) * 100)}%
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Keep practicing to improve your retention!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStats(false)}>
            Continue Studying
          </Button>
          <Button variant="contained" onClick={() => setCurrentCardIndex(0)}>
            Restart Deck
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FlashcardsTab;