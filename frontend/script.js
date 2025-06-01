// Common JavaScript functions for PixelMind

// Navigation function
function startCamera() {
    window.location.href = 'camera.html';
}

// API configuration
const API_BASE_URL = 'http://localhost:5000';

// Helper function to convert dataURL to Blob
function dataURLToBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

// Helper function to show notifications
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ff4757' : type === 'success' ? '#2ed573' : '#5352ed'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 500;
        max-width: 300px;
        word-wrap: break-word;
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation keyframes if not already added
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Helper function to validate image file
function validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
        showNotification('Chỉ hỗ trợ file ảnh (JPG, PNG, WebP)', 'error');
        return false;
    }
    
    if (file.size > maxSize) {
        showNotification('File ảnh quá lớn (tối đa 10MB)', 'error');
        return false;
    }
    
    return true;
}

// Helper function to compress image if needed
function compressImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            // Calculate new dimensions
            let { width, height } = img;
            
            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }
            
            // Set canvas size
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob(resolve, 'image/jpeg', quality);
        };
        
        img.src = URL.createObjectURL(file);
    });
}

// Helper function to check API connection
async function checkAPIConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            return true;
        }
    } catch (error) {
        console.warn('API connection check failed:', error);
    }
    return false;
}

// Helper function to save prompt to localStorage
function savePrompt(prompt) {
    localStorage.setItem('lastPrompt', prompt);
}

// Helper function to get saved prompt
function getSavedPrompt() {
    return localStorage.getItem('lastPrompt') || '';
}

// Helper function to clear all data
function clearAllData() {
    localStorage.removeItem('capturedImage');
    localStorage.removeItem('processResult');
    localStorage.removeItem('lastPrompt');
}

// Error handling wrapper for async functions
function withErrorHandling(asyncFn) {
    return async function(...args) {
        try {
            return await asyncFn.apply(this, args);
        } catch (error) {
            console.error('Error in async function:', error);
            showNotification('Có lỗi xảy ra. Vui lòng thử lại.', 'error');
            throw error;
        }
    };
}

// Initialize app on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a page that needs API connection
    const needsAPI = ['edit.html', 'result.html'].some(page => 
        window.location.pathname.includes(page)
    );
    
    if (needsAPI) {
        checkAPIConnection().then(connected => {
            if (!connected) {
                showNotification('Không thể kết nối đến server. Vui lòng đảm bảo backend đang chạy.', 'error');
            }
        });
    }
    
    // Add global error handler
    window.addEventListener('error', function(e) {
        console.error('Global error:', e.error);
        showNotification('Có lỗi xảy ra trong ứng dụng.', 'error');
    });
    
    // Add unhandled promise rejection handler
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
        showNotification('Có lỗi xảy ra khi xử lý dữ liệu.', 'error');
    });
});

// Utility function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Utility function to generate random ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Export functions for use in other scripts
window.PixelMind = {
    startCamera,
    dataURLToBlob,
    showNotification,
    validateImageFile,
    compressImage,
    checkAPIConnection,
    savePrompt,
    getSavedPrompt,
    clearAllData,
    withErrorHandling,
    formatFileSize,
    generateId,
    API_BASE_URL
};
