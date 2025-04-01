from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from openai import OpenAI
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize OpenAI client
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

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
        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=messages
        )
        
        assistant_message = response.choices[0].message.content
        
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
    app.run(debug=True, port=5000)