import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Button,
  useTheme,
  useMediaQuery,
  Fab,
  Badge,
  Chip,
  Avatar,
} from '@mui/material';
import {
  motion,
  AnimatePresence,
} from 'framer-motion';
import {
  Psychology,
  Close,
  Send,
  Mic,
  MicOff,
  Lightbulb,
  School,
  Quiz,
  Style,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { closeAIAssistant, addAIMessage, setAILoading } from '../../features/ui/uiSlice';
import { AIMessage } from '../../types';

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  prompt: string;
  context: 'notes' | 'quiz' | 'flashcard' | 'general';
}

const AIAssistant: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const isOpen = useAppSelector((state) => state.ui.aiAssistant.isOpen);
  const messages = useAppSelector((state) => state.ui.aiAssistant.messages);
  const isLoading = useAppSelector((state) => state.ui.aiAssistant.isLoading);
  const currentContext = useAppSelector((state) => state.ui.aiAssistant.context);

  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions: QuickAction[] = [
    {
      label: 'Explain concept',
      icon: <Lightbulb />,
      prompt: 'Can you explain a concept from my study material?',
      context: 'general',
    },
    {
      label: 'Study tips',
      icon: <School />,
      prompt: 'What are the best ways to study this material?',
      context: 'general',
    },
    {
      label: 'Practice quiz',
      icon: <Quiz />,
      prompt: 'Can you give me a practice question about this topic?',
      context: 'general',
    },
    {
      label: 'Simplify',
      icon: <Style />,
      prompt: 'Can you explain this in simpler terms?',
      context: 'general',
    },
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleClose = () => {
    dispatch(closeAIAssistant());
    setIsListening(false);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      dispatch(addAIMessage({
        type: 'user',
        content: inputMessage.trim(),
        context: currentContext,
      }));

      // Simulate AI response
      dispatch(setAILoading(true));

      setTimeout(() => {
        const aiResponse = generateAIResponse(inputMessage.trim(), currentContext);
        dispatch(addAIMessage({
          type: 'assistant',
          content: aiResponse,
          context: currentContext,
        }));
        dispatch(setAILoading(false));
      }, 1500);

      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    dispatch(addAIMessage({
      type: 'user',
      content: action.prompt,
      context: action.context,
    }));

    // Simulate AI response
    dispatch(setAILoading(true));

    setTimeout(() => {
      const aiResponse = generateAIResponse(action.prompt, action.context);
      dispatch(addAIMessage({
        type: 'assistant',
        content: aiResponse,
        context: action.context,
      }));
      dispatch(setAILoading(false));
    }, 1500);
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('Speech recognition is not supported in your browser');
    }
  };

  const generateAIResponse = (userMessage: string, context: string): string => {
    // Simulated AI responses based on context and message content
    const responses = {
      general: [
        "I'm here to help you learn! What specific topic would you like to explore?",
        "Great question! Let me break this down for you in a way that's easy to understand.",
        "That's an interesting point. Have you considered looking at it from this perspective?",
        "I'd be happy to help you with that. Can you tell me more about what you're struggling with?",
      ],
      notes: [
        "Based on your notes, I can see this is an important concept. Let me explain it further.",
        "This section connects to some key ideas. Would you like me to show you how they relate?",
        "I notice you've highlighted this section. Would you like some additional examples or explanations?",
      ],
      quiz: [
        "This question tests your understanding of a fundamental concept. Let me walk you through it.",
        "Good thinking! Here's a systematic approach to tackle questions like this.",
        "This is a common point of confusion. Let me clarify the key differences you need to know.",
      ],
      flashcard: [
        "This term is crucial for understanding the bigger picture. Here's how it fits in.",
        "Let me give you some real-world examples to make this concept stick.",
        "This connects to several other terms you're studying. Would you like me to show the relationships?",
      ],
    };

    const contextResponses = responses[context as keyof typeof responses] || responses.general;
    return contextResponses[Math.floor(Math.random() * contextResponses.length)];
  };

  const getContextIcon = (context: string) => {
    switch (context) {
      case 'notes': return '📝';
      case 'quiz': return '🎯';
      case 'flashcard': return '🎴';
      default: return '🤖';
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Fab
              color="secondary"
              sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 1000,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              }}
              onClick={() => dispatch(openAIAssistant({ context: 'general' }))}
            >
              <Psychology />
            </Fab>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Paper
              elevation={8}
              sx={{
                position: 'fixed',
                bottom: isMobile ? 0 : 24,
                right: isMobile ? 0 : 24,
                width: isMobile ? '100vw' : 400,
                height: isMobile ? '100vh' : 600,
                maxWidth: isMobile ? '100vw' : '90vw',
                maxHeight: isMobile ? '100vh' : '80vh',
                zIndex: 1000,
                borderRadius: isMobile ? 0 : 2,
                display: 'flex',
                flexDirection: 'column',
                background: theme.palette.background.paper,
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'white', color: theme.palette.primary.main }}>
                    <Psychology />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      AI Learning Assistant
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {getContextIcon(currentContext)} {currentContext} context
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                  <Close />
                </IconButton>
              </Box>

              {/* Messages */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                        Hi! I'm your AI Learning Assistant 🤖
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        I can help you understand concepts, provide examples, and give study tips.
                      </Typography>

                      {/* Quick Actions */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                        {quickActions.map((action, index) => (
                          <motion.div
                            key={action.label}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Chip
                              label={action.label}
                              icon={action.icon}
                              onClick={() => handleQuickAction(action)}
                              clickable
                              color="primary"
                              variant="outlined"
                              sx={{
                                '& .MuiChip-icon': {
                                  fontSize: '1rem',
                                },
                              }}
                            />
                          </motion.div>
                        ))}
                      </Box>
                    </Box>
                  </motion.div>
                )}

                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                        gap: 1,
                      }}
                    >
                      {message.type === 'assistant' && (
                        <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
                          <Psychology />
                        </Avatar>
                      )}

                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          maxWidth: '70%',
                          backgroundColor: message.type === 'user'
                            ? theme.palette.primary.main
                            : theme.palette.grey[100],
                          color: message.type === 'user' ? 'white' : theme.palette.text.primary,
                          borderRadius: message.type === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          wordBreak: 'break-word',
                        }}
                      >
                        <Typography variant="body2">
                          {message.content}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Paper>

                      {message.type === 'user' && (
                        <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 32, height: 32 }}>
                          {message.content.charAt(0).toUpperCase()}
                        </Avatar>
                      )}
                    </Box>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
                        <Psychology />
                      </Avatar>
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          backgroundColor: theme.palette.grey[100],
                          borderRadius: '18px 18px 18px 4px',
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: theme.palette.grey[400],
                              animation: 'pulse 1.4s infinite ease-in-out',
                            }}
                          />
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: theme.palette.grey[400],
                              animation: 'pulse 1.4s infinite ease-in-out 0.2s',
                            }}
                          />
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: theme.palette.grey[400],
                              animation: 'pulse 1.4s infinite ease-in-out 0.4s',
                            }}
                          />
                        </Box>
                      </Paper>
                    </Box>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </Box>

              {/* Input Area */}
              <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={3}
                    placeholder="Ask me anything about your learning material..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    inputRef={inputRef}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />

                  <IconButton
                    onClick={handleVoiceInput}
                    color={isListening ? 'error' : 'primary'}
                    disabled={isLoading}
                  >
                    {isListening ? <MicOff /> : <Mic />}
                  </IconButton>

                  <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    sx={{
                      borderRadius: 2,
                      minWidth: 'auto',
                      px: 2,
                    }}
                  >
                    <Send />
                  </Button>
                </Box>

                {/* Voice Input Indicator */}
                {isListening && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Chip
                      label="Listening... Speak now"
                      color="error"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </motion.div>
                )}
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes pulse {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default AIAssistant;