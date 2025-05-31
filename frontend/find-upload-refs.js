/**
 * Script để tìm các tham chiếu đến uploadImage trong code
 * Chạy lệnh sau tại thư mục gốc của project:
 * node frontend/find-upload-refs.js
 */

const fs = require('fs');
const path = require('path');

// Các thư mục cần tìm kiếm
const DIR_TO_SEARCH = [
  path.join(__dirname, 'src', 'components'),
  path.join(__dirname, 'src', 'context'),
  path.join(__dirname, 'src', 'services'),
  path.join(__dirname, 'src')
];

// Các từ khóa cần tìm
const KEYWORDS = ['uploadImage', '/upload', 'generation/upload'];

// Đọc tất cả các file JS và JSX
const getFiles = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(filePath));
    } else {
      if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        results.push(filePath);
      }
    }
  });
  
  return results;
};

// Tìm kiếm từ khóa trong từng file
const searchInFiles = () => {
  let foundReferences = false;
  
  DIR_TO_SEARCH.forEach(dir => {
    const files = getFiles(dir);
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const relativePath = path.relative(__dirname, file);
      
      KEYWORDS.forEach(keyword => {
        if (content.includes(keyword)) {
          const lines = content.split('\n');
          lines.forEach((line, i) => {
            if (line.includes(keyword)) {
              foundReferences = true;
              console.log(`Tìm thấy '${keyword}' trong file ${relativePath}:${i + 1}`);
              console.log(`  ${line.trim()}`);
            }
          });
        }
      });
    });
  });
  
  if (!foundReferences) {
    console.log("Không tìm thấy tham chiếu nào đến uploadImage hoặc /upload trong code.");
    console.log("Có thể cần xóa cache trình duyệt hoặc khởi động lại frontend.");
  }
};

// Chạy tìm kiếm
console.log("Bắt đầu tìm kiếm tham chiếu đến uploadImage...");
searchInFiles();
