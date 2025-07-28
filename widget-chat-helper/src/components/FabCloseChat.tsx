"use client"

import React from 'react';
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';

export const FabCloseChat: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <Box
    className="fab-chat"
    sx={{
      position: 'fixed',
      bottom: { xs: 16, sm: 32 },
      right: { xs: 16, sm: 32 },
      zIndex: 1000,
    }}
  >
    <Fab
      color="primary"
      onClick={onClick}
      aria-label="Закрыть чат"
      sx={{
        width: { xs: 48, sm: 60 },
        height: { xs: 48, sm: 60 },
        minHeight: 'unset',
        minWidth: 'unset',
        boxShadow: '0px 2px 4px 0px rgba(0, 35, 11, 0.2)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#2F69FF',
        '&:hover': { background: '#1e4dcc' },
      }}
    >
      <CloseIcon style={{ color: '#fff', fontSize: 32 }} />
    </Fab>
  </Box>
); 