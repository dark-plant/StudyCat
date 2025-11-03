import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
  Fab,
} from '@mui/material';
import {
  motion,
  AnimatePresence,
} from 'framer-motion';
import {
  CloudUpload,
  YouTube,
  Description,
  TextFields,
  ArrowBack,
  Psychology,
  Clear,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { uploadDocument, processYouTube, setProcessingStage, addNotification } from '../../features/content/contentSlice';
import { openAIAssistant } from '../../features/ui/uiSlice';
import { FileUpload, YouTubeInput } from '../../types';

const InputScreen: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeInput, setActiveInput] = useState<'file' | 'youtube' | 'text' | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = useAppSelector((state) => state.content.isLoading);
  const isProcessing = useAppSelector((state) => state.content.isProcessing);

  // File handling
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

    if (!validTypes.includes(file.type)) {
      dispatch(addNotification({
        type: 'error',
        title: 'Invalid File Type',
        message: 'Please upload a PDF, DOCX, or plain text file.',
        duration: 5000,
      }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      dispatch(addNotification({
        type: 'error',
        title: 'File Too Large',
        message: 'Please upload a file smaller than 10MB.',
        duration: 5000,
      }));
      return;
    }

    setUploadedFile(file);
    setActiveInput('file');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // YouTube handling
  const validateYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  const handleYouTubeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setYoutubeUrl(url);
    if (url && validateYouTubeUrl(url)) {
      setActiveInput('youtube');
    }
  };

  const clearYouTube = () => {
    setYoutubeUrl('');
    setActiveInput(null);
  };

  // Text content handling
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const content = e.target.value;
    setTextContent(content);
    if (content.trim()) {
      setActiveInput('text');
    } else {
      setActiveInput(null);
    }
  };

  const clearText = () => {
    setTextContent('');
    setActiveInput(null);
  };

  // Submit handlers
  const handleFileSubmit = async () => {
    if (!uploadedFile) return;

    setIsSubmitting(true);
    dispatch(setProcessingStage('uploading'));

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const result = await dispatch(uploadDocument(formData)).unwrap();

      dispatch(addNotification({
        type: 'success',
        title: 'File Uploaded Successfully',
        message: 'Your content is being processed. This may take a moment.',
        duration: 5000,
      }));

      navigate('/processing');
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: error.message || 'Failed to upload file. Please try again.',
        duration: 5000,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleYouTubeSubmit = async () => {
    if (!validateYouTubeUrl(youtubeUrl)) {
      dispatch(addNotification({
        type: 'error',
        title: 'Invalid YouTube URL',
        message: 'Please enter a valid YouTube video URL.',
        duration: 5000,
      }));
      return;
    }

    setIsSubmitting(true);
    dispatch(setProcessingStage('extracting'));

    try {
      const result = await dispatch(processYouTube(youtubeUrl)).unwrap();

      dispatch(addNotification({
        type: 'success',
        title: 'YouTube Content Retrieved',
        message: 'Video transcript is being processed. This may take a moment.',
        duration: 5000,
      }));

      navigate('/processing');
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Processing Failed',
        message: error.message || 'Failed to process YouTube content. Please try again.',
        duration: 5000,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textContent.trim()) return;

    setIsSubmitting(true);
    dispatch(setProcessingStage('analyzing'));

    // For text content, we'll create a file-like object
    const textBlob = new Blob([textContent], { type: 'text/plain' });
    const textFile = new File([textBlob], 'text-input.txt', { type: 'text/plain' });

    try {
      const formData = new FormData();
      formData.append('file', textFile);

      const result = await dispatch(uploadDocument(formData)).unwrap();

      dispatch(addNotification({
        type: 'success',
        title: 'Text Processed Successfully',
        message: 'Your content is being analyzed and transformed into learning materials.',
        duration: 5000,
      }));

      navigate('/processing');
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Processing Failed',
        message: error.message || 'Failed to process text. Please try again.',
        duration: 5000,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleAskAI = () => {
    dispatch(openAIAssistant({
      context: 'general',
      initialMessage: "What types of content work best for ActiveLearn?"
    }));
  };

  const inputMethods = [
    {
      id: 'file',
      icon: <CloudUpload sx={{ fontSize: 40 }} />,
      title: 'Upload File',
      description: 'PDF, DOCX, or text files up to 10MB',
      color: theme.palette.primary.main,
    },
    {
      id: 'youtube',
      icon: <YouTube sx={{ fontSize: 40 }} />,
      title: 'YouTube Video',
      description: 'Paste a YouTube video URL to extract transcript',
      color: '#FF0000',
    },
    {
      id: 'text',
      icon: <TextFields sx={{ fontSize: 40 }} />,
      title: 'Paste Text',
      description: 'Copy and paste your content directly',
      color: theme.palette.secondary.main,
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
      <Container maxWidth="lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={handleBack}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h4" component="h1" fontWeight={600}>
              Upload Your Learning Content
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={4}>
          {/* Input Methods */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Choose Your Input Method
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {inputMethods.map((method, index) => (
                  <motion.div
                    key={method.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Paper
                      elevation={activeInput === method.id ? 4 : 1}
                      sx={{
                        p: 3,
                        cursor: 'pointer',
                        border: activeInput === method.id ? `2px solid ${method.color}` : '2px solid transparent',
                        backgroundColor: activeInput === method.id ? `${method.color}11` : theme.palette.background.paper,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: theme.shadows[4],
                          transform: 'translateY(-2px)',
                        },
                      }}
                      onClick={() => {
                        if (method.id === 'file' && fileInputRef.current) {
                          fileInputRef.current.click();
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{ color: method.color }}>
                          {method.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                            {method.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {method.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </Grid>

          {/* Input Areas */}
          <Grid item xs={12} md={6}>
            <AnimatePresence mode="wait">
              {activeInput === 'file' && uploadedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Paper elevation={2} sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Description sx={{ fontSize: 32, color: theme.palette.primary.main, mr: 2 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {uploadedFile.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {uploadedFile.type}
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        startIcon={<Clear />}
                        onClick={clearFile}
                        size="small"
                      >
                        Clear
                      </Button>
                    </Box>

                    <Alert severity="info" sx={{ mb: 3 }}>
                      Your file will be processed securely on our servers. Text extraction and AI analysis will begin automatically.
                    </Alert>

                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      onClick={handleFileSubmit}
                      disabled={isSubmitting || isProcessing}
                      startIcon={isSubmitting ? <CircularProgress size={20} /> : <CloudUpload />}
                    >
                      {isSubmitting ? 'Processing...' : 'Process Information'}
                    </Button>
                  </Paper>
                </motion.div>
              )}

              {activeInput === 'youtube' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Paper elevation={2} sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <YouTube sx={{ fontSize: 32, color: '#FF0000', mr: 2 }} />
                      <Typography variant="h6" fontWeight={600}>
                        YouTube Video URL
                      </Typography>
                    </Box>

                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={handleYouTubeUrlChange}
                      helperText="Paste the complete YouTube video URL"
                      sx={{ mb: 3 }}
                    />

                    {youtubeUrl && !validateYouTubeUrl(youtubeUrl) && (
                      <Alert severity="error" sx={{ mb: 3 }}>
                        Please enter a valid YouTube URL
                      </Alert>
                    )}

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={clearYouTube}
                        disabled={isSubmitting || isProcessing}
                      >
                        Clear
                      </Button>
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={handleYouTubeSubmit}
                        disabled={isSubmitting || isProcessing || !validateYouTubeUrl(youtubeUrl)}
                        startIcon={isSubmitting ? <CircularProgress size={20} /> : <YouTube />}
                      >
                        {isSubmitting ? 'Processing...' : 'Process YouTube Video'}
                      </Button>
                    </Box>
                  </Paper>
                </motion.div>
              )}

              {activeInput === 'text' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Paper elevation={2} sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <TextFields sx={{ fontSize: 32, color: theme.palette.secondary.main, mr: 2 }} />
                      <Typography variant="h6" fontWeight={600}>
                        Paste Your Content
                      </Typography>
                    </Box>

                    <TextField
                      fullWidth
                      multiline
                      rows={8}
                      placeholder="Paste your learning content here... This can be lecture notes, articles, book chapters, or any text you want to learn from."
                      value={textContent}
                      onChange={handleTextChange}
                      helperText={`${textContent.length} characters`}
                      sx={{ mb: 3 }}
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={clearText}
                        disabled={isSubmitting || isProcessing}
                      >
                        Clear
                      </Button>
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={handleTextSubmit}
                        disabled={isSubmitting || isProcessing || !textContent.trim()}
                        startIcon={isSubmitting ? <CircularProgress size={20} /> : <TextFields />}
                      >
                        {isSubmitting ? 'Processing...' : 'Process Text'}
                      </Button>
                    </Box>
                  </Paper>
                </motion.div>
              )}

              {!activeInput && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 6,
                      textAlign: 'center',
                      border: `2px dashed ${theme.palette.divider}`,
                      backgroundColor: theme.palette.action.hover,
                    }}
                  >
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                      Select an input method to get started
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Choose from file upload, YouTube video, or paste text directly
                    </Typography>
                  </Paper>
                </motion.div>
              )}
            </AnimatePresence>
          </Grid>
        </Grid>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />

        {/* Drag and drop overlay */}
        <AnimatePresence>
          {dragActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Paper
                elevation={8}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  border: `3px dashed ${theme.palette.primary.main}`,
                  backgroundColor: theme.palette.background.paper,
                }}
              >
                <CloudUpload sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                  Drop your file here
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  PDF, DOCX, or text files up to 10MB
                </Typography>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating AI Assistant Button */}
        <Fab
          color="secondary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
          onClick={handleAskAI}
        >
          <Psychology />
        </Fab>
      </Container>
    </Box>
  );
};

export default InputScreen;