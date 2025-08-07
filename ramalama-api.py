#!/usr/bin/env python3
"""
Simple HTTP API wrapper for RamaLama CLI commands
"""

from flask import Flask, request, jsonify
import subprocess
import logging
import os

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "ramalama-api"}), 200

@app.route('/execute', methods=['POST'])
def execute_ramalama():
    try:
        data = request.json
        if not data or 'command' not in data:
            return jsonify({"error": "Missing 'command' in request body"}), 400
        
        command = data['command']
        if not isinstance(command, list):
            return jsonify({"error": "'command' must be a list"}), 400
        
        if not command or command[0] != 'ramalama':
            return jsonify({"error": "Command must start with 'ramalama'"}), 400
        
        # Execute the ramalama command
        logging.info(f"Executing command: {' '.join(command)}")
        
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        
        response = {
            "command": ' '.join(command),
            "exitCode": result.returncode,
            "output": result.stdout,
            "error": result.stderr,
            "success": result.returncode == 0
        }
        
        logging.info(f"Command executed with exit code: {result.returncode}")
        return jsonify(response), 200
        
    except subprocess.TimeoutExpired:
        return jsonify({"error": "Command timed out after 5 minutes"}), 408
    except Exception as e:
        logging.error(f"Error executing command: {str(e)}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/info', methods=['GET'])
def get_info():
    """Get ramalama info"""
    try:
        result = subprocess.run(['ramalama', 'info'], capture_output=True, text=True)
        return jsonify({
            "command": "ramalama info",
            "exitCode": result.returncode,
            "output": result.stdout,
            "error": result.stderr
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/containers', methods=['GET'])
def list_containers():
    """List running containers"""
    try:
        result = subprocess.run(['ramalama', 'containers'], capture_output=True, text=True)
        return jsonify({
            "command": "ramalama containers",
            "exitCode": result.returncode,
            "output": result.stdout,
            "error": result.stderr
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('RAMALAMA_PORT', 8080))
    host = os.environ.get('RAMALAMA_HOST', '0.0.0.0')
    app.run(host=host, port=port, debug=False)