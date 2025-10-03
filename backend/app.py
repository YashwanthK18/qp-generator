from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from question_generator import QuestionPaperGenerator

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'output'
ALLOWED_EXTENSIONS = {'docx', 'doc'}

# Create necessary folders
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/generate', methods=['POST'])
def generate_question_paper():
    try:
        # Check if files are present
        if 'files' not in request.files:
            return jsonify({'error': 'No files uploaded'}), 400
        
        files = request.files.getlist('files')
        
        if len(files) == 0:
            return jsonify({'error': 'No files selected'}), 400
        
        if len(files) > 5:
            return jsonify({'error': 'Maximum 5 files allowed'}), 400
        
        # Clear previous uploads
        for filename in os.listdir(UPLOAD_FOLDER):
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            if os.path.isfile(file_path):
                os.unlink(file_path)
        
        # Save uploaded files
        saved_files = []
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                saved_files.append(filepath)
            else:
                return jsonify({'error': f'Invalid file type: {file.filename}'}), 400
        
        # Generate question paper
        generator = QuestionPaperGenerator(saved_files)
        result = generator.generate_paper()
        
        if result['success']:
            return jsonify({
                'success': True,
                'modulesFound': result['modules_found'],
                'questionsExtracted': result['questions_extracted'],
                'message': 'Question paper generated successfully'
            }), 200
        else:
            return jsonify({'error': result['error']}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/download', methods=['GET'])
def download_paper():
    try:
        output_file = os.path.join(OUTPUT_FOLDER, 'new_question_paper.docx')
        if os.path.exists(output_file):
            return send_file(
                output_file,
                as_attachment=True,
                download_name='new_question_paper.docx',
                mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            )
        else:
            return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)