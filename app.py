from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
import requests
import PyPDF2
from io import BytesIO
import socket
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

# Data storage file
DATA_FILE = 'study_data.json'
OLLAMA_API = 'http://localhost:11434'

# --- RAG Setup ---
print("⏳ Loading Embedding Model... (This may take a moment)")
try:
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    print("✅ Embedding Model Loaded")
except Exception as e:
    print(f"❌ Failed to load embedding model: {e}")
    embedding_model = None

# In-memory Vector Store
# Structure: { 'chunks': ['text1', 'text2'], 'embeddings': np.array([[...], [...]]), 'source': 'filename' }
VECTOR_STORE = {
    'chunks': [],
    'embeddings': None,
    'source': None
}

def chunk_text(text, chunk_size=500, overlap=50):
    """Split text into overlapping chunks"""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += chunk_size - overlap
    return chunks

def load_data():
    """Load data from JSON file"""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {
        'exams': [],
        'checklist': [],
        'study_sessions': []
    }

def save_data(data):
    """Save data to JSON file"""
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

@app.route('/api/data', methods=['GET', 'POST'])
def handle_data():
    """Get or update stored data"""
    if request.method == 'GET':
        return jsonify(load_data())
    
    elif request.method == 'POST':
        data = load_data()
        payload = request.json
        data_type = payload.get('type')
        new_data = payload.get('data')
        
        if data_type in data:
            data[data_type] = new_data
            save_data(data)
            return jsonify({'success': True})
        
        return jsonify({'error': 'Invalid data type'}), 400

@app.route('/api/ollama/models', methods=['GET'])
def get_ollama_models():
    """Fetch available Ollama models"""
    try:
        response = requests.get(f'{OLLAMA_API}/api/tags', timeout=5)
        if response.status_code == 200:
            models_data = response.json()
            models = [model['name'] for model in models_data.get('models', [])]
            return jsonify({'models': models})
        return jsonify({'models': []})
    except Exception as e:
        print(f"Error fetching Ollama models: {e}")
        return jsonify({'models': []})

@app.route('/api/generate-checklist', methods=['POST'])
def generate_checklist():
    """Generate study checklist using Ollama"""
    try:
        data = request.json
        syllabus = data.get('syllabus', '')
        course = data.get('course', '')
        year = data.get('year', '')
        model = data.get('model', 'llama2')
        
        prompt = f"""Based on this {course} syllabus for {year}, create a detailed study checklist.
Break down the topics into specific, actionable study tasks.
Return ONLY a JSON object with the following structure:
{{
    "checklist": [
        {{
            "title": "Topic Name",
            "items": ["Task 1", "Task 2"]
        }}
    ]
}}

Syllabus:
{syllabus}
"""
        
        # Call Ollama API
        response = requests.post(
            f'{OLLAMA_API}/api/generate',
            json={
                'model': model,
                'prompt': prompt,
                'stream': False,
                'format': 'json'
            },
            timeout=120
        )
        
        if response.status_code == 200:
            result = response.json()
            generated_text = result.get('response', '')
            
            try:
                # Parse the JSON response
                data = json.loads(generated_text)
                checklist = data.get('checklist', [])
                return jsonify({'checklist': checklist})
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                print("Failed to parse JSON response")
                return jsonify({'error': 'Failed to parse AI response'}), 500
        
        return jsonify({'error': 'Failed to generate checklist'}), 500
        
    except Exception as e:
        print(f"Error generating checklist: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload-pdf', methods=['POST'])
def upload_pdf():
    """Extract text from uploaded PDF and process for RAG"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        filename = file.filename
        
        # Read PDF
        pdf_reader = PyPDF2.PdfReader(BytesIO(file.read()))
        text = ''
        
        for page in pdf_reader.pages:
            text += page.extract_text() + '\n'
        
        text = text.strip()
        
        # Process for RAG
        if embedding_model:
            chunks = chunk_text(text)
            embeddings = embedding_model.encode(chunks)
            
            VECTOR_STORE['chunks'] = chunks
            VECTOR_STORE['embeddings'] = embeddings
            VECTOR_STORE['source'] = filename
            print(f"✅ Processed {len(chunks)} chunks for {filename}")
        
        return jsonify({'text': text, 'chunks': len(VECTOR_STORE['chunks'])})
        
    except Exception as e:
        print(f"Error processing PDF: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    """RAG-enhanced Chat Endpoint"""
    try:
        data = request.json
        user_message = data.get('message', '')
        history = data.get('history', [])
        
        if not user_message:
            return jsonify({'error': 'Message required'}), 400

        context = ""
        
        # Retrieve Context
        if embedding_model and VECTOR_STORE['embeddings'] is not None:
            query_embedding = embedding_model.encode([user_message])
            similarities = cosine_similarity(query_embedding, VECTOR_STORE['embeddings'])[0]
            
            # Get top 3 chunks
            top_indices = np.argsort(similarities)[-3:][::-1]
            top_chunks = [VECTOR_STORE['chunks'][i] for i in top_indices]
            context = "\n\n".join(top_chunks)
            print(f"🔍 Retrieved {len(top_chunks)} chunks for context")

        # Construct Prompt
        system_prompt = f"""You are an AI Tutor. Use the following CONTEXT from the user's document to answer their question.
If the answer is not in the context, say you don't know based on the document, but try to help with general knowledge (and explicitly state it's general knowledge).
Keep answers concise and helpful.

CONTEXT:
{context}
"""
        
        # Format for Ollama
        full_prompt = f"{system_prompt}\n\nUser: {user_message}\nAssistant:"
        
        # Call Ollama
        response = requests.post(
            f'{OLLAMA_API}/api/generate',
            json={
                'model': 'llama2', # Default
                'prompt': full_prompt,
                'stream': False
            },
            timeout=60
        )
        
        if response.status_code == 200:
            ai_response = response.json().get('response', '')
            return jsonify({'response': ai_response})
        else:
            return jsonify({'error': 'Ollama API failed'}), 500

    except Exception as e:
        print(f"Error in chat: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Get study analytics"""
    try:
        data = load_data()
        sessions = data.get('study_sessions', [])
        
        # Calculate statistics
        total_sessions = len(sessions)
        total_minutes = sum(session.get('duration', 25) for session in sessions)
        
        # Topics studied frequency
        topic_frequency = {}
        for session in sessions:
            topics = session.get('topics', [])
            for topic in topics:
                topic_frequency[topic] = topic_frequency.get(topic, 0) + 1
        
        # Recent activity (last 7 days)
        recent_sessions = []
        for session in sessions[-7:]:
            recent_sessions.append({
                'date': session.get('date'),
                'duration': session.get('duration', 25),
                'topics': len(session.get('topics', []))
            })
        
        return jsonify({
            'total_sessions': total_sessions,
            'total_minutes': total_minutes,
            'topic_frequency': topic_frequency,
            'recent_activity': recent_sessions
        })
        
    except Exception as e:
        print(f"Error getting analytics: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/network-info', methods=['GET'])
def get_network_info():
    """Get local network IP address"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            # doesn't even have to be reachable
            s.connect(('10.255.255.255', 1))
            local_ip = s.getsockname()[0]
        except Exception:
            local_ip = '127.0.0.1'
        finally:
            s.close()
            
        return jsonify({'ip': local_ip, 'hostname': socket.gethostname()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🚀 StudyFlow Backend Server Starting...")
    print("📊 Server running on http://localhost:5000")
    print("🤖 Make sure Ollama is running on http://localhost:11434")
    print("\nAvailable endpoints:")
    print("  GET  /api/data - Fetch all data")
    print("  POST /api/data - Save data")
    print("  GET  /api/ollama/models - Get Ollama models")
    print("  POST /api/generate-checklist - Generate checklist with AI")
    print("  POST /api/upload-pdf - Upload and extract PDF")
    print("  POST /api/chat - RAG Chat")
    print("  GET  /api/analytics - Get study analytics")
    print("  GET  /api/network-info - Get network info")
    print("  GET  /health - Health check")
    
    app.run(debug=True, host='0.0.0.0', port=5000)