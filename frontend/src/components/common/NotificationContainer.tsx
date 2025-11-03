import React, { useEffect } from 'react';
import { Box, Alert, AlertTitle, Snackbar, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { removeNotification } from '../../features/ui/uiSlice';

const NotificationContainer: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.ui.notifications);

  const handleClose = (notificationId: string) => {
    dispatch(removeNotification(notificationId));
  };

  useEffect(() => {
    // Auto-remove notifications after their duration
    const timers = notifications.map((notification) => {
      if (notification.duration && notification.duration > 0) {
        return setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, notification.duration);
      }
      return null;
    });

    return () => {
      timers.forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [notifications, dispatch]);

  const getAlertProps = (type: string) => {
    switch (type) {
      case 'success':
        return {
          severity: 'success' as const,
          icon: '✓',
        };
      case 'error':
        return {
          severity: 'error' as const,
          icon: '✕',
        };
      case 'warning':
        return {
          severity: 'warning' as const,
          icon: '⚠',
        };
      case 'info':
      default:
        return {
          severity: 'info' as const,
          icon: 'ℹ',
        };
    }
  };

  return (
    <Box
      position="fixed"
      top={theme.spacing(2)}
      right={theme.spacing(2)}
      zIndex={9999}
      display="flex"
      flexDirection="column"
      gap={1}
      maxWidth={400}
    >
      <AnimatePresence>
        {notifications.map((notification, index) => {
          const alertProps = getAlertProps(notification.type);
          const verticalOffset = index * 80;

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: index * 0.1,
                }
              }}
              exit={{
                opacity: 0,
                x: 300,
                scale: 0.8,
                transition: {
                  duration: 0.3,
                }
              }}
              style={{
                position: 'absolute',
                top: `${verticalOffset}px`,
                right: 0,
              }}
            >
              <Alert
                {...alertProps}
                onClose={() => handleClose(notification.id)}
                variant="filled"
                sx={{
                  minWidth: 300,
                  maxWidth: 400,
                  '& .MuiAlert-message': {
                    fontSize: '0.875rem',
                  },
                  boxShadow: theme.shadows[4],
                }}
              >
                <AlertTitle sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {notification.title}
                </AlertTitle>
                {notification.message}
              </Alert>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </Box>
  );
};

export default NotificationContainer;