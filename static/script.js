document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const newChatButton = document.getElementById('new-chat');
    const viewHistoryButton = document.getElementById('view-history');
    const trainModelButton = document.getElementById('train-model');
    const chatContainer = document.getElementById('chat-container');
    const historyContainer = document.getElementById('history-container');
    const trainingContainer = document.getElementById('training-container');
    const historyList = document.getElementById('history-list');
    const backToChatButton = document.getElementById('back-to-chat');
    const backFromTrainingButton = document.getElementById('back-from-training');
    const addExampleButton = document.getElementById('add-example');
    const submitTrainingButton = document.getElementById('submit-training');
    const userIdInput = document.getElementById('user-id');
    const setUserButton = document.getElementById('set-user');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const menuButtons = document.querySelectorAll('.menu-button');
    
    // Variables
    let currentUserId = 'default_user';
    let messageHistory = [];
    
    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('expanded');
    });
    
    // Menu button active state
    menuButtons.forEach(button => {
        button.addEventListener('click', function() {
            menuButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Close mobile menu after selection
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('expanded');
            }
        });
    });
    
    // Set user ID
    setUserButton.addEventListener('click', function() {
        const newUserId = userIdInput.value.trim();
        if (newUserId) {
            currentUserId = newUserId;
            
            // Show toast notification
            showToast(`ID do usuário definido para: ${currentUserId}`, 'success');
            
            loadHistory();
        } else {
            showToast('Por favor, insira um ID de usuário válido', 'error');
        }
    });
    
    // Toast notification
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            </div>
            <div class="toast-message">${message}</div>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    // Send message
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // Add user message to UI
        addMessageToUI('user', message);
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Send to backend
        fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                user_id: currentUserId
            })
        })
        .then(response => response.json())
        .then(data => {
            // Remove typing indicator
            removeTypingIndicator();
            
            if (data.error) {
                console.error('Erro:', data.error);
                showToast('Erro ao processar sua solicitação', 'error');
                addMessageToUI('bot', 'Desculpe, ocorreu um erro ao processar sua solicitação.');
            } else {
                addMessageToUI('bot', data.message);
                messageHistory = data.history;
            }
        })
        .catch(error => {
            // Remove typing indicator
            removeTypingIndicator();
            
            console.error('Erro:', error);
            showToast('Erro ao conectar ao servidor', 'error');
            addMessageToUI('bot', 'Desculpe, ocorreu um erro ao conectar ao servidor.');
        });
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        const typingWrapper = document.createElement('div');
        typingWrapper.classList.add('message-wrapper', 'bot-wrapper', 'typing-wrapper');
        
        const typingAvatar = document.createElement('div');
        typingAvatar.classList.add('message-avatar');
        typingAvatar.innerHTML = '<i class="fas fa-robot"></i>';
        
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('typing-indicator');
        typingIndicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        
        typingWrapper.appendChild(typingAvatar);
        typingWrapper.appendChild(typingIndicator);
        
        chatMessages.appendChild(typingWrapper);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Remove typing indicator
    function removeTypingIndicator() {
        const typingWrapper = document.querySelector('.typing-wrapper');
        if (typingWrapper) {
            typingWrapper.remove();
        }
    }
    
    // Add message to UI
    function addMessageToUI(role, content) {
        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message-wrapper');
        messageWrapper.classList.add(role === 'user' ? 'user-wrapper' : 'bot-wrapper');
        
        const avatarElement = document.createElement('div');
        avatarElement.classList.add('message-avatar');
        avatarElement.innerHTML = role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(role === 'user' ? 'user-message' : 'bot-message');
        
        const senderElement = document.createElement('div');
        senderElement.classList.add('message-sender');
        senderElement.textContent = role === 'user' ? 'Você' : 'Assistente IA';
        
        const textElement = document.createElement('div');
        textElement.classList.add('message-text');
        textElement.textContent = content;
        
        const timeElement = document.createElement('div');
        timeElement.classList.add('message-time');
        timeElement.textContent = formatTime(new Date());
        
        messageElement.appendChild(senderElement);
        messageElement.appendChild(textElement);
        messageElement.appendChild(timeElement);
        
        messageWrapper.appendChild(avatarElement);
        messageWrapper.appendChild(messageElement);
        
        chatMessages.appendChild(messageWrapper);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Format time
    function formatTime(date) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const formattedHours = hours < 10 ? '0' + hours : hours;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        
        return `${formattedHours}:${formattedMinutes}`;
    }
    
    // Load history
    function loadHistory() {
        fetch(`http://localhost:5000/api/history/${currentUserId}`)
            .then(response => response.json())
            .then(data => {
                messageHistory = data;
                
                // Clear chat
                chatMessages.innerHTML = '';
                
                // Add welcome message if no history
                if (data.length === 0) {
                    const welcomeWrapper = document.createElement('div');
                    welcomeWrapper.classList.add('message-wrapper', 'bot-wrapper');
                    
                    const avatarElement = document.createElement('div');
                    avatarElement.classList.add('message-avatar');
                    avatarElement.innerHTML = '<i class="fas fa-robot"></i>';
                    
                    const welcomeMessage = document.createElement('div');
                    welcomeMessage.classList.add('message', 'bot-message');
                    
                    const senderElement = document.createElement('div');
                    senderElement.classList.add('message-sender');
                    senderElement.textContent = 'Assistente IA';
                    
                    const textElement = document.createElement('div');
                    textElement.classList.add('message-text');
                    textElement.textContent = 'Olá! Como posso ajudar você hoje?';
                    
                    const timeElement = document.createElement('div');
                    timeElement.classList.add('message-time');
                    timeElement.textContent = 'Agora';
                    
                    welcomeMessage.appendChild(senderElement);
                    welcomeMessage.appendChild(textElement);
                    welcomeMessage.appendChild(timeElement);
                    
                    welcomeWrapper.appendChild(avatarElement);
                    welcomeWrapper.appendChild(welcomeMessage);
                    
                    chatMessages.appendChild(welcomeWrapper);
                } else {
                    // Add messages to UI
                    data.forEach(msg => {
                        const messageWrapper = document.createElement('div');
                        messageWrapper.classList.add('message-wrapper');
                        messageWrapper.classList.add(msg.role === 'user' ? 'user-wrapper' : 'bot-wrapper');
                        
                        const avatarElement = document.createElement('div');
                        avatarElement.classList.add('message-avatar');
                        avatarElement.innerHTML = msg.role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
                        
                        const messageElement = document.createElement('div');
                        messageElement.classList.add('message');
                        messageElement.classList.add(msg.role === 'user' ? 'user-message' : 'bot-message');
                        
                        const senderElement = document.createElement('div');
                        senderElement.classList.add('message-sender');
                        senderElement.textContent = msg.role === 'user' ? 'Você' : 'Assistente IA';
                        
                        const textElement = document.createElement('div');
                        textElement.classList.add('message-text');
                        textElement.textContent = msg.content;
                        
                        const timeElement = document.createElement('div');
                        timeElement.classList.add('message-time');
                        timeElement.textContent = formatTime(new Date(msg.timestamp * 1000));
                        
                        messageElement.appendChild(senderElement);
                        messageElement.appendChild(textElement);
                        messageElement.appendChild(timeElement);
                        
                        messageWrapper.appendChild(avatarElement);
                        messageWrapper.appendChild(messageElement);
                        
                        chatMessages.appendChild(messageWrapper);
                    });
                }
                
                // Scroll to bottom
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
                // Update history list
                updateHistoryList();
            })
            .catch(error => {
                console.error('Erro ao carregar histórico:', error);
                showToast('Erro ao carregar histórico de conversas', 'error');
            });
    }
    
    // Update history list
    function updateHistoryList() {
        historyList.innerHTML = '';
        
        if (messageHistory.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.classList.add('empty-state');
            emptyState.innerHTML = `
                <div class="empty-icon"><i class="fas fa-history"></i></div>
                <div class="empty-title">Sem histórico de conversas</div>
                <div class="empty-description">Inicie uma nova conversa para ver seu histórico aqui.</div>
            `;
            historyList.appendChild(emptyState);
            return;
        }
        
        // Group messages by date
        const messagesByDate = {};
        messageHistory.forEach(msg => {
            const date = new Date(msg.timestamp * 1000).toLocaleDateString('pt-BR');
            if (!messagesByDate[date]) {
                messagesByDate[date] = [];
            }
            messagesByDate[date].push(msg);
        });
        
        // Create history items
        for (const date in messagesByDate) {
            const dateHeader = document.createElement('div');
            dateHeader.classList.add('history-date');
            dateHeader.textContent = date;
            historyList.appendChild(dateHeader);
            
            messagesByDate[date].forEach(msg => {
                const historyItem = document.createElement('div');
                historyItem.classList.add('history-item');
                
                const roleElement = document.createElement('div');
                roleElement.classList.add('history-item-role');
                roleElement.textContent = msg.role === 'user' ? 'Você' : 'Assistente IA';
                
                const contentElement = document.createElement('div');
                contentElement.classList.add('history-item-content');
                contentElement.textContent = msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : '');
                
                historyItem.appendChild(roleElement);
                historyItem.appendChild(contentElement);
                
                historyItem.addEventListener('click', () => {
                    // Show full message in chat
                    showView('chat');
                    addMessageToUI(msg.role, msg.content);
                });
                
                historyList.appendChild(historyItem);
            });
        }
    }
    
    // Add training example
    function addTrainingExample() {
        const trainingExamples = document.querySelector('.training-example');
        const examplePair = document.createElement('div');
        examplePair.classList.add('example-pair');
        
        examplePair.innerHTML = `
            <div class="example-container">
                <label>Entrada do Usuário</label>
                <textarea class="example-input" placeholder="Exemplo: Como está o tempo hoje?"></textarea>
            </div>
            <div class="example-container">
                <label>Resposta Esperada</label>
                <textarea class="example-output" placeholder="Exemplo: Não tenho acesso a dados em tempo real..."></textarea>
            </div>
        `;
        
        trainingExamples.appendChild(examplePair);
    }
    
    // Submit training data
    function submitTrainingData() {
        const examplePairs = document.querySelectorAll('.example-pair');
        const examples = [];
        
        examplePairs.forEach(pair => {
            const input = pair.querySelector('.example-input').value.trim();
            const output = pair.querySelector('.example-output').value.trim();
            
            if (input && output) {
                examples.push({ input, output });
            }
        });
        
        if (examples.length === 0) {
            showToast('Por favor, adicione pelo menos um exemplo válido de treinamento', 'error');
            return;
        }
        
        fetch('http://localhost:5000/api/train', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ examples })
        })
        .then(response => response.json())
        .then(data => {
            showToast('Dados de treinamento enviados com sucesso!', 'success');
            showView('chat');
        })
        .catch(error => {
            console.error('Erro ao enviar dados de treinamento:', error);
            showToast('Erro ao enviar dados de treinamento', 'error');
        });
    }
    
    // Show view
    function showView(view) {
        chatContainer.classList.add('hidden');
        historyContainer.classList.add('hidden');
        trainingContainer.classList.add('hidden');
        
        if (view === 'chat') {
            chatContainer.classList.remove('hidden');
            newChatButton.classList.add('active');
            viewHistoryButton.classList.remove('active');
            trainModelButton.classList.remove('active');
        } else if (view === 'history') {
            historyContainer.classList.remove('hidden');
            newChatButton.classList.remove('active');
            viewHistoryButton.classList.add('active');
            trainModelButton.classList.remove('active');
            updateHistoryList();
        } else if (view === 'training') {
            trainingContainer.classList.remove('hidden');
            newChatButton.classList.remove('active');
            viewHistoryButton.classList.remove('active');
            trainModelButton.classList.add('active');
        }
    }
    
    // Auto-resize textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    newChatButton.addEventListener('click', function() {
        chatMessages.innerHTML = '';
        
        // Add welcome message
        const welcomeWrapper = document.createElement('div');
        welcomeWrapper.classList.add('message-wrapper', 'bot-wrapper');
        
        const avatarElement = document.createElement('div');
        avatarElement.classList.add('message-avatar');
        avatarElement.innerHTML = '<i class="fas fa-robot"></i>';
        
        const welcomeMessage = document.createElement('div');
        welcomeMessage.classList.add('message', 'bot-message');
        
        const senderElement = document.createElement('div');
        senderElement.classList.add('message-sender');
        senderElement.textContent = 'Assistente IA';
        
        const textElement = document.createElement('div');
        textElement.classList.add('message-text');
        textElement.textContent = 'Olá! Como posso ajudar você hoje?';
        
        const timeElement = document.createElement('div');
        timeElement.classList.add('message-time');
        timeElement.textContent = 'Agora';
        
        welcomeMessage.appendChild(senderElement);
        welcomeMessage.appendChild(textElement);
        welcomeMessage.appendChild(timeElement);
        
        welcomeWrapper.appendChild(avatarElement);
        welcomeWrapper.appendChild(welcomeMessage);
        
        chatMessages.appendChild(welcomeWrapper);
        
        showView('chat');
    });
    
    viewHistoryButton.addEventListener('click', function() {
        showView('history');
    });
    
    trainModelButton.addEventListener('click', function() {
        showView('training');
    });
    
    backToChatButton.addEventListener('click', function() {
        showView('chat');
    });
    
    backFromTrainingButton.addEventListener('click', function() {
        showView('chat');
    });
    
    addExampleButton.addEventListener('click', addTrainingExample);
    submitTrainingButton.addEventListener('click', submitTrainingData);
    
    // Initialize
    loadHistory();
});