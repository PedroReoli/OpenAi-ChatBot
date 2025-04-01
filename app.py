from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import time
import json
import openai
from werkzeug.utils import secure_filename
import PyPDF2
import docx
import csv
import html2text
import re
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configurar diretórios
STATIC_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
DATA_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')

# Criar diretórios se não existirem
os.makedirs(STATIC_FOLDER, exist_ok=True)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(DATA_FOLDER, exist_ok=True)
os.makedirs(os.path.join(DATA_FOLDER, 'history'), exist_ok=True)
os.makedirs(os.path.join(DATA_FOLDER, 'training'), exist_ok=True)
os.makedirs(os.path.join(DATA_FOLDER, 'settings'), exist_ok=True)
os.makedirs(os.path.join(DATA_FOLDER, 'stats'), exist_ok=True)

# Inicializar Flask
app = Flask(__name__, static_folder=STATIC_FOLDER)
CORS(app)

# Configurar OpenAI API
openai.api_key = os.getenv("OPENAI_API_KEY")

# Configurações padrão
DEFAULT_SETTINGS = {
    'model': 'gpt-3.5-turbo',
    'temperature': 0.7,
    'maxTokens': 2048,
    'systemPrompt': 'Você é um assistente IA útil, respeitoso e honesto. Sempre responda da maneira mais útil possível, mantendo a segurança em mente.',
    'useContext': True,
    'useWebSearch': False
}

# Função para obter configurações do usuário
def get_user_settings(user_id):
    settings_file = os.path.join(DATA_FOLDER, 'settings', f'{user_id}.json')
    if os.path.exists(settings_file):
        with open(settings_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return DEFAULT_SETTINGS

# Função para salvar configurações do usuário
def save_user_settings(user_id, settings):
    settings_file = os.path.join(DATA_FOLDER, 'settings', f'{user_id}.json')
    with open(settings_file, 'w', encoding='utf-8') as f:
        json.dump(settings, f, ensure_ascii=False, indent=2)

# Função para obter histórico de conversa
def get_conversation_history(user_id):
    history_file = os.path.join(DATA_FOLDER, 'history', f'{user_id}.json')
    if os.path.exists(history_file):
        with open(history_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

# Função para salvar histórico de conversa
def save_conversation_history(user_id, history):
    history_file = os.path.join(DATA_FOLDER, 'history', f'{user_id}.json')
    with open(history_file, 'w', encoding='utf-8') as f:
        json.dump(history, f, ensure_ascii=False, indent=2)

# Função para obter dados de treinamento
def get_training_data(user_id):
    training_file = os.path.join(DATA_FOLDER, 'training', f'{user_id}.json')
    if os.path.exists(training_file):
        with open(training_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {'examples': [], 'files': []}

# Função para salvar dados de treinamento
def save_training_data(user_id, training_data):
    training_file = os.path.join(DATA_FOLDER, 'training', f'{user_id}.json')
    with open(training_file, 'w', encoding='utf-8') as f:
        json.dump(training_data, f, ensure_ascii=False, indent=2)

# Função para obter estatísticas de treinamento
def get_training_stats(user_id):
    stats_file = os.path.join(DATA_FOLDER, 'stats', f'{user_id}.json')
    if os.path.exists(stats_file):
        with open(stats_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {
        'examples': 0,
        'files': 0,
        'accuracy': None,
        'history': []
    }

# Função para atualizar estatísticas de treinamento
def update_training_stats(user_id, examples=0, files=0, status='success', type_name=''):
    stats = get_training_stats(user_id)
    
    # Atualizar contadores
    stats['examples'] += examples
    stats['files'] += files
    
    # Adicionar ao histórico
    if examples > 0 or files > 0:
        stats['history'].insert(0, {
            'type': type_name,
            'count': examples if examples > 0 else files,
            'status': status,
            'date': time.strftime('%d/%m/%Y %H:%M:%S')
        })
    
    # Limitar histórico a 20 itens
    stats['history'] = stats['history'][:20]
    
    # Salvar estatísticas
    stats_file = os.path.join(DATA_FOLDER, 'stats', f'{user_id}.json')
    with open(stats_file, 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    
    return stats

# Função para extrair texto de arquivos
def extract_text_from_file(file_path):
    file_extension = os.path.splitext(file_path)[1].lower()
    
    try:
        if file_extension == '.pdf':
            return extract_text_from_pdf(file_path)
        elif file_extension in ['.doc', '.docx']:
            return extract_text_from_docx(file_path)
        elif file_extension == '.txt':
            return extract_text_from_txt(file_path)
        elif file_extension in ['.html', '.htm']:
            return extract_text_from_html(file_path)
        elif file_extension == '.csv':
            return extract_text_from_csv(file_path)
        elif file_extension == '.json':
            return extract_text_from_json(file_path)
        else:
            return None
    except Exception as e:
        print(f"Erro ao extrair texto do arquivo {file_path}: {str(e)}")
        return None

def extract_text_from_pdf(file_path):
    text = ""
    with open(file_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page_num in range(len(pdf_reader.pages)):
            text += pdf_reader.pages[page_num].extract_text() + "\n"
    return text

def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

def extract_text_from_txt(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
        return file.read()

def extract_text_from_html(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
        html_content = file.read()
    converter = html2text.HTML2Text()
    converter.ignore_links = False
    return converter.handle(html_content)

def extract_text_from_csv(file_path):
    text = ""
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
        csv_reader = csv.reader(file)
        for row in csv_reader:
            text += ", ".join(row) + "\n"
    return text

def extract_text_from_json(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
        data = json.load(file)
    return json.dumps(data, ensure_ascii=False, indent=2)

# Função para processar texto extraído em chunks para treinamento
def process_text_for_training(text, chunk_size=1000):
    # Dividir o texto em parágrafos
    paragraphs = re.split(r'\n\s*\n', text)
    
    # Filtrar parágrafos vazios
    paragraphs = [p.strip() for p in paragraphs if p.strip()]
    
    # Combinar parágrafos em chunks
    chunks = []
    current_chunk = ""
    
    for paragraph in paragraphs:
        if len(current_chunk) + len(paragraph) <= chunk_size:
            current_chunk += paragraph + "\n\n"
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = paragraph + "\n\n"
    
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return chunks

# Função para gerar resposta do OpenAI
def generate_response(messages, settings):
    try:
        response = openai.ChatCompletion.create(
            model=settings['model'],
            messages=messages,
            temperature=settings['temperature'],
            max_tokens=settings['maxTokens']
        )
        return response.choices[0].message['content']
    except Exception as e:
        print(f"Erro ao gerar resposta: {str(e)}")
        return "Desculpe, ocorreu um erro ao processar sua solicitação."

# Rota para a página principal
@app.route('/')
def index():
    return send_from_directory(STATIC_FOLDER, 'index.html')

# Rota para a página de treinamento
@app.route('/training.html')
def training():
    return send_from_directory(STATIC_FOLDER, 'training.html')

# Rota para servir arquivos estáticos
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(STATIC_FOLDER, path)

# Rota para chat
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '')
    user_id = data.get('user_id', 'default_user')
    
    # Obter histórico e configurações
    history = get_conversation_history(user_id)
    settings = get_user_settings(user_id)
    
    # Adicionar mensagem do usuário ao histórico
    timestamp = int(time.time())
    history.append({
        'role': 'user',
        'content': message,
        'timestamp': timestamp
    })
    
    # Preparar mensagens para o OpenAI
    openai_messages = [
        {"role": "system", "content": settings['systemPrompt']}
    ]
    
    # Adicionar contexto se configurado
    if settings['useContext']:
        # Limitar a 10 mensagens anteriores para evitar tokens excessivos
        context_history = history[-20:]
        for msg in context_history:
            openai_messages.append({
                "role": msg['role'],
                "content": msg['content']
            })
    else:
        # Apenas a mensagem atual
        openai_messages.append({
            "role": "user",
            "content": message
        })
    
    # Obter dados de treinamento
    training_data = get_training_data(user_id)
    
    # Adicionar exemplos relevantes ao contexto
    if training_data['examples']:
        # Encontrar exemplos relevantes
        relevant_examples = []
        for example in training_data['examples']:
            if any(keyword in message.lower() for keyword in example['input'].lower().split()):
                relevant_examples.append(example)
        
        # Adicionar até 3 exemplos relevantes
        if relevant_examples:
            examples_context = "Aqui estão alguns exemplos de como você deve responder:\n\n"
            for i, example in enumerate(relevant_examples[:3]):
                examples_context += f"Pergunta: {example['input']}\nResposta: {example['output']}\n\n"
            
            openai_messages.append({
                "role": "system",
                "content": examples_context
            })
    
    # Gerar resposta
    bot_response = generate_response(openai_messages, settings)
    
    # Adicionar resposta ao histórico
    history.append({
        'role': 'assistant',
        'content': bot_response,
        'timestamp': int(time.time())
    })
    
    # Salvar histórico
    save_conversation_history(user_id, history)
    
    return jsonify({
        'message': bot_response,
        'history': history
    })

# Rota para obter histórico
@app.route('/api/history/<user_id>', methods=['GET'])
def get_history(user_id):
    history = get_conversation_history(user_id)
    return jsonify(history)

# Rota para treinamento com exemplos
@app.route('/api/train', methods=['POST'])
def train():
    data = request.json
    examples = data.get('examples', [])
    user_id = data.get('user_id', 'default_user')
    settings = data.get('settings', DEFAULT_SETTINGS)
    
    # Salvar configurações
    save_user_settings(user_id, settings)
    
    # Obter dados de treinamento existentes
    training_data = get_training_data(user_id)
    
    # Adicionar novos exemplos
    for example in examples:
        # Verificar se o exemplo já existe
        if not any(e['input'] == example['input'] for e in training_data['examples']):
            training_data['examples'].append(example)
    
    # Salvar dados de treinamento
    save_training_data(user_id, training_data)
    
    # Atualizar estatísticas
    update_training_stats(
        user_id, 
        examples=len(examples), 
        files=0, 
        status='success', 
        type_name='Exemplos de treinamento'
    )
    
    return jsonify({
        'success': True,
        'message': f'{len(examples)} exemplos adicionados com sucesso'
    })

# Rota para treinamento com arquivos
@app.route('/api/train/files', methods=['POST'])
def train_files():
    user_id = request.form.get('user_id', 'default_user')
    settings_json = request.form.get('settings', json.dumps(DEFAULT_SETTINGS))
    settings = json.loads(settings_json)
    
    # Salvar configurações
    save_user_settings(user_id, settings)
    
    # Verificar se há arquivos
    if 'files' not in request.files:
        return jsonify({
            'success': False,
            'message': 'Nenhum arquivo enviado'
        }), 400
    
    files = request.files.getlist('files')
    if not files or files[0].filename == '':
        return jsonify({
            'success': False,
            'message': 'Nenhum arquivo selecionado'
        }), 400
    
    # Obter dados de treinamento existentes
    training_data = get_training_data(user_id)
    
    # Criar diretório para arquivos do usuário
    user_upload_dir = os.path.join(UPLOAD_FOLDER, user_id)
    os.makedirs(user_upload_dir, exist_ok=True)
    
    processed_files = 0
    file_contents = []
    
    # Processar cada arquivo
    for file in files:
        filename = secure_filename(file.filename)
        file_path = os.path.join(user_upload_dir, filename)
        
        # Salvar arquivo
        file.save(file_path)
        
        # Extrair texto
        extracted_text = extract_text_from_file(file_path)
        if extracted_text:
            # Processar texto em chunks
            chunks = process_text_for_training(extracted_text)
            
            # Adicionar informações do arquivo
            file_info = {
                'filename': filename,
                'path': file_path,
                'chunks': len(chunks),
                'processed_at': time.strftime('%Y-%m-%d %H:%M:%S')
            }
            
            # Adicionar ao treinamento se não existir
            if not any(f['filename'] == filename for f in training_data['files']):
                training_data['files'].append(file_info)
                processed_files += 1
            
            # Adicionar conteúdo para processamento
            file_contents.extend(chunks)
    
    # Processar conteúdo extraído com OpenAI para gerar exemplos
    if file_contents:
        try:
            for chunk in file_contents:
                # Gerar perguntas baseadas no conteúdo
                prompt = f"""
                Com base no seguinte texto, gere 3 pares de perguntas e respostas que poderiam ser feitas sobre este conteúdo.
                Formato:
                Pergunta: [pergunta]
                Resposta: [resposta detalhada]
                
                Texto:
                {chunk}
                """
                
                response = openai.ChatCompletion.create(
                    model=settings['model'],
                    messages=[
                        {"role": "system", "content": "Você é um assistente especializado em criar exemplos de treinamento para chatbots."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=1000
                )
                
                # Extrair pares de perguntas e respostas
                qa_text = response.choices[0].message['content']
                qa_pairs = re.findall(r'Pergunta: (.*?)\nResposta: (.*?)(?=\n\nPergunta:|$)', qa_text, re.DOTALL)
                
                # Adicionar aos exemplos de treinamento
                for question, answer in qa_pairs:
                    example = {
                        'input': question.strip(),
                        'output': answer.strip()
                    }
                    
                    # Verificar se o exemplo já existe
                    if not any(e['input'] == example['input'] for e in training_data['examples']):
                        training_data['examples'].append(example)
        except Exception as e:
            print(f"Erro ao processar conteúdo com OpenAI: {str(e)}")
    
    # Salvar dados de treinamento
    save_training_data(user_id, training_data)
    
    # Atualizar estatísticas
    update_training_stats(
        user_id, 
        examples=0, 
        files=processed_files, 
        status='success', 
        type_name='Processamento de arquivos'
    )
    
    return jsonify({
        'success': True,
        'message': f'{processed_files} arquivos processados com sucesso',
        'examples_generated': len(training_data['examples'])
    })

# Rota para salvar configurações
@app.route('/api/settings', methods=['POST'])
def save_settings():
    data = request.json
    user_id = data.get('user_id', 'default_user')
    settings = data.get('settings', DEFAULT_SETTINGS)
    
    # Salvar configurações
    save_user_settings(user_id, settings)
    
    return jsonify({
        'success': True,
        'message': 'Configurações salvas com sucesso'
    })

# Rota para obter estatísticas
@app.route('/api/stats/<user_id>', methods=['GET'])
def get_stats(user_id):
    stats = get_training_stats(user_id)
    return jsonify(stats)

if __name__ == '__main__':
    print("Servidor iniciado em http://localhost:5000")
    app.run(debug=True)