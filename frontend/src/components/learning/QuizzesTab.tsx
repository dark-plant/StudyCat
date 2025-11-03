import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  TextField,
  Card,
  CardContent,
  IconButton,
  useTheme,
  Alert,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  motion,
  AnimatePresence,
} from 'framer-motion';
import {
  ArrowBack,
  ArrowForward,
  Psychology,
  CheckCircle,
  RadioButtonUnchecked,
  Timer,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { generateQuiz, fetchQuiz, submitQuizResult } from '../../features/content/contentSlice';
import { openAIAssistant } from '../../features/ui/uiSlice';
import { Quiz, QuizQuestion, QuizAnswer } from '../../types';

const QuizzesTab: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const currentDocument = useAppSelector((state) => state.content.currentDocument);
  const quiz = useAppSelector((state) => state.content.quiz);
  const isLoading = useAppSelector((state) => state.content.isLoading);
  const isProcessing = useAppSelector((state) => state.content.isProcessing);

  const [quizState, setQuizState] = useState<'intro' | 'taking' | 'results'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (currentDocument && !quiz) {
      dispatch(generateQuiz(currentDocument.id));
    }
  }, [currentDocument, quiz, dispatch]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizState === 'taking') {
      timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartQuiz = () => {
    setQuizState('taking');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setTimeSpent(0);
    setQuestionStartTime(Date.now());
  };

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    const questionTime = Date.now() - questionStartTime;

    setAnswers(prev => {
      const existingAnswerIndex = prev.findIndex(a => a.question_id === questionId);
      const newAnswer: QuizAnswer = {
        question_id: questionId,
        answer,
        is_correct: false, // Will be determined when submitting
        time_spent: Math.round(questionTime / 1000),
      };

      if (existingAnswerIndex >= 0) {
        const updatedAnswers = [...prev];
        updatedAnswers[existingAnswerIndex] = newAnswer;
        return updatedAnswers;
      } else {
        return [...prev, newAnswer];
      }
    });

    setQuestionStartTime(Date.now());
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    try {
      // Calculate score
      let score = 0;
      const evaluatedAnswers = answers.map(answer => {
        const question = quiz.questions.find(q => q.id === answer.question_id);
        if (!question) return answer;

        let isCorrect = false;
        if (Array.isArray(question.correct_answer)) {
          isCorrect = Array.isArray(answer.answer) &&
            answer.answer.length === question.correct_answer.length &&
            answer.answer.every(a => question.correct_answer.includes(a));
        } else {
          isCorrect = answer.answer === question.correct_answer;
        }

        if (isCorrect) {
          score += question.points;
        }

        return { ...answer, is_correct };
      });

      const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

      await dispatch(submitQuizResult({
        quizId: quiz.id,
        answers: evaluatedAnswers,
        score,
        total_points: totalPoints,
        time_spent: timeSpent,
      }));

      setAnswers(evaluatedAnswers);
      setQuizState('results');
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const handleAskAI = (question: QuizQuestion) => {
    dispatch(openAIAssistant({
      context: 'quiz',
      initialMessage: `Can you help me understand this question: "${question.question}"`
    }));
  };

  const getCurrentAnswer = (questionId: string) => {
    return answers.find(a => a.question_id === questionId)?.answer;
  };

  const renderQuestion = (question: QuizQuestion) => {
    const currentAnswer = getCurrentAnswer(question.id);

    switch (question.type) {
      case 'multiple-choice':
        return (
          <RadioGroup
            value={currentAnswer || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
          >
            {question.options?.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <FormControlLabel
                  value={option}
                  control={<Radio />}
                  label={
                    <Typography variant="body1">
                      {option}
                    </Typography>
                  }
                  sx={{ mb: 1 }}
                />
              </motion.div>
            ))}
          </RadioGroup>
        );

      case 'true-false':
        return (
          <RadioGroup
            value={currentAnswer || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
          >
            <FormControlLabel
              value="true"
              control={<Radio />}
              label="True"
              sx={{ mb: 1 }}
            />
            <FormControlLabel
              value="false"
              control={<Radio />}
              label="False"
            />
          </RadioGroup>
        );

      case 'short-answer':
        return (
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Type your answer here..."
            value={currentAnswer as string || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.background.paper,
              },
            }}
          />
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Generating your quiz...
        </Typography>
      </Box>
    );
  }

  if (!quiz) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          No quiz available
        </Typography>
        <Button
          variant="contained"
          onClick={() => currentDocument && dispatch(generateQuiz(currentDocument.id))}
          disabled={isProcessing}
        >
          Generate Quiz
        </Button>
      </Box>
    );
  }

  if (quizState === 'intro') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.light}05 100%)`,
          }}
        >
          <Typography variant="h4" component="h2" fontWeight={600} sx={{ mb: 2 }}>
            🎯 {quiz.title}
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Chip label={`${quiz.questions.length} Questions`} color="primary" sx={{ mr: 1 }} />
            <Chip label={`${quiz.difficulty}`} color="secondary" sx={{ mr: 1 }} />
            <Chip label={`${quiz.time_limit || quiz.questions.length * 2} min`} />
          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Test your knowledge with this interactive quiz. You'll get immediate feedback and explanations for each answer.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={handleStartQuiz}
            sx={{
              px: 6,
              py: 2,
              fontSize: '1.1rem',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            }}
          >
            Start Quiz
          </Button>
        </Paper>
      </motion.div>
    );
  }

  if (quizState === 'taking') {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
      <Box>
        {/* Quiz Progress */}
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timer fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {formatTime(timeSpent)}
              </Typography>
            </Box>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
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
        </Paper>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Paper
              elevation={2}
              sx={{
                p: 4,
                mb: 3,
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.light}05 100%)`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" component="h3" fontWeight={600} sx={{ flex: 1 }}>
                  {currentQuestion.question}
                </Typography>
                <IconButton
                  onClick={() => handleAskAI(currentQuestion)}
                  color="primary"
                  sx={{ ml: 2 }}
                >
                  <Psychology />
                </IconButton>
              </Box>

              <Box sx={{ mb: 3 }}>
                {renderQuestion(currentQuestion)}
              </Box>

              <Typography variant="body2" color="text.secondary">
                Points: {currentQuestion.points}
              </Typography>
            </Paper>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>

          <Button
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={handleNextQuestion}
            disabled={!getCurrentAnswer(currentQuestion.id)}
          >
            {currentQuestionIndex === quiz.questions.length - 1 ? 'Submit' : 'Next'}
          </Button>
        </Box>
      </Box>
    );
  }

  if (quizState === 'results') {
    const correctAnswers = answers.filter(a => a.is_correct).length;
    const scorePercentage = Math.round((correctAnswers / quiz.questions.length) * 100);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.light}05 100%)`,
          }}
        >
          <CheckCircle
            sx={{
              fontSize: 64,
              color: scorePercentage >= 70 ? theme.palette.success.main : theme.palette.warning.main,
              mb: 2,
            }}
          />

          <Typography variant="h4" component="h2" fontWeight={600} sx={{ mb: 2 }}>
            Quiz Complete!
          </Typography>

          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            You scored {correctAnswers} out of {quiz.questions.length} ({scorePercentage}%)
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Time spent: {formatTime(timeSpent)}
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => setShowResults(true)}
            sx={{ mr: 2 }}
          >
            Review Answers
          </Button>

          <Button
            variant="outlined"
            onClick={() => setQuizState('intro')}
          >
            Retake Quiz
          </Button>
        </Paper>

        {/* Results Dialog */}
        <Dialog
          open={showResults}
          onClose={() => setShowResults(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Quiz Results</DialogTitle>
          <DialogContent>
            {quiz.questions.map((question, index) => {
              const answer = answers.find(a => a.question_id === question.id);
              const isCorrect = answer?.is_correct || false;

              return (
                <Card key={question.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Question {index + 1}
                      </Typography>
                      <Chip
                        label={isCorrect ? 'Correct' : 'Incorrect'}
                        color={isCorrect ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {question.question}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      <strong>Your answer:</strong> {answer?.answer}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      <strong>Correct answer:</strong> {Array.isArray(question.correct_answer) ? question.correct_answer.join(', ') : question.correct_answer}
                    </Typography>

                    {question.explanation && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Explanation:</strong> {question.explanation}
                        </Typography>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowResults(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    );
  }

  return null;
};

export default QuizzesTab;