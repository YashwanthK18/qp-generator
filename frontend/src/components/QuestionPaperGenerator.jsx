import React, { useState } from 'react';
import { Upload, FileText, Download, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

export default function QuestionPaperGenerator() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    const docxFiles = uploadedFiles.filter(file => 
      file.name.endsWith('.docx') || file.name.endsWith('.doc')
    );
    
    if (docxFiles.length !== uploadedFiles.length) {
      setError('Only .docx files are allowed');
      return;
    }
    
    setFiles(prev => [...prev, ...docxFiles].slice(0, 5));
    setError(null);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const generatePaper = async () => {
    if (files.length === 0) {
      setError('Please upload at least one document');
      return;
    }

    setProcessing(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post(`${API_URL}/generate`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
      setProcessing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate question paper');
      setProcessing(false);
    }
  };

  const downloadPaper = async () => {
    try {
      const response = await axios.get(`${API_URL}/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'new_question_paper.docx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download the file');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Question Paper Generator
          </h1>
          <p className="text-gray-600">
            Upload up to 5 question papers and generate a randomized exam
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Question Papers ({files.length}/5)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supports .docx files only
              </p>
              <input
                type="file"
                multiple
                accept=".docx,.doc"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={files.length >= 5}
              />
              <label
                htmlFor="file-upload"
                className={`inline-block px-6 py-2 rounded-lg font-medium cursor-pointer transition-colors ${
                  files.length >= 5
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                Choose Files
              </label>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Uploaded Files
              </h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center space-x-2 bg-red-50 border border-red-200 rounded-lg p-4">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generatePaper}
            disabled={processing || files.length === 0}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
              processing || files.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              'Generate Question Paper'
            )}
          </button>

          {/* Result Section */}
          {result && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Question Paper Generated Successfully!
                  </h3>
                  <div className="space-y-1 text-sm text-green-800 mb-4">
                    <p>• Modules found: {result.modulesFound}</p>
                    <p>• Questions extracted: {result.questionsExtracted}</p>
                    <p>• One random question selected per module</p>
                  </div>
                  <button
                    onClick={downloadPaper}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Question Paper</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            How It Works
          </h2>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="font-bold text-indigo-600 mr-2">1.</span>
              <span>Upload 1-5 question paper documents in .docx format</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-indigo-600 mr-2">2.</span>
              <span>The system identifies modules and questions from each paper</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-indigo-600 mr-2">3.</span>
              <span>One random question is selected from each module</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-indigo-600 mr-2">4.</span>
              <span>A new randomized question paper is generated and ready to download</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}