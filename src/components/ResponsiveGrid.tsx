import React from 'react';
import { Grid, GridProps } from '@mui/material';

export interface ResponsiveGridProps extends GridProps {
  children: React.ReactNode;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({ children, container, spacing, ...props }) => {
  return (
    <Grid 
      container={container !== false} 
      spacing={spacing || { xs: 2, sm: 3, md: 3, lg: 4 }} 
      {...props}
    >
      {children}
    </Grid>
  );
};
