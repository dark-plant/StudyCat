import { createTheme, ThemeOptions } from '@mui/material/styles';

// Color palette for cat-themed learning app
const catPalette = {
  primary: {
    main: '#FF6B35', // Orange accent (like a tabby cat)
    light: '#FF8C69',
    dark: '#E55100',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#6C63FF', // Purple accent (complementary to orange)
    light: '#8B85FF',
    dark: '#4A47A3',
    contrastText: '#FFFFFF',
  },
  accent: {
    main: '#4CAF50', // Green for success states
    light: '#81C784',
    dark: '#388E3C',
  },
  warning: {
    main: '#FF9800', // Warm orange for warnings
    light: '#FFB74D',
    dark: '#F57C00',
  },
  catOrange: '#FF8C42', // Distinct cat-themed orange
  catGray: '#6D6D6D', // Gray for cat elements
  pawPrint: '#8B4513', // Brown for paw print accents
};

// Light theme configuration
export const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    ...catPalette,
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
    divider: '#E0E0E0',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: catPalette.primary.main,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: catPalette.primary.dark,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: catPalette.primary.dark,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: catPalette.primary.main,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.1rem',
      fontWeight: 500,
      color: catPalette.primary.main,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      color: catPalette.primary.main,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: catPalette.text.secondary,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '1rem',
    },
    caption: {
      fontSize: '0.75rem',
      color: catPalette.text.secondary,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          padding: '12px 24px',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: '0 2px 8px rgba(255, 107, 53, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 16px rgba(255, 107, 53, 0.3)',
          },
        },
        contained: {
          background: `linear-gradient(135deg, ${catPalette.primary.main} 0%, ${catPalette.primary.dark} 100%)`,
          color: catPalette.primary.contrastText,
        },
        outlined: {
          borderWidth: 2,
          borderColor: catPalette.primary.main,
          color: catPalette.primary.main,
          '&:hover': {
            backgroundColor: catPalette.primary.light,
            borderColor: catPalette.primary.dark,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          minHeight: 48,
          padding: '12px 24px',
          '&.Mui-selected': {
            color: catPalette.primary.main,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: catPalette.primary.light,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: catPalette.primary.main,
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
          '&.MuiChip-colorPrimary': {
            backgroundColor: catPalette.primary.light,
            color: catPalette.primary.dark,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        },
        elevation3: {
          boxShadow: '0 6px 24px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
};

// Dark theme configuration
export const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    ...catPalette,
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
    divider: '#2D2D2D',
  },
  typography: lightThemeOptions.typography,
  shape: lightThemeOptions.shape,
  components: {
    ...lightThemeOptions.components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          backgroundColor: '#1E1E1E',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#2D2D2D',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: catPalette.primary.light,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: catPalette.primary.main,
              borderWidth: 2,
            },
            '& .MuiOutlinedInput-input': {
              color: '#FFFFFF',
            },
          },
        },
      },
    },
  },
};

// Create theme instances
export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);

// Cat animation colors and styles
export const catAnimationStyles = {
  primaryColor: catPalette.catOrange,
  secondaryColor: catPalette.catGray,
  accentColor: catPalette.pawPrint,
  pawPrintColor: '#D2691E',
  tailColor: '#FF8C42',
  eyeColor: '#2E7D32',
};

// Animation durations and easing
export const animationConfig = {
  catWalk: {
    duration: 2,
    ease: 'easeInOut',
  },
  pageTransition: {
    duration: 0.6,
    ease: [0.4, 0, 0.2, 1],
  },
  cardFlip: {
    duration: 0.8,
    ease: 'easeInOut',
  },
  bounce: {
    duration: 0.5,
    ease: 'easeOut',
  },
  fadeIn: {
    duration: 0.4,
    ease: 'easeOut',
  },
};

// Breakpoint helpers
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

// Spacing utilities
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Default theme export
export default lightTheme;