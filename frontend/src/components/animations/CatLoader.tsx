import React from 'react';
import { Box, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { catAnimationStyles } from '../../styles/theme';

interface CatLoaderProps {
  size?: number;
  speed?: number;
  stage?: 'uploading' | 'extracting' | 'analyzing' | 'generating' | 'complete';
}

const CatLoader: React.FC<CatLoaderProps> = ({
  size = 120,
  speed = 2,
  stage = 'uploading',
}) => {
  const theme = useTheme();

  // Stage-specific animations
  const getStageAnimation = () => {
    switch (stage) {
      case 'uploading':
        return {
          walk: true,
          tail: true,
          head: true,
          message: 'Uploading your content...',
        };
      case 'extracting':
        return {
          walk: true,
          tail: true,
          head: false,
          message: 'Extracting text from your file...',
        };
      case 'analyzing':
        return {
          walk: false,
          tail: true,
          head: true,
          message: 'Analyzing content with AI...',
        };
      case 'generating':
        return {
          walk: true,
          tail: true,
          head: true,
          message: 'Creating learning materials...',
        };
      case 'complete':
        return {
          walk: false,
          tail: false,
          head: false,
          message: 'All done! Ready to learn!',
        };
      default:
        return {
          walk: true,
          tail: true,
          head: true,
          message: 'Processing...',
        };
    }
  };

  const animation = getStageAnimation();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
      }}
    >
      {/* Cat Animation Container */}
      <Box
        sx={{
          position: 'relative',
          width: size * 3,
          height: size * 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AnimatePresence mode="wait">
          {/* Cat Body */}
          <motion.div
            key="cat-body"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            style={{
              position: 'absolute',
              width: size,
              height: size * 0.8,
              background: `linear-gradient(135deg, ${catAnimationStyles.primaryColor} 0%, ${catAnimationStyles.secondaryColor} 100%)`,
              borderRadius: '50% 50% 40% 40%',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            }}
          >
            {/* Cat Face */}
            <Box
              sx={{
                position: 'absolute',
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: size * 0.6,
                height: size * 0.5,
                borderRadius: '50%',
                background: catAnimationStyles.primaryColor,
              }}
            >
              {/* Eyes */}
              <motion.div
                animate={{
                  scaleY: animation.head ? [1, 0.1, 1] : 1,
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  position: 'absolute',
                  top: '30%',
                  left: '20%',
                  width: size * 0.08,
                  height: size * 0.08,
                  background: catAnimationStyles.eyeColor,
                  borderRadius: '50%',
                }}
              />
              <motion.div
                animate={{
                  scaleY: animation.head ? [1, 0.1, 1] : 1,
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  position: 'absolute',
                  top: '30%',
                  right: '20%',
                  width: size * 0.08,
                  height: size * 0.08,
                  background: catAnimationStyles.eyeColor,
                  borderRadius: '50%',
                }}
              />

              {/* Nose */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: `${size * 0.04}px solid transparent`,
                  borderRight: `${size * 0.04}px solid transparent`,
                  borderTop: `${size * 0.06}px solid ${catAnimationStyles.pawPrintColor}`,
                }}
              />

              {/* Mouth */}
              <motion.div
                animate={{
                  pathLength: animation.head ? [0, 1] : 1,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  position: 'absolute',
                  bottom: '20%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: size * 0.2,
                  height: size * 0.1,
                  borderBottom: `2px solid ${catAnimationStyles.pawPrintColor}`,
                  borderRadius: '0 0 50% 50%',
                }}
              />
            </Box>

            {/* Ears */}
            <motion.div
              animate={{
                rotate: animation.head ? [-5, 5, -5] : 0,
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                position: 'absolute',
                top: '5%',
                left: '15%',
                width: 0,
                height: 0,
                borderLeft: `${size * 0.15}px solid transparent`,
                borderRight: `${size * 0.15}px solid transparent`,
                borderBottom: `${size * 0.25}px solid ${catAnimationStyles.primaryColor}`,
              }}
            />
            <motion.div
              animate={{
                rotate: animation.head ? [5, -5, 5] : 0,
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                position: 'absolute',
                top: '5%',
                right: '15%',
                width: 0,
                height: 0,
                borderLeft: `${size * 0.15}px solid transparent`,
                borderRight: `${size * 0.15}px solid transparent`,
                borderBottom: `${size * 0.25}px solid ${catAnimationStyles.primaryColor}`,
              }}
            />

            {/* Tail */}
            {animation.tail && (
              <motion.div
                animate={{
                  rotate: [0, 30, -30, 0],
                  transformOrigin: 'bottom center',
                }}
                transition={{
                  duration: speed,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  position: 'absolute',
                  bottom: '10%',
                  right: '-20%',
                  width: size * 0.6,
                  height: size * 0.15,
                  background: `linear-gradient(90deg, ${catAnimationStyles.tailColor} 0%, ${catAnimationStyles.secondaryColor} 100%)`,
                  borderRadius: '50% 10% 10% 50%',
                  transformOrigin: 'left center',
                }}
              />
            )}

            {/* Paws */}
            <motion.div
              animate={{
                y: animation.walk ? [0, -10, 0] : 0,
              }}
              transition={{
                duration: speed / 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                position: 'absolute',
                bottom: '-10%',
                left: '20%',
                width: size * 0.2,
                height: size * 0.15,
                background: catAnimationStyles.pawPrintColor,
                borderRadius: '50%',
              }}
            />
            <motion.div
              animate={{
                y: animation.walk ? [0, -10, 0] : 0,
              }}
              transition={{
                duration: speed / 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: speed / 4, // Offset for walking effect
              }}
              style={{
                position: 'absolute',
                bottom: '-10%',
                right: '20%',
                width: size * 0.2,
                height: size * 0.15,
                background: catAnimationStyles.pawPrintColor,
                borderRadius: '50%',
              }}
            />
          </motion.div>

          {/* Paw prints trail effect */}
          {animation.walk && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`paw-${i}`}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: [0, 0.3, 0], x: [-50, 200] }}
                  transition={{
                    duration: speed,
                    repeat: Infinity,
                    delay: i * (speed / 3),
                    ease: "easeOut",
                  }}
                  style={{
                    position: 'absolute',
                    bottom: '0%',
                    left: '10%',
                    width: size * 0.1,
                    height: size * 0.08,
                    background: catAnimationStyles.pawPrintColor,
                    borderRadius: '50%',
                    opacity: 0.3,
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Walking animation for the whole cat */}
        {animation.walk && (
          <motion.div
            animate={{
              x: [-size, size],
            }}
            transition={{
              duration: speed * 2,
              repeat: Infinity,
              ease: "linear",
              repeatType: "reverse",
            }}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          />
        )}
      </Box>

      {/* Status Message */}
      <motion.div
        key={stage}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            textAlign: 'center',
            px: 2,
          }}
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 3,
                py: 1.5,
                backgroundColor: theme.palette.primary.main + '15',
                borderRadius: 8,
                border: `1px solid ${theme.palette.primary.main}30`,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: theme.palette.primary.main,
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  color: theme.palette.primary.main,
                }}
              >
                {animation.message}
              </Typography>
            </Box>
          </motion.div>
        </Box>
      </motion.div>
    </Box>
  );
};

export default CatLoader;