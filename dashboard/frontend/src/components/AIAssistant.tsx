import React, { useState, useRef, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Button,
  Collapse,
} from '@mui/material';
import {
  Send as SendIcon,
  Psychology as AIIcon,
  TroubleshootOutlined as RCAIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  queryType?: string;
  data?: any;
}

interface QuickAction {
  label: string;
  query: string;
  icon: React.ReactElement;
  color: 'primary' | 'secondary' | 'error' | 'warning' | 'success';
}

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your Factory Digital Twin AI Assistant. I can help you with:\n\n• Root Cause Analysis for failures\n• Performance monitoring\n• Asset status queries\n• Impact analysis\n• Network diagnostics\n\nWhat would you like to know?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    {
      label: 'Root Cause Analysis',
      query: 'What are the root causes of failures?',
      icon: <RCAIcon />,
      color: 'error',
    },
    {
      label: 'Network Issues',
      query: 'Show network connectivity issues',
      icon: <RCAIcon />,
      color: 'primary',
    },
    {
      label: 'Power Problems',
      query: 'Check power and UPS status',
      icon: <WarningIcon />,
      color: 'warning',
    },
    {
      label: 'Performance Bottlenecks',
      query: 'Find performance bottlenecks',
      icon: <SpeedIcon />,
      color: 'warning',
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/api/ai/query`, {
        query: input,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
        queryType: response.data.queryType,
        data: response.data.data,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `I encountered an error: ${err.response?.data?.detail || err.message}. Please try rephrasing your question.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (query: string) => {
    setInput(query);

    // Immediately send the query
    const userMessage: Message = {
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/api/ai/query`, {
        query: query,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
        queryType: response.data.queryType,
        data: response.data.data,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `I encountered an error: ${err.response?.data?.detail || err.message}. Please try rephrasing your question.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AIIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">AI Assistant</Typography>
        <Chip label="Beta" size="small" color="primary" sx={{ ml: 1 }} />
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 2 }}>
        <Button
          size="small"
          onClick={() => setShowQuickActions(!showQuickActions)}
          endIcon={showQuickActions ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ mb: 1 }}
        >
          Quick Actions
        </Button>
        <Collapse in={showQuickActions}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {quickActions.map((action) => (
              <Chip
                key={action.label}
                icon={action.icon}
                label={action.label}
                onClick={() => handleQuickAction(action.query)}
                color={action.color}
                variant="outlined"
                size="small"
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Collapse>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Messages */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          mb: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <Box
              sx={{
                maxWidth: '80%',
                bgcolor: message.role === 'user' ? 'primary.main' : '#f1f5f9',
                color: message.role === 'user' ? 'white' : 'text.primary',
                p: 1.5,
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {message.content}
              </Typography>

              {/* Display data if available */}
              {message.data && message.data.assets && (
                <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                  <Typography variant="caption" fontWeight="bold">
                    Affected Assets: {message.data.assets.length}
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {message.data.assets.slice(0, 3).map((asset: any, i: number) => (
                      <Chip
                        key={i}
                        label={asset.name}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                    {message.data.assets.length > 3 && (
                      <Chip
                        label={`+${message.data.assets.length - 3} more`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              )}

              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 0.5,
                  opacity: 0.7,
                }}
              >
                {message.timestamp.toLocaleTimeString()}
              </Typography>
            </Box>
          </Box>
        ))}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Box
              sx={{
                bgcolor: '#f1f5f9',
                p: 1.5,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <CircularProgress size={16} />
              <Typography variant="body2">Analyzing...</Typography>
            </Box>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Ask about factory status, issues, or request analysis..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          multiline
          maxRows={3}
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={loading || !input.trim()}
        >
          <SendIcon />
        </IconButton>
      </Box>

      {/* Help Text */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="caption">
          <strong>Try asking:</strong> "Why is PLC-001 offline?", "What if UPS-Main fails?",
          "Show network issues", "Check power problems", "Find performance bottlenecks"
        </Typography>
      </Alert>
    </Paper>
  );
};

export default AIAssistant;
