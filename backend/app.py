from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
import os
import uuid
import json
import requests
import time
import qrcode
from io import BytesIO
import logging
from leonardo_api import LeonardoAPI

# Setup detailed logging for Flask
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
RESULT_FOLDER = 'results'

# Tạo thư mục nếu chưa có
logger.info(f"Creating folders: {UPLOAD_FOLDER}, {RESULT_FOLDER}")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)
logger.info("Folders created successfully")

# Initialize Leonardo API
logger.info("Initializing Leonardo API...")
leonardo = LeonardoAPI()
logger.info("Leonardo API initialized")

@app.route('/api/upload', methods=['POST'])
def upload_and_process():
    logger.info("=== NEW UPLOAD REQUEST ===")
    
    try:
        # Log request details
        logger.info(f"Request method: {request.method}")
        logger.info(f"Request headers: {dict(request.headers)}")
        logger.info(f"Request files: {list(request.files.keys())}")
        logger.info(f"Request form data: {dict(request.form)}")
        
        # Nhận ảnh và prompt từ frontend
        if 'image' not in request.files:
            logger.error("No image file in request")
            return jsonify({'error': 'No image file'}), 400
        
        image_file = request.files['image']
        prompt = request.form.get('prompt', '')
        strength = float(request.form.get('strength', 0.3))  # Default optimized strength
        
        logger.info(f"Received image file: {image_file.filename}")
        logger.info(f"Received prompt: '{prompt}'")
        logger.info(f"Received strength: {strength}")
        
        if image_file.filename == '':
            logger.error("Empty image filename")
            return jsonify({'error': 'No image selected'}), 400
        
        # Tạo unique ID cho request này
        request_id = str(uuid.uuid4())
        logger.info(f"Generated request ID: {request_id}")
        
        # Lưu ảnh gốc
        original_filename = f"{request_id}_original.jpg"
        original_path = os.path.join(UPLOAD_FOLDER, original_filename)
        
        logger.info(f"Saving original image to: {original_path}")
        
        try:
            image_file.save(original_path)
            file_size = os.path.getsize(original_path)
            logger.info(f"Original image saved successfully, size: {file_size} bytes")
        except Exception as e:
            logger.error(f"Failed to save original image: {str(e)}")
            return jsonify({'error': f'Failed to save image: {str(e)}'}), 500
        
        # Gọi Leonardo API với thông số tối ưu
        logger.info("Calling Leonardo API for image generation...")
        result = leonardo.generate_image(original_path, prompt, strength)
        
        logger.info(f"Leonardo API result: {result}")
        
        if result['success']:
            logger.info("Image generation successful!")
            response_data = {
                'success': True,
                'request_id': request_id,
                'original_image': f'/api/image/{original_filename}',
                'generated_images': result['images'],  # Tất cả ảnh được tạo
                'primary_image': result['primary_image'],  # Ảnh chính
                'enhanced_prompt': result['enhanced_prompt'],  # Prompt đã cải thiện
                'settings': result['settings'],  # Thông số đã sử dụng
                'total_images': len(result['images'])
            }
            logger.info(f"Sending success response: {response_data}")
            return jsonify(response_data)
        else:
            logger.error(f"Leonardo API failed: {result['error']}")
            error_response = {
                'success': False,
                'error': result['error']
            }
            logger.info(f"Sending error response: {error_response}")
            return jsonify(error_response), 500
            
    except Exception as e:
        logger.error(f"Exception in upload_and_process: {str(e)}")
        logger.exception("Full exception traceback:")
        return jsonify({'error': str(e)}), 500

@app.route('/api/image/<filename>')
def get_image(filename):
    logger.info(f"Serving image: {filename}")
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/api/result/<filename>')
def get_result(filename):
    logger.info(f"Serving result: {filename}")
    return send_from_directory(RESULT_FOLDER, filename)

@app.route('/api/download/<filename>')
def download_image(filename):
    logger.info(f"Download requested for: {filename}")
    return send_from_directory(RESULT_FOLDER, filename, as_attachment=True)

@app.route('/api/qr/<filename>')
def generate_qr_code(filename):
    """Tạo QR code cho download link"""
    logger.info(f"QR code requested for: {filename}")
    
    try:
        # Tạo download URL
        download_url = f"{request.url_root}api/download/{filename}"
        logger.info(f"QR download URL: {download_url}")
        
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
        
        logger.info("QR code generated successfully")
        return send_file(img_io, mimetype='image/png')
        
    except Exception as e:
        logger.error(f"QR generation failed: {str(e)}")
        return jsonify({'error': f'QR generation failed: {str(e)}'}), 500

@app.route('/health')
def health():
    logger.info("Health check requested")
    return jsonify({
        'status': 'healthy',
        'leonardo_model': 'PhotoReal v2',
        'optimized_settings': True,
        'version': '2.1',
        'qr_enabled': True,
        'features': ['simple_edit', 'qr_download', 'optimized_defaults'],
        'logging_enabled': True
    })

if __name__ == '__main__':
    logger.info("Starting Flask application...")
    logger.info(f"Upload folder: {UPLOAD_FOLDER}")
    logger.info(f"Result folder: {RESULT_FOLDER}")
    app.run(debug=True, host='0.0.0.0', port=5000)
