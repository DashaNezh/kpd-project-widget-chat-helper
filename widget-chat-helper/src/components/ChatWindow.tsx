import React, { useRef, useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import NorthIcon from '@mui/icons-material/North';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { FabCloseChat } from './FabCloseChat';
import Button from '@mui/material/Button';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { useChatDialog } from '@/hooks/useChatDialog';
import styles from './ChatWindow.module.css';

interface ChatWindowProps {
  onClose?: () => void;
}

type Message = {
  id: number;
  text?: string;
  author: 'user' | 'bot';
  time: string;
  read?: boolean;
  fileName?: string;
};

const scenarioButtons = [
  'Запустить тестирование',
  'Настройка проектной документации',
  'Создание объекта строительства',
  'Работа с редактором документов',
  'Заполнение Исходных данных',
  'Другое',
  'Начать новый чат',
];

export const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Добрый день! Чем могу помочь?',
      author: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [showScenarios, setShowScenarios] = useState(true);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [email, setEmail] = useState('verbose@example.com');

  const { sendRequest, loading, error, response } = useChatDialog();

  useEffect(() => {
    if (response && response.status === 'success') {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: response.message,
          author: 'bot',
          time: now,
        },
      ]);
    }
  }, [response]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setDragActive(false);
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setAttachedFile(files[0]);
    }
  };
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setAttachedFile(files[0]);
    }
  };
  const handleRemoveFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };
  const handleSend = async () => {
    if (!message.trim() && !attachedFile) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (attachedFile) {
      const newMsg: Message = {
        id: Date.now(),
        author: 'user',
        time: time,
        read: false,
        fileName: attachedFile.name,
      };
      setMessages((prev) => [...prev, newMsg]);
      setAttachedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowScenarios(false);
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMsg.id ? { ...msg, read: true } : msg
          )
        );
      }, 1000);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: 'Ожидайте ответа специалиста.',
            author: 'bot',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 1000);
      return;
    }
    if (message.trim()) {
      const newMsg: Message = {
        id: Date.now(),
        text: message,
        author: 'user',
        time: time,
        read: false,
      };
      setMessages((prev) => [...prev, newMsg]);
      setMessage('');
      setShowScenarios(false);
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMsg.id ? { ...msg, read: true } : msg
          )
        );
      }, 1000);
      await sendRequest({ text: message, email });
    }
  };
  const handleScenarioClick = (text: string) => {
    setMessage(text);
    setShowScenarios(false);
  };

  return (
    <Paper
      elevation={8}
      sx={{
        width: 360,
        height: 500,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        background: dragActive ? '#e3f0ff' : undefined,
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {dragActive && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            background: 'rgba(227,240,255,0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #2979ff',
            pointerEvents: 'all',
          }}
        >
          <UploadFileIcon sx={{ color: '#2979ff', fontSize: 48, mb: 2 }} />
          <Typography sx={{ color: '#2979ff', fontWeight: 500, mb: 1 }}>
            Поместите файл сюда
          </Typography>
          <Typography sx={{ color: '#888', fontSize: 14 }}>
            Можно отправить 1 файл за раз<br />Объем не более 5 Mb
          </Typography>
        </Box>
      )}
      {/* Заголовок */}
      <Box
        sx={{
          background: '#2979ff',
          color: '#fff',
          py: 2,
          px: 2,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <Typography variant="h6" fontWeight={600} sx={{ fontSize: 20 }}>
          Чат-помощник
        </Typography>
        {onClose && (
          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
            <FabCloseChat onClick={onClose} />
          </Box>
        )}
      </Box>
      {/* Область сообщений */}
      <Box
        sx={{
          flex: 1,
          px: 2,
          py: 2,
          overflowY: 'auto',
          background: '#fff',
          minHeight: 0,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#bdbdbd',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#a0a0a0',
          },
        }}
      >
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-end',
              mb: 1.5,
              justifyContent: msg.author === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: msg.author === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.author === 'bot' && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, ml: 0.5 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '50%', background: '#F5F6FA', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1 }}>
                    <img src="/assets/kpd-logo.svg" alt="KPD logo" style={{ width: 24, height: 24 }} />
                  </Box>
                  <Typography sx={{ fontSize: 12, color: '#00000073', fontWeight: 500 }}>
                    Помощник KPD
                  </Typography>
                </Box>
              )}
              {/* Сообщение-файл пользователя */}
              {msg.fileName ? (
                <Box
                  sx={{
                    maxWidth: '292px',
                    bgcolor: '#F5F5F5',
                    color: '#22242B',
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    boxShadow: 'none',
                    fontSize: 16,
                    wordBreak: 'break-word',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <InsertDriveFileOutlinedIcon sx={{ color: '#2979ff', fontSize: 20 }} />
                  <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Typography
                      component="span"
                      sx={{
                        color: '#2979ff',
                        fontSize: 15,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 120,
                      }}
                      title={msg.fileName}
                    >
                      {msg.fileName}
                    </Typography>
                    <IconButton size="small" onClick={() => {}}>
                      <DeleteOutlineIcon sx={{ color: '#bdbdbd', fontSize: 18 }} />
                    </IconButton>
                  </Box>
                  <Box sx={{ flex: 1 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                    {msg.read ? (
                      <DoneAllIcon sx={{ fontSize: 16, color: '#2979ff' }} />
                    ) : (
                      <DoneIcon sx={{ fontSize: 16, color: '#bdbdbd' }} />
                    )}
                    <Typography sx={{ fontSize: 12, color: '#00000073', textAlign: 'right' }}>
                      {msg.time}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    maxWidth: '292px',
                    bgcolor: msg.author === 'user' ? '#F5F5F5' : '#E8F5FF',
                    color: '#22242B',
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    boxShadow: msg.author === 'bot' ? '0 1px 4px rgba(0,0,0,0.04)' : 'none',
                    fontSize: 16,
                    wordBreak: 'break-word',
                    position: 'relative',
                  }}
                >
                  {msg.text}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1, alignItems: 'center', gap: 0.5 }}>
                    {msg.author === 'user' && (
                      msg.read ? (
                        <DoneAllIcon sx={{ fontSize: 16, color: '#2979ff' }} />
                      ) : (
                        <DoneIcon sx={{ fontSize: 16, color: '#bdbdbd' }} />
                      )
                    )}
                    <Typography sx={{ fontSize: 12, color: '#00000073', textAlign: 'right' }}>
                      {msg.time}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        ))}
        {/* Индикатор "бот печатает" с анимацией */}
        {loading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              mb: 1.5,
              alignItems: 'flex-end',
            }}
          >
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, ml: 0.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '50%', background: '#F5F6FA', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1 }}>
                  <img src="/assets/kpd-logo.svg" alt="KPD logo" style={{ width: 24, height: 24 }} />
                </Box>
                <Typography sx={{ fontSize: 12, color: '#00000073', fontWeight: 500 }}>
                  Помощник KPD
                </Typography>
              </Box>
              <Box className={styles['typing-dots']}>
                <span className={styles['typing-dot']} />
                <span className={styles['typing-dot']} />
                <span className={styles['typing-dot']} />
              </Box>
            </Box>
          </Box>
        )}
        {showScenarios && (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {scenarioButtons.map((btn, i) => (
              <Button
                key={i}
                variant="outlined"
                sx={{
                  alignSelf: 'flex-start',
                  borderRadius: '6px',
                  color: '#000000E0',
                  borderColor: '#D9D9D9',
                  textTransform: 'none',
                  fontWeight: 400,
                  fontSize: 14,
                  bgcolor: '#fff',
                  px: '15px',
                  py: '5px',
                  minWidth: 0,
                  boxShadow: 'none',
                  '&:hover': { borderColor: '#2979ff', bgcolor: '#f5f6fa', boxShadow: 'none' },
                }}
                onClick={() => handleScenarioClick(btn)}
              >
                {btn}
              </Button>
            ))}
          </Box>
        )}
        {error && (
          <Typography sx={{ color: 'red', textAlign: 'center', mt: 1 }}>
            {error}
          </Typography>
        )}
      </Box>
      {/* Нижняя панель */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderTop: '1px solid #e0e0e0',
          background: '#fff',
          py: 1.5,
          px: 2,
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept="*"
        />
        <IconButton sx={{ mr: 1 }} aria-label="Прикрепить файл" onClick={handleFileClick}>
          <AttachFileIcon sx={{ color: '#888' }} />
        </IconButton>
        {attachedFile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5, mr: 1, minWidth: 0 }}>
            <InsertDriveFileOutlinedIcon sx={{ color: '#2979ff', fontSize: 20 }} />
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography
                component="span"
                sx={{
                  color: '#2979ff',
                  fontSize: 15,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 120,
                }}
                title={attachedFile.name}
              >
                {attachedFile.name}
              </Typography>
              <IconButton size="small" onClick={handleRemoveFile}>
                <DeleteOutlineIcon sx={{ color: '#bdbdbd', fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>
        )}
        <TextField
          variant="standard"
          placeholder={!attachedFile ? 'Сообщение...' : ''}
          value={message}
          onChange={handleMessageChange}
          multiline
          minRows={1}
          maxRows={5}
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: 16,
              flex: 1,
              background: 'transparent',
              p: 0,
              m: 0,
              '& textarea': { textAlign: 'left', p: 0, m: 0 },
              color: '#22242B',
            },
          }}
          sx={{ flex: 1, mr: 1, p: 0, m: 0, minWidth: 0 }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && (message || attachedFile)) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={!!attachedFile || loading}
        />
        <IconButton
          sx={{
            background: (message || attachedFile) && !loading ? '#2979ff' : undefined,
            color: (message || attachedFile) && !loading ? '#fff' : undefined,
            width: 40,
            height: 40,
            borderRadius: '50%',
            '&:hover': {
              background: (message || attachedFile) && !loading ? '#1e4dcc' : undefined,
            },
          }}
          aria-label="Отправить"
          disabled={!message && !attachedFile || loading}
          onClick={handleSend}
        >
          <NorthIcon sx={{ color: (message || attachedFile) && !loading ? '#fff' : undefined }} />
        </IconButton>
      </Box>
    </Paper>
  );
};