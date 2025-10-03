# Question Paper Generator

A full-stack application that generates randomized question papers by extracting questions from multiple Word documents and selecting one random question per module.

## Features

- 📄 Upload up to 5 .docx files
- 🎲 Randomly selects one question from each module
- 📥 Download generated question paper
- 💻 Modern React frontend with Tailwind CSS
- 🔧 Flask backend with python-docx

## Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

## Installation

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt