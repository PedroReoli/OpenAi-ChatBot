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
    
    // Variables
    let currentUserId = 'default_user';
    let messageHistory = [];
    
    // Set user ID
    setUserButton.addEventListener('click', function() {
        const newUserId = userIdInput.value.trim();
        if (newUserId) {
            currentUserId = newUserId;
            alert(`User ID set to: ${currentUserId}`);
            loadHistory();
        } else {
            alert('Please enter a valid User ID');
        }
    });
    
    // Send message
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // Add user message to UI
        addMessageToUI('user', message);
        userInput.value = '';
        
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
            if (data.error) {
                console.error('Error:', data.error);
                addMessageToUI('bot', 'Sorry, there was an error processing your request.');
            } else {
                addMessageToUI('bot', data.message);
                messageHistory = data.history;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            addMessageToUI('bot', 'Sorry, there was an error connecting to the server.');
        });
    }
    
    // Add message to UI
    function addMessageToUI(role, content) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(role === 'user' ? 'user-message' : 'bot-message');
        messageElement.textContent = content;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Load history
    function loadHistory() {
        fetch(`http://localhost:5000/api/history/${currentUserId}`)
            .then(response => response.json())
            .then(data => {
                messageHistory = data;
                
                // Clear chat
                chatMessages.innerHTML = '';
                
                // Add messages to UI
                data.forEach(msg => {
                    addMessageToUI(msg.role, msg.content);
                });
                
                // Update history list
                updateHistoryList();
            })
            .catch(error => {
                console.error('Error loading history:', error);
            });
    }
    
    // Update history list
    function updateHistoryList() {
        historyList.innerHTML = '';
        
        // Group messages by date
        const messagesByDate = {};
        messageHistory.forEach(msg => {
            const date = new Date(msg.timestamp * 1000).toLocaleDateString();
            if (!messagesByDate[date]) {
                messagesByDate[date] = [];
            }
            messagesByDate[date].push(msg);
        });
        
        // Create history items
        for (const date in messagesByDate) {
            const dateHeader = document.createElement('h4');
            dateHeader.textContent = date;
            historyList.appendChild(dateHeader);
            
            messagesByDate[date].forEach(msg => {
                const historyItem = document.createElement('div');
                historyItem.classList.add('history-item');
                historyItem.textContent = `${msg.role}: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`;
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
            <textarea class="example-input" placeholder="Example input..."></textarea>
            <textarea class="example-output" placeholder="Expected output..."></textarea>
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
            alert('Please add at least one valid training example');
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
            alert('Training data submitted successfully!');
            showView('chat');
        })
        .catch(error => {
            console.error('Error submitting training data:', error);
            alert('Error submitting training data');
        });
    }
    
    // Show view
    function showView(view) {
        chatContainer.classList.add('hidden');
        historyContainer.classList.add('hidden');
        trainingContainer.classList.add('hidden');
        
        if (view === 'chat') {
            chatContainer.classList.remove('hidden');
        } else if (view === 'history') {
            historyContainer.classList.remove('hidden');
            updateHistoryList();
        } else if (view === 'training') {
            trainingContainer.classList.remove('hidden');
        }
    }
    
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