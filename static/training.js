document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const addExampleButton = document.getElementById('add-example');
    const submitExamplesButton = document.getElementById('submit-examples');
    const exampleList = document.getElementById('example-list');
    const fileDropZone = document.getElementById('file-drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');
    const clearFilesButton = document.getElementById('clear-files');
    const processFilesButton = document.getElementById('process-files');
    const temperatureRange = document.getElementById('temperature');
    const temperatureValue = document.getElementById('temperature-value');
    const resetSettingsButton = document.getElementById('reset-settings');
    const saveSettingsButton = document.getElementById('save-settings');
    const helpButton = document.getElementById('help-button');
    const helpModal = document.getElementById('help-modal');
    const closeModalButton = document.getElementById('close-modal');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const userIdInput = document.getElementById('user-id');
    const setUserButton = document.getElementById('set-user');
    
    // Variables
    let currentUserId = localStorage.getItem('currentUserId') || 'default_user';
    let uploadedFiles = [];
    let trainingSettings = {
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 2048,
        systemPrompt: 'Você é um assistente IA útil, respeitoso e honesto. Sempre responda da maneira mais útil possível, mantendo a segurança em mente.',
        useContext: true,
        useWebSearch: false
    };
    
    // Initialize
    initializeUI();
    
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show selected tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabName}-tab`) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('expanded');
    });
    
    // Set user ID
    setUserButton.addEventListener('click', function() {
        const newUserId = userIdInput.value.trim();
        if (newUserId) {
            currentUserId = newUserId;
            localStorage.setItem('currentUserId', currentUserId);
            
            // Show toast notification
            showToast(`ID do usuário definido para: ${currentUserId}`, 'success');
        } else {
            showToast('Por favor, insira um ID de usuário válido', 'error');
        }
    });
    
    // Add example
    addExampleButton.addEventListener('click', () => {
        addExamplePair();
    });
    
    // Submit examples
    submitExamplesButton.addEventListener('click', () => {
        submitExamples();
    });
    
    // File drop zone events
    fileDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileDropZone.classList.add('drag-over');
    });
    
    fileDropZone.addEventListener('dragleave', () => {
        fileDropZone.classList.remove('drag-over');
    });
    
    fileDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        fileDropZone.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    });
    
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            handleFiles(fileInput.files);
        }
    });
    
    // Clear files
    clearFilesButton.addEventListener('click', () => {
        uploadedFiles = [];
        fileList.innerHTML = '';
        showToast('Todos os arquivos foram removidos', 'info');
    });
    
    // Process files
    processFilesButton.addEventListener('click', () => {
        if (uploadedFiles.length === 0) {
            showToast('Por favor, adicione pelo menos um arquivo', 'error');
            return;
        }
        
        processFiles();
    });
    
    // Temperature range
    temperatureRange.addEventListener('input', () => {
        temperatureValue.textContent = temperatureRange.value;
        trainingSettings.temperature = parseFloat(temperatureRange.value);
    });
    
    // Reset settings
    resetSettingsButton.addEventListener('click', () => {
        resetSettings();
        showToast('Configurações restauradas para os valores padrão', 'info');
    });
    
    // Save settings
    saveSettingsButton.addEventListener('click', () => {
        saveSettings();
        showToast('Configurações salvas com sucesso', 'success');
    });
    
    // Help modal
    helpButton.addEventListener('click', () => {
        helpModal.classList.add('show');
    });
    
    closeModalButton.addEventListener('click', () => {
        helpModal.classList.remove('show');
    });
    
    // Close modal when clicking outside
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.classList.remove('show');
        }
    });
    
    // Functions
    function initializeUI() {
        // Set user ID input value
        userIdInput.value = currentUserId;
        
        // Add initial example pair
        if (exampleList.children.length === 0) {
            addExamplePair();
        }
        
        // Set settings values
        document.getElementById('model-type').value = trainingSettings.model;
        temperatureRange.value = trainingSettings.temperature;
        temperatureValue.textContent = trainingSettings.temperature;
        document.getElementById('max-tokens').value = trainingSettings.maxTokens;
        document.getElementById('system-prompt').value = trainingSettings.systemPrompt;
        document.getElementById('use-context').checked = trainingSettings.useContext;
        document.getElementById('use-web-search').checked = trainingSettings.useWebSearch;
        
        // Load training stats
        loadTrainingStats();
    }
    
    function addExamplePair() {
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
            <button class="remove-example">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add event listener to remove button
        const removeButton = examplePair.querySelector('.remove-example');
        removeButton.addEventListener('click', () => {
            examplePair.remove();
        });
        
        exampleList.appendChild(examplePair);
    }
    
    function submitExamples() {
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
        
        // Show loading state
        submitExamplesButton.disabled = true;
        submitExamplesButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        
        fetch('http://localhost:5000/api/train', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                examples,
                user_id: currentUserId,
                settings: trainingSettings
            })
        })
        .then(response => response.json())
        .then(data => {
            showToast('Exemplos de treinamento enviados com sucesso!', 'success');
            
            // Update training stats
            updateTrainingStats(examples.length, 0);
            
            // Add to training history
            addTrainingHistoryItem('Exemplos de treinamento', examples.length, 'success');
            
            // Reset form
            submitExamplesButton.disabled = false;
            submitExamplesButton.innerHTML = '<i class="fas fa-upload"></i> Enviar Exemplos';
        })
        .catch(error => {
            console.error('Erro ao enviar exemplos de treinamento:', error);
            showToast('Erro ao enviar exemplos de treinamento', 'error');
            
            // Add to training history
            addTrainingHistoryItem('Exemplos de treinamento', examples.length, 'error');
            
            // Reset button
            submitExamplesButton.disabled = false;
            submitExamplesButton.innerHTML = '<i class="fas fa-upload"></i> Enviar Exemplos';
        });
    }
    
    function handleFiles(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Check file type
            const fileType = getFileType(file.name);
            if (!fileType) {
                showToast(`Tipo de arquivo não suportado: ${file.name}`, 'error');
                continue;
            }
            
            // Add to uploaded files
            uploadedFiles.push(file);
            
            // Add to UI
            addFileToUI(file, fileType);
        }
    }
    
    function getFileType(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        
        switch (extension) {
            case 'pdf':
                return 'pdf';
            case 'html':
            case 'htm':
                return 'html';
            case 'txt':
                return 'txt';
            case 'doc':
            case 'docx':
                return 'doc';
            case 'csv':
                return 'csv';
            case 'json':
                return 'json';
            default:
                return null;
        }
    }
    
    function addFileToUI(file, fileType) {
        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item');
        
        const fileSize = formatFileSize(file.size);
        
        fileItem.innerHTML = `
            <div class="file-icon ${fileType}">
                <i class="fas fa-${getFileIcon(fileType)}"></i>
            </div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-meta">${fileSize} • ${fileType.toUpperCase()}</div>
            </div>
            <button class="remove-file">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add event listener to remove button
        const removeButton = fileItem.querySelector('.remove-file');
        removeButton.addEventListener('click', () => {
            // Remove from uploaded files
            const index = uploadedFiles.findIndex(f => f.name === file.name);
            if (index !== -1) {
                uploadedFiles.splice(index, 1);
            }
            
            // Remove from UI
            fileItem.remove();
        });
        
        fileList.appendChild(fileItem);
    }
    
    function getFileIcon(fileType) {
        switch (fileType) {
            case 'pdf':
                return 'file-pdf';
            case 'html':
                return 'file-code';
            case 'txt':
                return 'file-alt';
            case 'doc':
                return 'file-word';
            case 'csv':
                return 'file-csv';
            case 'json':
                return 'file-code';
            default:
                return 'file';
        }
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function processFiles() {
        if (uploadedFiles.length === 0) {
            showToast('Por favor, adicione pelo menos um arquivo', 'error');
            return;
        }
        
        // Show loading state
        processFilesButton.disabled = true;
        processFilesButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
        
        // Create FormData
        const formData = new FormData();
        
        // Add files
        uploadedFiles.forEach(file => {
            formData.append('files', file);
        });
        
        // Add user ID
        formData.append('user_id', currentUserId);
        
        // Add settings
        formData.append('settings', JSON.stringify(trainingSettings));
        
        fetch('http://localhost:5000/api/train/files', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            showToast('Arquivos processados com sucesso!', 'success');
            
            // Update training stats
            updateTrainingStats(0, uploadedFiles.length);
            
            // Add to training history
            addTrainingHistoryItem('Processamento de arquivos', uploadedFiles.length, 'success');
            
            // Clear files
            uploadedFiles = [];
            fileList.innerHTML = '';
            
            // Reset button
            processFilesButton.disabled = false;
            processFilesButton.innerHTML = '<i class="fas fa-cogs"></i> Processar Arquivos';
        })
        .catch(error => {
            console.error('Erro ao processar arquivos:', error);
            showToast('Erro ao processar arquivos', 'error');
            
            // Add to training history
            addTrainingHistoryItem('Processamento de arquivos', uploadedFiles.length, 'error');
            
            // Reset button
            processFilesButton.disabled = false;
            processFilesButton.innerHTML = '<i class="fas fa-cogs"></i> Processar Arquivos';
        });
    }
    
    function resetSettings() {
        // Reset to default values
        trainingSettings = {
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
            maxTokens: 2048,
            systemPrompt: 'Você é um assistente IA útil, respeitoso e honesto. Sempre responda da maneira mais útil possível, mantendo a segurança em mente.',
            useContext: true,
            useWebSearch: false
        };
        
        // Update UI
        document.getElementById('model-type').value = trainingSettings.model;
        temperatureRange.value = trainingSettings.temperature;
        temperatureValue.textContent = trainingSettings.temperature;
        document.getElementById('max-tokens').value = trainingSettings.maxTokens;
        document.getElementById('system-prompt').value = trainingSettings.systemPrompt;
        document.getElementById('use-context').checked = trainingSettings.useContext;
        document.getElementById('use-web-search').checked = trainingSettings.useWebSearch;
    }
    
    function saveSettings() {
        // Get values from UI
        trainingSettings.model = document.getElementById('model-type').value;
        trainingSettings.temperature = parseFloat(temperatureRange.value);
        trainingSettings.maxTokens = parseInt(document.getElementById('max-tokens').value);
        trainingSettings.systemPrompt = document.getElementById('system-prompt').value;
        trainingSettings.useContext = document.getElementById('use-context').checked;
        trainingSettings.useWebSearch = document.getElementById('use-web-search').checked;
        
        // Save to localStorage
        localStorage.setItem('trainingSettings', JSON.stringify(trainingSettings));
        
        // Send to backend
        fetch('http://localhost:5000/api/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: currentUserId,
                settings: trainingSettings
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Configurações salvas:', data);
        })
        .catch(error => {
            console.error('Erro ao salvar configurações:', error);
        });
    }
    
    function loadTrainingStats() {
        fetch(`http://localhost:5000/api/stats/${currentUserId}`)
            .then(response => response.json())
            .then(data => {
                // Update stats
                document.getElementById('trained-examples').textContent = data.examples || 0;
                document.getElementById('processed-files').textContent = data.files || 0;
                document.getElementById('accuracy').textContent = data.accuracy ? `${data.accuracy}%` : '--';
                
                // Update history
                const historyContainer = document.getElementById('training-history');
                historyContainer.innerHTML = '';
                
                if (data.history && data.history.length > 0) {
                    data.history.forEach(item => {
                        addTrainingHistoryItem(item.type, item.count, item.status, item.date);
                    });
                } else {
                    historyContainer.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-icon"><i class="fas fa-history"></i></div>
                            <div class="empty-title">Sem histórico de treinamento</div>
                            <div class="empty-description">Treine seu assistente para ver o histórico aqui.</div>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Erro ao carregar estatísticas de treinamento:', error);
            });
    }
    
    function updateTrainingStats(examples, files) {
        const trainedExamples = document.getElementById('trained-examples');
        const processedFiles = document.getElementById('processed-files');
        
        trainedExamples.textContent = parseInt(trainedExamples.textContent) + examples;
        processedFiles.textContent = parseInt(processedFiles.textContent) + files;
    }
    
    function addTrainingHistoryItem(type, count, status, date = new Date()) {
        const historyContainer = document.getElementById('training-history');
        
        // Remove empty state if exists
        const emptyState = historyContainer.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
        
        const historyItem = document.createElement('div');
        historyItem.classList.add('history-item');
        
        const formattedDate = typeof date === 'string' ? date : formatDate(date);
        
        historyItem.innerHTML = `
            <div class="history-status ${status}"></div>
            <div class="history-details">
                <div class="history-title">${type} (${count} itens)</div>
                <div class="history-meta">${formattedDate} • ${status === 'success' ? 'Concluído' : status === 'error' ? 'Erro' : 'Pendente'}</div>
            </div>
        `;
        
        historyContainer.insertBefore(historyItem, historyContainer.firstChild);
    }
    
    function formatDate(date) {
        const options = { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        return new Date(date).toLocaleDateString('pt-BR', options);
    }
    
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
});
