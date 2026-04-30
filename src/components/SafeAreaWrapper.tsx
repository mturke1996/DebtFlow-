import React from 'react';
import { Box, BoxProps } from '@mui/material';

export interface SafeAreaWrapperProps extends BoxProps {
  children: React.ReactNode;
}

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({ children, sx, ...props }) => {
  return (
    <Box
      sx={{
        pt: 'env(safe-area-inset-top)',
        pb: 'env(safe-area-inset-bottom)',
        pl: 'env(safe-area-inset-left)',
        pr: 'env(safe-area-inset-right)',
        minHeight: '100dvh',
        width: '100%',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};
