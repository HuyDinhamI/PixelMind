from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# ANSI color codes for terminal output
class Colors:
    INFO = '\033[94m'      # Blue
    WARN = '\033[93m'      # Yellow
    ERROR = '\033[91m'     # Red
    API = '\033[96m'       # Cyan
    PHASE = '\033[95m'     # Magenta
    ENDC = '\033[0m'       # End color
    BOLD = '\033[1m'       # Bold

def format_log(level, phase, message, data=None):
    """Format log message with colors and timestamp"""
    timestamp = datetime.datetime.now().strftime('%H:%M:%S')
    
    # Choose color based on level
    color_map = {
        'INFO': Colors.INFO,
        'WARN': Colors.WARN,
        'ERROR': Colors.ERROR,
        'API': Colors.API,
        'PHASE': Colors.PHASE
    }
    
    color = color_map.get(level, Colors.INFO)
    
    # Format the log line
    log_line = f"{color}[{timestamp}] [{level}] [{phase}]{Colors.ENDC} {message}"
    
    # Add data if present
    if data and isinstance(data, dict) and data:
        # Pretty print data on next line with indentation
        data_str = json.dumps(data, indent=2, ensure_ascii=False)
        log_line += f"\n{Colors.BOLD}    Data:{Colors.ENDC} {data_str}"
    
    return log_line

@app.route('/api/log', methods=['POST'])
def receive_log():
    """Receive log from frontend and print to terminal"""
    try:
        log_data = request.get_json()
        
        if not log_data:
            return jsonify({"error": "No data provided"}), 400
        
        level = log_data.get('level', 'INFO')
        phase = log_data.get('phase', 'UNKNOWN')
        message = log_data.get('message', '')
        data = log_data.get('data', {})
        
        # Print formatted log to terminal
        formatted_log = format_log(level, phase, message, data)
        print(formatted_log)
        
        return jsonify({"status": "logged"}), 200
        
    except Exception as e:
        print(f"{Colors.ERROR}[LOG_SERVER] Error processing log: {str(e)}{Colors.ENDC}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "PixelMind Log Server is running",
        "timestamp": datetime.datetime.now().isoformat()
    })

@app.route('/', methods=['GET'])
def home():
    """Home endpoint"""
    return jsonify({
        "message": "PixelMind Log Server",
        "version": "1.0.0",
        "endpoints": [
            "POST /api/log - Receive logs from frontend",
            "GET /api/health - Health check"
        ]
    })

if __name__ == '__main__':
    print(f"{Colors.BOLD}{Colors.PHASE}🚀 Starting PixelMind Log Server...{Colors.ENDC}")
    print(f"{Colors.INFO}📡 Frontend should send logs to: http://localhost:3001/api/log{Colors.ENDC}")
    print(f"{Colors.WARN}🔧 Health check: http://localhost:3001/api/health{Colors.ENDC}")
    print(f"{Colors.PHASE}📋 Logs will appear below:{Colors.ENDC}")
    print("=" * 80)
    
    app.run(host='0.0.0.0', port=3001, debug=False)
