import React from 'react';
import { Box, CircularProgress, Typography, Container } from '@mui/material';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  message?: string;
  size?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading ActiveLearn...',
  size = 60,
}) => {
  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={3}
      >
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <CircularProgress size={size} thickness={4} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Typography
            variant="h6"
            component="div"
            color="text.secondary"
            align="center"
            fontWeight={500}
          >
            {message}
          </Typography>
        </motion.div>
      </Box>
    </Container>
  );
};

export default LoadingScreen;