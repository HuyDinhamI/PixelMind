import React, { useState, useCallback } from 'react';
import { 
  Button, 
  Typography, 
  Box, 
  TextField, 
  CircularProgress,
  Paper,
  Grid
} from '@mui/material';
import { Send, ArrowBack } from '@mui/icons-material';
import { useAppState } from '../context/AppStateContext';
import { generationApi } from '../services/api';

const PromptInput = () => {
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sessionId, capturedImage, submitPrompt, captureImage, setError } = useAppState();
  
  // Danh sách gợi ý prompt
  const promptSuggestions = [
    "Biến tôi thành một nhân vật hoạt hình Pixar",
    "Tôi như một siêu anh hùng Marvel",
    "Tôi trong thế giới phim Star Wars",
    "Tôi với phong cách anime Nhật Bản",
    "Tôi như một nhân vật trong truyện cổ tích",
    "Tôi trong phong cách tranh dầu Renaissance"
  ];
  
  const handleSubmit = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Vui lòng nhập mô tả cho ảnh của bạn.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Gọi API để gửi prompt và tạo hình ảnh
      const result = await generationApi.generateImages(sessionId, prompt);
      
      if (!result.generation_id) {
        throw new Error('Không nhận được generation ID từ server.');
      }
      
      // Cập nhật state với prompt và generation ID
      submitPrompt(prompt, result.generation_id);
      
    } catch (error) {
      console.error('Error submitting prompt:', error);
      setError(error.message || 'Đã xảy ra lỗi khi gửi prompt.');
    } finally {
      setIsSubmitting(false);
    }
  }, [prompt, sessionId, submitPrompt, setError]);
  
  const handleSuggestionClick = (suggestion) => {
    setPrompt(suggestion);
  };
  
  return (
    <Box className="prompt-container" sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
          {capturedImage && (
            <Paper elevation={3} sx={{ p: 1, borderRadius: 2, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Ảnh của bạn
              </Typography>
              <img
                src={capturedImage}
                alt="Ảnh đã chụp"
                style={{ width: '100%', borderRadius: 8 }}
              />
            </Paper>
          )}
        </Grid>
        
        <Grid item xs={12} md={7}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Nhập mô tả
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 2 }}>
              Hãy mô tả phong cách bạn muốn biến đổi ảnh của mình:
            </Typography>
            
            <TextField
              fullWidth
              label="Mô tả (VD: Tôi như một siêu anh hùng Marvel)"
              multiline
              rows={3}
              variant="outlined"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isSubmitting}
              sx={{ mb: 3 }}
            />
            
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Hoặc chọn một gợi ý:
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {promptSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  size="small"
                  onClick={() => handleSuggestionClick(suggestion)}
                  sx={{ mb: 1 }}
                >
                  {suggestion}
                </Button>
              ))}
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => captureImage(null, null)}
                disabled={isSubmitting}
              >
                Quay lại
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                endIcon={<Send />}
                onClick={handleSubmit}
                disabled={isSubmitting || !prompt.trim()}
                sx={{ minWidth: 120 }}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} /> 
                    Đang xử lý...
                  </>
                ) : 'Tạo ảnh'}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PromptInput;
