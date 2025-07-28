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
        <Box sx={{ position: 'fixed', right: 32, bottom: 32, zIndex: 100 }}>
          <FabOpenChat onClick={() => setChatOpen(true)} />
        </Box>
      )}
      {/* Окно чата и кнопка закрытия */}
      {chatOpen && (
        <>
          <Box sx={{ position: 'fixed', right: 32, bottom: 110, zIndex: 101 }}>
            <ChatWindow />
          </Box>
          <Box sx={{ position: 'fixed', right: 32, bottom: 32, zIndex: 102 }}>
            <FabCloseChat onClick={() => setChatOpen(false)} />
          </Box>
        </>
      )}
    </Box>
  );
}
