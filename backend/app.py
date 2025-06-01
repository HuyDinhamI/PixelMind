from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import uuid
import json
import requests
import time
from leonardo_api import LeonardoAPI

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
RESULT_FOLDER = 'results'

# Tạo thư mục nếu chưa có
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

# Initialize Leonardo API
leonardo = LeonardoAPI()

@app.route('/api/upload', methods=['POST'])
def upload_and_process():
    try:
        # Nhận ảnh và prompt từ frontend
        if 'image' not in request.files:
            return jsonify({'error': 'No image file'}), 400
        
        image_file = request.files['image']
        prompt = request.form.get('prompt', '')
        
        if image_file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        # Tạo unique ID cho request này
        request_id = str(uuid.uuid4())
        
        # Lưu ảnh gốc
        original_filename = f"{request_id}_original.jpg"
        original_path = os.path.join(UPLOAD_FOLDER, original_filename)
        image_file.save(original_path)
        
        # Gọi Leonardo API
        result = leonardo.generate_image(original_path, prompt)
        
        if result['success']:
            return jsonify({
                'success': True,
                'request_id': request_id,
                'original_image': f'/api/image/{original_filename}',
                'generated_image': result['image_url'],
                'generated_filename': result['filename']
            })
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/image/<filename>')
def get_image(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/api/result/<filename>')
def get_result(filename):
    return send_from_directory(RESULT_FOLDER, filename)

@app.route('/api/download/<filename>')
def download_image(filename):
    return send_from_directory(RESULT_FOLDER, filename, as_attachment=True)

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
