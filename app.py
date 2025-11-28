import os
import json
import re
import ollama
from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from pypdf import PdfReader

app = Flask(__name__)

# --- Database Config ---
# This creates a file 'study.db' in your folder to save your data
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///study.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- Models ---
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)

class Exam(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    subject = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(20), nullable=False)

# Initialize Database
with app.app_context():
    db.create_all()

# --- Routes ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data', methods=['GET'])
def get_data():
    tasks = [{'id': t.id, 'text': t.text, 'completed': t.completed} for t in Task.query.all()]
    exams = [{'id': e.id, 'subject': e.subject, 'date': e.date} for e in Exam.query.all()]
    return jsonify({'tasks': tasks, 'exams': exams})

@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.json
    new_task = Task(text=data['text'])
    db.session.add(new_task)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/tasks/<int:id>/toggle', methods=['POST'])
def toggle_task(id):
    task = Task.query.get_or_404(id)
    task.completed = not task.completed
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    task = Task.query.get_or_404(id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/exams', methods=['POST'])
def add_exam():
    data = request.json
    new_exam = Exam(subject=data['subject'], date=data['date'])
    db.session.add(new_exam)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/exams/<int:id>', methods=['DELETE'])
def delete_exam(id):
    exam = Exam.query.get_or_404(id)
    db.session.delete(exam)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/ai_process', methods=['POST'])
def ai_process():
    try:
        model = request.form.get('model', 'llama3')
        course = request.form.get('course', 'General')
        raw_text = request.form.get('raw_text', '')
        
        if 'pdf_file' in request.files:
            file = request.files['pdf_file']
            if file.filename != '':
                reader = PdfReader(file)
                # Limit to first 10 pages to prevent huge prompts
                for i, page in enumerate(reader.pages):
                    if i > 10: break 
                    raw_text += page.extract_text() + "\n"

        if not raw_text.strip():
            return jsonify({'error': 'No text found in PDF or input box'}), 400

        prompt = f"""
        I am a {course} student. 
        Extract a study checklist from the following syllabus text.
        Return ONLY a raw JSON array of strings. 
        Do not use markdown formatting like ```json.
        Just the array.
        Example: ["Topic 1", "Topic 2"]
        
        Syllabus:
        {raw_text[:8000]}
        """

        response = ollama.chat(model=model, messages=[{'role': 'user', 'content': prompt}])
        content = response['message']['content']
        
        # Regex to find JSON array
        match = re.search(r'\[.*\]', content, re.DOTALL)
        if match:
            topics = json.loads(match.group())
            for topic in topics:
                if isinstance(topic, str):
                    db.session.add(Task(text=topic))
            db.session.commit()
            return jsonify({'success': True, 'count': len(topics)})
        else:
            return jsonify({'error': 'AI response was not a valid list. Try again.'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)