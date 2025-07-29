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
  'Заполнение исходных данных',
  'Другое',
  'Начать новый чат',
];

export const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState(() => {
    const savedMessage = localStorage.getItem('chatMessage');
    return savedMessage ? savedMessage : '';
  });
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [
      {
        id: 1,
        text: 'Здравствуйте, я — KPD-бот, всегда готов помочь. Что бы вы хотели узнать?',
        author: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });
  const [showScenarios, setShowScenarios] = useState(() => {
    const savedShowScenarios = localStorage.getItem('chatShowScenarios');
    return savedShowScenarios ? JSON.parse(savedShowScenarios) : true;
  });
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(() => {
    const savedAttachedFile = localStorage.getItem('chatAttachedFile');
    return savedAttachedFile ? JSON.parse(savedAttachedFile) : null;
  });

  const [showDragZone, setShowDragZone] = useState(false);

  // TODO: КОСТЫЛЬ
  const [email, setEmail] = useState('verbose@example.com');

  const { sendRequest, loading, error, response } = useChatDialog();

  useEffect(() => {
    if (response && response.status === 'success') {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev: Message[]) => {
        const newMessages: Message[] = [
          ...prev,
          {
            id: Date.now() + 1,
            text: response.message,
            author: 'bot',
            time: now,
          },
        ];
        localStorage.setItem('chatMessages', JSON.stringify(newMessages));
        return newMessages;
      });
      const lastMessage = messages[messages.length - 1]?.text;
      if (lastMessage !== 'Чем могу помочь?') {
        setShowScenarios(true);
        localStorage.setItem('chatShowScenarios', JSON.stringify(true));
      }
    }
  }, [response]);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
    localStorage.setItem('chatShowScenarios', JSON.stringify(showScenarios));
    localStorage.setItem('chatMessage', message);
    localStorage.setItem('chatAttachedFile', JSON.stringify(attachedFile));
  }, [messages, showScenarios, message, attachedFile]);

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
      setShowDragZone(false);
    }
  };
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setAttachedFile(files[0]);
      setShowDragZone(false);
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
      setMessages((prev) => {
        const newMessages = [...prev, newMsg];
        localStorage.setItem('chatMessages', JSON.stringify(newMessages));
        return newMessages;
      });
      setAttachedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowScenarios(false);
      localStorage.setItem('chatShowScenarios', JSON.stringify(false));
      setTimeout(() => {
        setMessages((prev) => {
          const updatedMessages = prev.map((msg: Message) =>
            msg.id === newMsg.id ? { ...msg, read: true } as Message : msg
          );
          localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
          return updatedMessages;
        });
      }, 1000);
      setTimeout(() => {
        setMessages((prev) => {
          const newMessages = [
            ...prev,
            {
              id: Date.now() + 1,
              text: 'Ожидайте ответа специалиста.',
              author: 'bot',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            } as Message,
          ];
          localStorage.setItem('chatMessages', JSON.stringify(newMessages));
          return newMessages;
        });
        setShowScenarios(true);
        localStorage.setItem('chatShowScenarios', JSON.stringify(true));
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
      setMessages((prev) => {
        const newMessages = [...prev, newMsg];
        localStorage.setItem('chatMessages', JSON.stringify(newMessages));
        return newMessages;
      });
      setMessage('');
      localStorage.setItem('chatMessage', '');
      setShowScenarios(false);
      localStorage.setItem('chatShowScenarios', JSON.stringify(false));
      setTimeout(() => {
        setMessages((prev) => {
          const updatedMessages = prev.map((msg: Message) =>
            msg.id === newMsg.id ? { ...msg, read: true } as Message : msg
          );
          localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
          return updatedMessages;
        });
      }, 1000);
      await sendRequest({ text: message, email });
    }
  };

  const handleScenarioClick = (text: string) => {
    if (text === 'Другое') {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev: Message[]) => {
        const newMessages: Message[] = [
          ...prev,
          {
            id: Date.now() + 1,
            text: 'Чем могу помочь?',
            author: 'bot',
            time: now,
          },
        ];
        localStorage.setItem('chatMessages', JSON.stringify(newMessages));
        return newMessages;
      });
      setShowScenarios(false);
      localStorage.setItem('chatShowScenarios', JSON.stringify(false));
    } else if (text === 'Начать новый чат') {
      const initialMessage: Message = {
        id: Date.now(),
        text: 'Здравствуйте, я — KPD-бот, всегда готов помочь. Что бы вы хотели узнать?',
        author: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([initialMessage]);
      setShowScenarios(true);
      localStorage.removeItem('chatMessages');
      localStorage.removeItem('chatShowScenarios');
      localStorage.removeItem('chatMessage');
      localStorage.removeItem('chatAttachedFile');
      window.location.reload();
    } else {
      setMessage(text);
      localStorage.setItem('chatMessage', text);
      setShowScenarios(false);
      localStorage.setItem('chatShowScenarios', JSON.stringify(false));
    }
  };
  const isActive = (message || attachedFile) && !loading;

  return (
    <Paper
      elevation={8}
      sx={{
        width: { xs: 350, sm: 360, md: 360 }, // Уменьшим ширину для xs до 260px
        height: { xs: 480, sm: 500, md: 500 },
        borderRadius: 4,
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
            border: '1px dashed #2979ff',
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
          scrollBehavior: 'smooth',
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
                        fontSize: 14,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 120,
                      }}
                      title={msg.fileName}
                    >
                      {msg.fileName}
                    </Typography>
                    {/* <IconButton size="small" onClick={() => {}}>
                      <DeleteOutlineIcon sx={{ color: '#bdbdbd', fontSize: 18 }} />
                    </IconButton> */}
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
          <IconButton
            sx={{ mr: 1 }}
            aria-label="Прикрепить файл"
            onClick={() => setShowDragZone(true)}
          >
            <img src="/assets/load_icon.svg" alt="load-icon" style={{ color: '#2979ff' }} />
          </IconButton>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
            {/* Отображение прикреплённого файла */}
            {attachedFile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5 }}>
                <InsertDriveFileOutlinedIcon sx={{ color: '#2979ff', fontSize: 20 }} />
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography
                    component="span"
                    sx={{
                      color: '#2979ff',
                      fontSize: 14,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flexGrow: 1,
                    }}
                    title={attachedFile.name}
                  >
                    {attachedFile.name}
                  </Typography>
                  <IconButton size="small" onClick={handleRemoveFile}>
                    <img src="/assets/delete_icon.svg" alt="delete-icon" style={{ color: '#bdbdbd' }} />
                  </IconButton>
                </Box>
              </Box>
            )}

            {/* Поле ввода сообщения */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <TextField
                variant="standard"
                placeholder="Сообщение..."
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
                    '& textarea': {
                      textAlign: 'left',
                      p: '4px 8px',
                      m: 0,
                      overflow: 'auto',
                      wordBreak: 'break-word',
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
                    },
                    color: '#22242B',
                  },
                }}
                sx={{ flex: 1, p: 0, m: 0, minWidth: 0 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && (message || attachedFile)) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={loading} // Отключаем только при loading
              />
              <IconButton
                sx={{
                  background: isActive ? '#2979ff' : '#bdbdbd',
                  color: '#fff',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  pointerEvents: isActive ? 'auto' : 'none',
                  opacity: isActive ? 1 : 0.6,
                  '&:hover': {
                    background: isActive ? '#1e4dcc' : '#bdbdbd',
                  },
                }}
                aria-label="Отправить"
                onClick={isActive ? handleSend : undefined}
              >
                <NorthIcon sx={{ color: '#fff' }} />
              </IconButton>
            </Box>
          </Box>

          {showDragZone && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                background: '#EDF5FF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed #0062FF',
                pointerEvents: 'all',
                gap: 1,
              }}
              onClick={() => setShowDragZone(false)} // Закрытие при клике вне
            >
              <img src="/assets/upload_file.svg" alt="upload-file" style={{ width: 48, height: 48 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth: 200 }}>
                <Typography sx={{ color: '#000000E0', fontWeight: 400, fontSize: 16, lineHeight: '24px' }}>
                  Поместите файл сюда
                </Typography>
                <Typography sx={{ color: '#00000073', fontSize: 14, fontWeight: 400, lineHeight: '22px', textAlign: 'center' }}>
                  Можно отправить 1 файл за раз Объем не более 5 Mb
                </Typography>
              </Box>
              <Button
                variant="contained"
                sx={{ background: '#2979ff', '&:hover': { background: '#1e4dcc' } }}
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowDragZone(false);
                }}
              >
                Выбрать файл
              </Button>
            </Box>
          )}
        </Box>
    </Paper>
  );
};