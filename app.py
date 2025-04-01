from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
import time
from dotenv import load_dotenv
import openai  # Using older OpenAI package

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__, static_folder='.')
CORS(app)  # Enable CORS for all routes

# Set OpenAI API key
openai.api_key = os.environ.get("OPENAI_API_KEY")
if not openai.api_key:
    raise ValueError("No OpenAI API key found. Please check your .env file.")

# File to store conversation history
HISTORY_FILE = "conversation_history.json"

def load_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, 'r') as f:
            return json.load(f)
    return []

def save_history(history):
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=2)

# Serve the main HTML file
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Serve static files (CSS, JS)
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    user_id = data.get('user_id', 'default_user')
    
    # Load conversation history
    history = load_history()
    
    # Find or create user history
    user_history = next((h for h in history if h['user_id'] == user_id), None)
    if not user_history:
        user_history = {'user_id': user_id, 'messages': []}
        history.append(user_history)
    
    # Add user message to history
    user_history['messages'].append({
        'role': 'user',
        'content': user_message,
        'timestamp': time.time()
    })
    
    # Prepare messages for OpenAI
    messages = [
        {"role": "system", "content": "You are a helpful assistant that remembers previous conversations."}
    ]
    
    # Add conversation history (limited to last 10 messages to avoid token limits)
    for msg in user_history['messages'][-10:]:
        messages.append({"role": msg['role'], "content": msg['content']})
    
    # Get response from OpenAI
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # Using gpt-3.5-turbo as it's more widely available
            messages=messages
        )
        
        assistant_message = response.choices[0].message['content']
        
        # Add assistant response to history
        user_history['messages'].append({
            'role': 'assistant',
            'content': assistant_message,
            'timestamp': time.time()
        })
        
        # Save updated history
        save_history(history)
        
        return jsonify({
            'message': assistant_message,
            'history': user_history['messages']
        })
    
    except Exception as e:
        print(f"Error in chat completion: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/history/<user_id>', methods=['GET'])
def get_history(user_id):
    history = load_history()
    user_history = next((h for h in history if h['user_id'] == user_id), None)
    
    if user_history:
        return jsonify(user_history['messages'])
    return jsonify([])

@app.route('/api/train', methods=['POST'])
def train_model():
    data = request.json
    examples = data.get('examples', [])
    
    # In a real implementation, you would use this data to fine-tune your model
    # For this example, we'll just store the training examples
    if os.path.exists('training_data.json'):
        with open('training_data.json', 'r') as f:
            training_data = json.load(f)
    else:
        training_data = []
    
    training_data.extend(examples)
    
    with open('training_data.json', 'w') as f:
        json.dump(training_data, f, indent=2)
    
    return jsonify({'status': 'success', 'message': 'Training data saved'})

if __name__ == '__main__':
    print("Server running at http://localhost:5000/")
    app.run(debug=True, port=5000)