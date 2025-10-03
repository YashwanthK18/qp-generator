import random
import re
from docx import Document

def generate_question_paper(input_files, output_path):
    """
    Generate a randomized question paper from multiple input files.
    
    Args:
        input_files: List of input docx file paths
        output_path: Path where the output docx will be saved
    
    Returns:
        Dictionary with statistics about the generation
    """
    # Pattern to detect question numbers
    question_start_pattern = re.compile(r'^\s*(Q?\d+[\.\)]?)', re.IGNORECASE)
    
    # Dictionary: {module_name: [list of question_blocks]}
    modules_questions = {}
    
    for file in input_files:
        doc = Document(file)
        current_module = None
        current_question = []
        
        for para in doc.paragraphs:
            text = para.text.strip()
            if not text:
                continue
            
            # Detect module heading
            if text.lower().startswith("module"):
                current_module = text
                if current_module not in modules_questions:
                    modules_questions[current_module] = []
                continue
            
            # Detect question start
            if question_start_pattern.match(text):
                # Store previous question block if any
                if current_question and current_module:
                    modules_questions[current_module].append("\n".join(current_question))
                current_question = [text]
            else:
                # Continuation of same question block
                if current_question:
                    current_question.append(text)
        
        # Add the last question in file
        if current_question and current_module:
            modules_questions[current_module].append("\n".join(current_question))
    
    # Generate new document
    new_doc = Document()
    new_doc.add_heading("Generated Question Paper", 0)
    
    total_questions = 0
    for module, questions in modules_questions.items():
        if questions:
            new_doc.add_heading(module, level=1)
            chosen_question = random.choice(questions)
            new_doc.add_paragraph(chosen_question)
            total_questions += 1
    
    # Save the document
    new_doc.save(output_path)
    
    return {
        'modules': len(modules_questions),
        'questions': total_questions
    }