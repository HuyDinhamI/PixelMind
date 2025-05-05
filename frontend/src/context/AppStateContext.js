import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Các trạng thái của ứng dụng
export const APP_STATES = {
  WELCOME: 'welcome',        // Màn hình chào mừng/khởi đầu
  CAPTURE: 'capture',        // Đang chụp ảnh
  PROMPT: 'prompt',          // Nhập prompt
  GENERATING: 'generating',  // Đang tạo ảnh
  RESULTS: 'results',        // Hiển thị kết quả
  PRINTING: 'printing',      // Đang in ảnh
  COMPLETE: 'complete'       // Hoàn thành (hiện nút restart)
};

// Các actions có thể thực hiện
const APP_ACTIONS = {
  START: 'START',                // Bắt đầu (từ welcome -> capture)
  CAPTURE_IMAGE: 'CAPTURE_IMAGE', // Đã chụp ảnh (capture -> prompt)
  SUBMIT_PROMPT: 'SUBMIT_PROMPT', // Đã gửi prompt (prompt -> generating)
  RECEIVE_RESULTS: 'RECEIVE_RESULTS', // Đã nhận kết quả (generating -> results)
  SELECT_IMAGE: 'SELECT_IMAGE',   // Chọn ảnh để in
  PRINT_IMAGE: 'PRINT_IMAGE',     // In ảnh (results -> printing)
  COMPLETE_PRINT: 'COMPLETE_PRINT', // Hoàn thành in (printing -> complete)
  RESET: 'RESET',                // Reset về trạng thái khởi đầu
  SET_ERROR: 'SET_ERROR',        // Đặt thông báo lỗi
  CLEAR_ERROR: 'CLEAR_ERROR'     // Xóa thông báo lỗi
};

// Initial state
const initialState = {
  currentState: APP_STATES.WELCOME,
  capturedImage: null,
  sessionId: null,
  prompt: '',
  generationId: null,
  generatedImages: [],
  selectedImageIndex: null,
  error: null,
  idleTime: 0,
  printJobId: null
};

// Reducer để cập nhật state
function appReducer(state, action) {
  switch (action.type) {
    case APP_ACTIONS.START:
      return {
        ...state,
        currentState: APP_STATES.CAPTURE,
        error: null,
        idleTime: 0
      };
      
    case APP_ACTIONS.CAPTURE_IMAGE:
      return {
        ...state,
        currentState: APP_STATES.PROMPT,
        capturedImage: action.payload.image,
        sessionId: action.payload.sessionId,
        error: null,
        idleTime: 0
      };
      
    case APP_ACTIONS.SUBMIT_PROMPT:
      return {
        ...state,
        currentState: APP_STATES.GENERATING,
        prompt: action.payload.prompt,
        generationId: action.payload.generationId,
        error: null,
        idleTime: 0
      };
      
    case APP_ACTIONS.RECEIVE_RESULTS:
      return {
        ...state,
        currentState: APP_STATES.RESULTS,
        generatedImages: action.payload.images,
        error: null,
        idleTime: 0
      };
      
    case APP_ACTIONS.SELECT_IMAGE:
      return {
        ...state,
        selectedImageIndex: action.payload.index,
        idleTime: 0
      };
      
    case APP_ACTIONS.PRINT_IMAGE:
      return {
        ...state,
        currentState: APP_STATES.PRINTING,
        printJobId: action.payload.jobId,
        error: null,
        idleTime: 0
      };
      
    case APP_ACTIONS.COMPLETE_PRINT:
      return {
        ...state,
        currentState: APP_STATES.COMPLETE,
        error: null,
        idleTime: 0
      };
      
    case APP_ACTIONS.RESET:
      return {
        ...initialState,
        idleTime: 0
      };
      
    case APP_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload.message,
        idleTime: 0
      };
      
    case APP_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
        idleTime: 0
      };
      
    case 'INCREMENT_IDLE_TIME':
      return {
        ...state,
        idleTime: state.idleTime + 1
      };
      
    default:
      return state;
  }
}

// Context
const AppStateContext = createContext();

export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Tự động reset khi không hoạt động trong một thời gian
  useEffect(() => {
    let idleInterval;
    
    // Chỉ theo dõi thời gian không hoạt động nếu không ở trạng thái khởi đầu
    if (state.currentState !== APP_STATES.WELCOME) {
      idleInterval = setInterval(() => {
        dispatch({ type: 'INCREMENT_IDLE_TIME' });
      }, 1000); // Tăng mỗi giây
    }
    
    // Reset sau 60 giây không hoạt động
    if (state.idleTime > 60) {
      resetApp();
    }
    
    return () => {
      if (idleInterval) clearInterval(idleInterval);
    };
  }, [state.currentState, state.idleTime]);
  
  // Actions
  const startApp = () => {
    dispatch({ type: APP_ACTIONS.START });
  };
  
  const captureImage = (image, sessionId) => {
    dispatch({
      type: APP_ACTIONS.CAPTURE_IMAGE,
      payload: { image, sessionId }
    });
  };
  
  const submitPrompt = (prompt, generationId) => {
    dispatch({
      type: APP_ACTIONS.SUBMIT_PROMPT,
      payload: { prompt, generationId }
    });
  };
  
  const receiveResults = (images) => {
    dispatch({
      type: APP_ACTIONS.RECEIVE_RESULTS,
      payload: { images }
    });
  };
  
  const selectImage = (index) => {
    dispatch({
      type: APP_ACTIONS.SELECT_IMAGE,
      payload: { index }
    });
  };
  
  const printImage = (jobId) => {
    dispatch({
      type: APP_ACTIONS.PRINT_IMAGE,
      payload: { jobId }
    });
  };
  
  const completePrint = () => {
    dispatch({ type: APP_ACTIONS.COMPLETE_PRINT });
  };
  
  const resetApp = () => {
    dispatch({ type: APP_ACTIONS.RESET });
  };
  
  const setError = (message) => {
    dispatch({
      type: APP_ACTIONS.SET_ERROR,
      payload: { message }
    });
  };
  
  const clearError = () => {
    dispatch({ type: APP_ACTIONS.CLEAR_ERROR });
  };
  
  return (
    <AppStateContext.Provider
      value={{
        ...state,
        startApp,
        captureImage,
        submitPrompt,
        receiveResults,
        selectImage,
        printImage,
        completePrint,
        resetApp,
        setError,
        clearError,
        APP_STATES
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

// Hook để sử dụng context
export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
