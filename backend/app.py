from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from question_generator import generate_question_paper

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'output'
ALLOWED_EXTENSIONS = {'docx', 'doc'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/generate', methods=['POST'])
def generate():
    try:
        # Clear previous uploads
        for file in os.listdir(UPLOAD_FOLDER):
            os.remove(os.path.join(UPLOAD_FOLDER, file))
        
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        
        if len(files) == 0:
            return jsonify({'error': 'No files selected'}), 400
        
        if len(files) > 5:
            return jsonify({'error': 'Maximum 5 files allowed'}), 400
        
        file_paths = []
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                file_paths.append(filepath)
            else:
                return jsonify({'error': f'Invalid file type: {file.filename}'}), 400
        
        # Generate question paper
        output_path = os.path.join(app.config['OUTPUT_FOLDER'], 'new_question_paper.docx')
        stats = generate_question_paper(file_paths, output_path)
        
        return jsonify({
            'message': 'Question paper generated successfully',
            'modulesFound': stats['modules'],
            'questionsExtracted': stats['questions'],
            'filename': 'new_question_paper.docx'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/download', methods=['GET'])
def download():
    try:
        output_path = os.path.join(app.config['OUTPUT_FOLDER'], 'new_question_paper.docx')
        if not os.path.exists(output_path):
            return jsonify({'error': 'No generated file found'}), 404
        
        return send_file(output_path, as_attachment=True, download_name='new_question_paper.docx')
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)