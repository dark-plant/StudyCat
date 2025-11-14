import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
} from '@mui/material';
import {
  motion,
  AnimatePresence,
} from 'framer-motion';
import {
  Edit,
  Save,
  Cancel,
  Download,
  Share,
  Psychology,
  HighlightOff,
  Lightbulb,
  ContentCopy,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { generateNotes, fetchNotes, updateLocalNotes } from '../../features/content/contentSlice';
import { openAIAssistant } from '../../features/ui/uiSlice';
import { NoteSection } from '../../types';

const NotesTab: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const currentDocument = useAppSelector((state) => state.content.currentDocument);
  const notes = useAppSelector((state) => state.content.notes);
  const isLoading = useAppSelector((state) => state.content.isLoading);
  const isProcessing = useAppSelector((state) => state.content.isProcessing);

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [sectionMenuAnchor, setSectionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedSection, setSelectedSection] = useState<NoteSection | null>(null);
  const [highlightedSections, setHighlightedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentDocument && !notes) {
      dispatch(generateNotes(currentDocument.id));
    }
  }, [currentDocument, notes, dispatch]);

  const handleEditSection = (section: NoteSection) => {
    setEditingSection(section.id);
    setEditedContent(section.content);
  };

  const handleSaveSection = (sectionId: string) => {
    if (notes) {
      const updatedSections = notes.content.map(section =>
        section.id === sectionId
          ? { ...section, content: editedContent }
          : section
      );
      dispatch(updateLocalNotes({ content: updatedSections }));
    }
    setEditingSection(null);
    setEditedContent('');
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditedContent('');
  };

  const handleSectionMenu = (event: React.MouseEvent<HTMLElement>, section: NoteSection) => {
    setSectionMenuAnchor(event.currentTarget);
    setSelectedSection(section);
  };

  const handleCloseSectionMenu = () => {
    setSectionMenuAnchor(null);
    setSelectedSection(null);
  };

  const handleAskAI = (section: NoteSection, type: 'explain' | 'examples' | 'simplify') => {
    const prompts = {
      explain: `Can you explain this section in more detail?`,
      examples: `Can you give me some examples related to this topic?`,
      simplify: `Can you explain this in simpler terms?`,
    };

    dispatch(openAIAssistant({
      context: 'notes',
      initialMessage: `Regarding "${section.title}": ${prompts[type]}`,
    }));
    handleCloseSectionMenu();
  };

  const toggleHighlight = (sectionId: string) => {
    setHighlightedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
    handleCloseSectionMenu();
  };

  const handleExport = () => {
    if (!notes) return;

    const content = notes.content
      .map(section => `## ${section.title}\n\n${section.content}\n\n**Key Points:**\n${section.key_points.map(point => `- ${point}`).join('\n')}\n`)
      .join('\n---\n\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${notes.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Study Notes',
        text: `Check out my notes on "${currentDocument?.title}"`,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`Study Notes: ${currentDocument?.title}`);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Generating your notes...
        </Typography>
      </Box>
    );
  }

  if (!notes) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          No notes available
        </Typography>
        <Button
          variant="contained"
          onClick={() => currentDocument && dispatch(generateNotes(currentDocument.id))}
          disabled={isProcessing}
        >
          Generate Notes
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Notes Header */}
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
                📝 {notes.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {notes.content.length} sections • AI-generated • {notes.ai_generated ? 'Ready to study' : 'Custom content'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Export Notes">
                <IconButton onClick={handleExport}>
                  <Download />
                </IconButton>
              </Tooltip>
              <Tooltip title="Share Notes">
                <IconButton onClick={handleShare}>
                  <Share />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>
      </motion.div>

      {/* Notes Sections */}
      <AnimatePresence>
        {notes.content.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -2 }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 3,
                mb: 3,
                borderLeft: highlightedSections.has(section.id)
                  ? `4px solid ${theme.palette.primary.main}`
                  : `4px solid ${theme.palette.divider}`,
                backgroundColor: highlightedSections.has(section.id)
                  ? `${theme.palette.primary.main}08`
                  : theme.palette.background.paper,
                transition: 'all 0.3s ease',
              }}
            >
              {/* Section Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" component="h3" fontWeight={600}>
                    {section.title}
                  </Typography>
                  {highlightedSections.has(section.id) && (
                    <Chip
                      label="Highlighted"
                      color="primary"
                      size="small"
                      icon={<Lightbulb />}
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {editingSection === section.id ? (
                    <>
                      <Tooltip title="Save">
                        <IconButton
                          onClick={() => handleSaveSection(section.id)}
                          color="primary"
                        >
                          <Save />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancel">
                        <IconButton onClick={handleCancelEdit}>
                          <Cancel />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Tooltip title="Ask AI">
                        <IconButton
                          onClick={() => dispatch(openAIAssistant({
                            context: 'notes',
                            initialMessage: `Can you help me understand "${section.title}" better?`
                          }))}
                          color="primary"
                        >
                          <Psychology />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More Options">
                        <IconButton
                          onClick={(e) => handleSectionMenu(e, section)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
              </Box>

              {/* Section Content */}
              <Box sx={{ mb: 2 }}>
                {editingSection === section.id ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: theme.palette.background.paper,
                      },
                    }}
                  />
                ) : (
                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: 1.7,
                      color: theme.palette.text.primary,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {section.content}
                  </Typography>
                )}
              </Box>

              {/* Key Points */}
              {section.key_points.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    🔑 Key Points:
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2 }}>
                    {section.key_points.map((point, pointIndex) => (
                      <motion.li
                        key={pointIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 + pointIndex * 0.05 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                            mb: 0.5,
                            lineHeight: 1.5,
                          }}
                        >
                          {point}
                        </Typography>
                      </motion.li>
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Section Menu */}
      <Menu
        anchorEl={sectionMenuAnchor}
        open={Boolean(sectionMenuAnchor)}
        onClose={handleCloseSectionMenu}
      >
        <MenuItem onClick={() => selectedSection && handleEditSection(selectedSection)}>
          <Edit sx={{ mr: 1 }} /> Edit Section
        </MenuItem>
        <MenuItem onClick={() => selectedSection && handleAskAI(selectedSection, 'explain')}>
          <Psychology sx={{ mr: 1 }} Ask AI to Explain
        </MenuItem>
        <MenuItem onClick={() => selectedSection && handleAskAI(selectedSection, 'examples')}>
          <Lightbulb sx={{ mr: 1 }} Get Examples
        </MenuItem>
        <MenuItem onClick={() => selectedSection && handleAskAI(selectedSection, 'simplify')}>
          <Edit sx={{ mr: 1 }} Simplify
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => selectedSection && toggleHighlight(selectedSection.id)}>
          {selectedSection && highlightedSections.has(selectedSection.id) ? (
            <>
              <HighlightOff sx={{ mr: 1 }} Remove Highlight
            </>
          ) : (
            <>
              <Lightbulb sx={{ mr: 1 }} Highlight Section
            </>
          )}
        </MenuItem>
        <MenuItem onClick={() => selectedSection && navigator.clipboard.writeText(selectedSection.content)}>
          <ContentCopy sx={{ mr: 1 }} Copy Content
        </MenuItem>
      </Menu>

      {/* Floating AI Assistant */}
      <Fab
        color="secondary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
        onClick={() => dispatch(openAIAssistant({
          context: 'notes',
          initialMessage: "Hi! I'm reviewing my notes. Can you help me study better?"
        }))}
      >
        <Psychology />
      </Fab>
    </Box>
  );
};

export default NotesTab;