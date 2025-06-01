from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
import os
import uuid
import json
import requests
import time
import qrcode
from io import BytesIO
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
        strength = float(request.form.get('strength', 0.3))  # Default optimized strength
        
        if image_file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        # Tạo unique ID cho request này
        request_id = str(uuid.uuid4())
        
        # Lưu ảnh gốc
        original_filename = f"{request_id}_original.jpg"
        original_path = os.path.join(UPLOAD_FOLDER, original_filename)
        image_file.save(original_path)
        
        # Gọi Leonardo API với thông số tối ưu
        result = leonardo.generate_image(original_path, prompt, strength)
        
        if result['success']:
            return jsonify({
                'success': True,
                'request_id': request_id,
                'original_image': f'/api/image/{original_filename}',
                'generated_images': result['images'],  # Tất cả ảnh được tạo
                'primary_image': result['primary_image'],  # Ảnh chính
                'enhanced_prompt': result['enhanced_prompt'],  # Prompt đã cải thiện
                'settings': result['settings'],  # Thông số đã sử dụng
                'total_images': len(result['images'])
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

@app.route('/api/qr/<filename>')
def generate_qr_code(filename):
    """Tạo QR code cho download link"""
    try:
        # Tạo download URL
        download_url = f"{request.url_root}api/download/{filename}"
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(download_url)
        qr.make(fit=True)
        
        # Tạo image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to bytes để return
        img_io = BytesIO()
        img.save(img_io, 'PNG')
        img_io.seek(0)
        
        return send_file(img_io, mimetype='image/png')
        
    except Exception as e:
        return jsonify({'error': f'QR generation failed: {str(e)}'}), 500

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'leonardo_model': 'PhotoReal v2',
        'optimized_settings': True,
        'version': '2.1',
        'qr_enabled': True,
        'features': ['simple_edit', 'qr_download', 'optimized_defaults']
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
