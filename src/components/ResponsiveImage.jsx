import React from 'react';
import Image from 'next/image';
import Box from '@mui/material/Box';
import theme from '../theme';

export default function ResponsiveImage(props) {
  const styles = {
    [theme.breakpoints.down('sm')]: {
      height: '200px',
      width: '300px',
    },
    [theme.breakpoints.between('sm', 'lg')]: {
      height: '250px',
      width: '375px',
    },
    '@media (min-width: 1200px)': {
      height: '250px',
      width: '375px',
    },
  };
  return (
    <Box position="relative" sx={styles}>
      <Image
        {...props}
        fill
        style={{
          // objectFit: 'contain',
          borderRadius: '1em',
        }}
      />
    </Box>
  );
}
