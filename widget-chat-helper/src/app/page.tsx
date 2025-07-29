"use client"

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { FabOpenChat } from '../components/FabOpenChat';
import { FabCloseChat } from '../components/FabCloseChat';
import { ChatWindow } from '../components/ChatWindow';

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <Box sx={{ minHeight: '100vh', background: '#f5f6fa' }}>
      {/* Кнопка открытия чата */}
      {!chatOpen && (
        <Box sx={{ position: 'fixed', right: { xs: 16, sm: 32, md: 32 }, bottom: { xs: 16, sm: 25, md: 32 }, zIndex: 100 }}>
          <FabOpenChat onClick={() => setChatOpen(true)} />
        </Box>
      )}
      {/* Окно чата и кнопка закрытия */}
      {chatOpen && (
        <>
          <Box sx={{ position: 'fixed', right: { xs: 8, sm: 16, md: 16 }, bottom: { xs: 100, sm: 120, md: 120 }, zIndex: 101 }}>
            <ChatWindow />
          </Box>
          <Box sx={{ position: 'fixed', right: { xs: 16, sm: 32, md: 32 }, bottom: { xs: 16, sm: 25, md: 32 }, zIndex: 102 }}>
            <FabCloseChat onClick={() => setChatOpen(false)} />
          </Box>
        </>
      )}
    </Box>
  );
}