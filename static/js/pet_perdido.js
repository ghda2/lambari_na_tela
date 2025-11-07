document.addEventListener("DOMContentLoaded", () => {
    const chatMessages = document.getElementById("chat-messages");
    const inputContainer = document.getElementById("chat-input-container");
    const hiddenForm = document.getElementById("hidden-form");
    const progressFill = document.getElementById("progress-fill");

    // Constants for better maintainability
    const STORAGE_KEY = 'petFormProgress';
    const PHONE_REGEX = /^(\d{2})(\d{5})(\d{4})$/;
    const PHONE_FORMAT = '($1) $2-$3';
    
    // Debounced phone masking for better performance
    let phoneMaskTimeout = null;
    
    // Validations constants
    const VALIDATION_MESSAGES = {
        REQUIRED: "Este campo é obrigatório. Por favor, forneça uma resposta.",
        INVALID_PHONE: "Por favor, insira um número de telefone válido (ex: (11) 99999-9999 ou 11999999999).",
        NO_FILE: "Nenhum arquivo selecionado"
    };

    // Consolidated phone validation and masking
    function maskPhone(value) {
        try {
            value = value.replace(/\D/g, '');
            if (value.length === 11) {
                // Format as (XX) XXXXX-XXXX for 11 digits
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            } else if (value.length === 10) {
                // Format as (XX) XXXX-XXXX for 10 digits
                value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            }
            return value;
        } catch (error) {
            console.error('Error masking phone:', error);
            return value;
        }
    }

    function validatePhoneNumber(phoneNumber) {
        const digits = phoneNumber.replace(/\D/g, '');
        // Accept 10 digits (without 9th digit for older systems) or 11 digits (with 9th digit)
        // Also allow 9 digits if user enters only the 9-digit number (will add DDD later if needed)
        return digits.length === 10 || digits.length === 11;
    }

    // Debounced phone input handler
    function handlePhoneInput(e) {
        clearTimeout(phoneMaskTimeout);
        phoneMaskTimeout = setTimeout(() => {
            e.target.value = maskPhone(e.target.value);
        }, 100);
    }

    // Button/select options data
    const BUTTON_OPTIONS = {
        especie_raca: [
            { value: "Cachorro vira-lata", label: "🐕 Cachorro vira-lata" },
            { value: "Cachorro com raça definida", label: "🐕 Cachorro com raça definida" },
            { value: "Gato vira-lata", label: "🐱 Gato vira-lata" },
            { value: "Gato com raça definida", label: "🐱 Gato com raça definida" },
            { value: "Pássaro", label: "🦜 Pássaro" },
            { value: "Outro", label: "✏️ Outro" }
        ],
        sexo: [
            { value: "Macho", label: "♂️ Macho" },
            { value: "Fêmea", label: "♀️ Fêmea" }
        ],
        recompensa: [
            { value: "Sim", label: "💰 Sim, há recompensa" },
            { value: "Não", label: "❌ Não há recompensa" }
        ],
        acessorios: [
            { value: "Coleira", label: "🦮 Coleira" },
            { value: "Plaquinha com nome", label: "🏷️ Plaquinha com nome" },
            { value: "Roupa/roupinha", label: "👕 Roupa/roupinha" },
            { value: "Nenhum acessório", label: "🚫 Nenhum acessório" }
        ]
    };

    const questions = [
        { id: "comprovante", text: "Comprovante de pagamento (anexe o comprovante do Pix)", type: "file", accept: "image/*", multiple: true, required: true },
        { id: "nome_animal", text: "Nome do animal", type: "text", required: true },
        { id: "especie_raca", text: "Espécie e raça do seu pet", type: "button", required: true },
        { id: "sexo", text: "Sexo do animal", type: "button", required: true },
        { id: "idade", text: "Idade aproximada", type: "text", required: true },
        { id: "cor_caracteristicas", text: "Cor e características marcantes (manchas, tamanho, coleira, cicatriz, etc.)", type: "textarea", required: true },
        { id: "data_horario", text: "Data e horário do desaparecimento", type: "text", required: true },
        { id: "local_desaparecimento", text: "Local onde possivelmente tenha desaparecido (bairro, rua, ponto de referência)", type: "textarea", required: true },
        { id: "comportamento", text: "Comportamento do animal (assustado, dócil, não acostumado a sair, etc.)", type: "textarea", required: true },
        { id: "acessorios", text: "Se estava com coleira, plaquira ou roupa no momento", type: "button", required: true },
        { id: "nome_tutor", text: "Nome do tutor ou responsável pelo animal", type: "text", required: true },
        { id: "telefone_whatsapp", text: "Telefone ou WhatsApp para contato", type: "tel", required: true },
        { id: "recompensa", text: "Se há recompensa oferecida", type: "button", required: true },
        { id: "cidade", text: "Cidade", type: "text", required: true },
        { id: "fotos", text: "Anexar no botão abaixo de 1 a 3 fotos do animal", type: "file", accept: "image/*", multiple: true, required: true }
    ];

    let currentQuestionIndex = 0;
    let isEditing = false;

    // Enhanced progress update with requestAnimationFrame
    function updateProgress() {
        try {
            const progress = ((currentQuestionIndex) / questions.length) * 100;
            requestAnimationFrame(() => {
                progressFill.style.width = `${progress}%`;
            });
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    }

    // Enhanced typing indicator with accessibility
    function showTypingIndicator() {
        try {
            const typingDiv = document.createElement("div");
            typingDiv.classList.add("typing-indicator");
            typingDiv.setAttribute('aria-label', 'Digitando...');
            typingDiv.setAttribute('role', 'status');
            typingDiv.innerHTML = '<div class="typing-dot" aria-hidden="true"></div><div class="typing-dot" aria-hidden="true"></div><div class="typing-dot" aria-hidden="true"></div>';
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            return typingDiv;
        } catch (error) {
            console.error('Error showing typing indicator:', error);
        }
    }

    // Enhanced message display with accessibility
    function addMessage(text, sender) {
        try {
            const messageEl = document.createElement("div");
            messageEl.classList.add("chat-message", `${sender}-message`);
            messageEl.textContent = text;
            messageEl.setAttribute('role', 'article');
            messageEl.setAttribute('aria-label', `${sender === 'bot' ? 'Assistente' : 'Usuário'}: ${text.substring(0, 50)}...`);
            chatMessages.appendChild(messageEl);
            requestAnimationFrame(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            });
        } catch (error) {
            console.error('Error adding message:', error);
        }
    }

    // Enhanced error message with accessibility
    function addErrorMessage(text) {
        try {
            const messageEl = document.createElement("div");
            messageEl.classList.add("chat-message", "error-message");
            messageEl.textContent = text;
            messageEl.setAttribute('role', 'alert');
            messageEl.setAttribute('aria-live', 'assertive');
            chatMessages.appendChild(messageEl);
            requestAnimationFrame(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            });
        } catch (error) {
            console.error('Error adding error message:', error);
        }
    }

    // Save progress to localStorage
    function saveProgress() {
        try {
            const progressData = {
                currentQuestionIndex,
                answers: {}
            };
            
            questions.forEach(q => {
                const chatInput = document.getElementById(q.id);
                if (chatInput) {
                    if (q.type === 'file') {
                        // For file inputs, we can only save the file names, not the actual files
                        // The actual files won't persist in localStorage, so we'll have to re-select them
                        if (chatInput.files && chatInput.files.length > 0) {
                            progressData.answers[q.id] = Array.from(chatInput.files).map(f => f.name);
                        } else {
                            // Try to get any previously saved file names
                            const savedValue = localStorage.getItem(`file_${q.id}`);
                            if (savedValue) {
                                progressData.answers[q.id] = JSON.parse(savedValue);
                            } else {
                                progressData.answers[q.id] = [];
                            }
                        }
                    } else if (q.type === 'button') {
                        progressData.answers[q.id] = chatInput.value;
                    } else if (q.type !== 'file' && q.type !== 'button') {
                        progressData.answers[q.id] = chatInput.value;
                    }
                }
            });
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    // Load progress from localStorage
    function loadProgress() {
        try {
            const savedProgress = localStorage.getItem(STORAGE_KEY);
            if (savedProgress) {
                const progressData = JSON.parse(savedProgress);
                
                // Restore answers
                Object.keys(progressData.answers).forEach(questionId => {
                    const chatInput = document.getElementById(questionId);
                    const question = questions.find(q => q.id === questionId);
                    if (chatInput && question) {
                        if (question.type === 'file') {
                            // For file inputs, we can only restore the file names (for display purposes)
                            // The actual files need to be re-selected by the user
                            if (progressData.answers[questionId] && progressData.answers[questionId].length > 0) {
                                localStorage.setItem(`file_${questionId}`, JSON.stringify(progressData.answers[questionId]));
                                console.log(`Restored file names for ${questionId}:`, progressData.answers[questionId]);
                            }
                        } else {
                            chatInput.value = progressData.answers[questionId];
                        }
                    }
                });
                
                currentQuestionIndex = progressData.currentQuestionIndex || 0;
                return true;
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }
        return false;
    }

    // Clear progress after successful submission
    function clearProgress() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing progress:', error);
        }
    }

    function showQuestion() {
        try {
            if (currentQuestionIndex >= questions.length) {
                showSummary();
                return;
            }
            updateProgress();
            const question = questions[currentQuestionIndex];
            const typingIndicator = showTypingIndicator();
            setTimeout(() => {
                typingIndicator.remove();
                addMessage(question.text, "bot");
                renderInput(question);
            }, 800);
        } catch (error) {
            console.error('Error showing question:', error);
            addErrorMessage("Ocorreu um erro. Recarregue a página e tente novamente.");
        }
    }

    // Enhanced input rendering with accessibility
    function renderInput(question) {
        try {
            inputContainer.innerHTML = "";
            
            switch (question.type) {
                case "button":
                    renderButtonOptions(question);
                    break;
                case "text":
                case "textarea":
                case "tel":
                    renderTextInput(question);
                    break;
                case "file":
                    renderFileInput(question);
                    break;
            }
        } catch (error) {
            console.error('Error rendering input:', error);
            addErrorMessage("Ocorreu um erro ao renderizar o campo. Tente novamente.");
        }
    }

    // Render button options (radio buttons)
    function renderButtonOptions(question) {
        const options = BUTTON_OPTIONS[question.id];
        if (!options) {
            console.error(`No button options found for question: ${question.id}`);
            return;
        }

        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-options-container");
        buttonContainer.setAttribute('role', 'group');
        buttonContainer.setAttribute('aria-label', question.text);

        options.forEach((option, index) => {
            const buttonOption = document.createElement("button");
            buttonOption.type = "button";
            buttonOption.classList.add("button-option");
            buttonOption.textContent = option.label;
            buttonOption.setAttribute('data-value', option.value);
            buttonOption.setAttribute('aria-pressed', 'false');
            
            buttonOption.addEventListener("click", () => {
                // Deselect all buttons
                buttonContainer.querySelectorAll('.button-option').forEach(btn => {
                    btn.classList.remove('selected');
                    btn.setAttribute('aria-pressed', 'false');
                });
                
                // Select clicked button
                buttonOption.classList.add('selected');
                buttonOption.setAttribute('aria-pressed', 'true');
                
                // Store value in hidden input
                const hiddenInput = document.getElementById(question.id);
                hiddenInput.value = option.value;
                
                // Auto-advance after selection
                setTimeout(() => {
                    handleUserInput(null, option.label);
                }, 300);
            });

            buttonContainer.appendChild(buttonOption);
        });

        inputContainer.appendChild(buttonContainer);
    }

    // Render text inputs (text, textarea, tel)
    function renderTextInput(question) {
        const inputEl = question.type === "text" ? document.createElement("input") : 
                       question.type === "textarea" ? document.createElement("textarea") : document.createElement("input");
        
        if (question.type === "tel" || question.id === "telefone_whatsapp") {
            inputEl.type = "text";
            inputEl.inputMode = "numeric";
            inputEl.placeholder = "(11) 99999-9999";
        } else {
            inputEl.type = question.type;
            inputEl.placeholder = "Digite sua resposta...";
        }
        
        inputEl.id = "chat-input-field";
        inputEl.setAttribute('aria-label', question.text);
        inputEl.setAttribute('data-required', question.required);

        const sendBtn = document.createElement("button");
        sendBtn.id = "chat-send-btn";
        sendBtn.textContent = "Enviar";
        sendBtn.setAttribute('aria-label', `Enviar resposta para: ${question.text}`);

        inputContainer.appendChild(inputEl);
        inputContainer.appendChild(sendBtn);

        if (question.id === "telefone_whatsapp") {
            inputEl.addEventListener("input", handlePhoneInput);
        }
        
        sendBtn.addEventListener("click", () => handleUserInput());
        inputEl.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && (!e.shiftKey || question.type === "text")) {
                e.preventDefault();
                handleUserInput();
            }
        });
        
        // Keyboard navigation enhancement
        inputEl.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                inputEl.blur();
            }
        });
        
        inputEl.focus();
    }

    // Render file inputs
    function renderFileInput(question) {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.id = "chat-input-field";
        fileInput.accept = question.accept;
        fileInput.multiple = question.multiple || false;
        fileInput.setAttribute('aria-label', question.text);
        fileInput.setAttribute('data-required', question.required);

        const fileSendBtn = document.createElement("button");
        fileSendBtn.id = "chat-send-btn";
        fileSendBtn.textContent = "Enviar";
        fileSendBtn.setAttribute('aria-label', `Enviar arquivo para: ${question.text}`);

        inputContainer.appendChild(fileInput);
        inputContainer.appendChild(fileSendBtn);

        fileInput.addEventListener("change", (e) => {
            try {
                if (e.target.files.length > 0) {
                    const files = Array.from(e.target.files);
                    const displayText = files.map(f => f.name).join(', ');
                    handleUserInput(e.target.files, `📎 ${displayText}`);
                }
            } catch (error) {
                console.error('Error handling file selection:', error);
            }
        });

        fileSendBtn.addEventListener("click", () => handleUserInput());
    }

    // Enhanced user input handling with consolidated validation
    function handleUserInput(predefinedValue = null, displayText = null) {
        try {
            const question = questions[currentQuestionIndex];
            let value;
            let userMessageText;
            
            if (predefinedValue !== null) {
                value = predefinedValue;
                userMessageText = displayText || (Array.isArray(value) ? value.map(f => f.name).join(', ') : value.name || value);
            } else {
                const inputField = document.getElementById("chat-input-field");
                if (!inputField) {
                    console.error("Input field not found!");
                    return;
                }
                
                if (question.type === "file") {
                    value = inputField.files;
                    userMessageText = value.length > 0 ? ` ${Array.from(value).map(f => f.name).join(', ')}` : VALIDATION_MESSAGES.NO_FILE;
                } else if (question.type === "button") {
                    value = inputField.value;
                    userMessageText = value;
                } else {
                    value = inputField.value;
                    userMessageText = value;
                }
            }

            // Consolidated validation
            if (question.required && ((question.type === "file" && value.length === 0) || 
                (question.type !== "file" && question.type !== "button" && (!value || (typeof value === 'string' && value.trim() === ""))) ||
                (question.type === "button" && !value))) {
                addErrorMessage(VALIDATION_MESSAGES.REQUIRED);
                return;
            }

            // Consolidated phone validation
            if (question.id === "telefone_whatsapp" && typeof value === 'string') {
                if (!validatePhoneNumber(value)) {
                    addErrorMessage(VALIDATION_MESSAGES.INVALID_PHONE);
                    return;
                }
            }

            const hiddenInput = document.getElementById(question.id);
            if (question.type === "file" && value.length > 0) {
                // For file inputs, we can't directly set the files property, 
                // but we can store a reference to the files so they're available on form submission
                // The FileList is automatically maintained by the input element, so we don't need to do anything special here
            } else if (hiddenInput) {
                hiddenInput.value = value || "";
            }
            
            addMessage(userMessageText, "user");
            saveProgress(); // Save progress after successful input
            proceedToNext();
        } catch (error) {
            console.error('Error handling user input:', error);
            addErrorMessage("Ocorreu um erro ao processar sua resposta. Tente novamente.");
        }
    }

    function proceedToNext() {
        try {
            if (isEditing) {
                isEditing = false;
                currentQuestionIndex = questions.length;
                setTimeout(showSummary, 500);
            } else {
                currentQuestionIndex++;
                setTimeout(showQuestion, 500);
            }
        } catch (error) {
            console.error('Error proceeding to next question:', error);
        }
    }

    function editQuestion(indexToEdit) {
        try {
            isEditing = true;
            currentQuestionIndex = indexToEdit;
            inputContainer.innerHTML = "";
            
            // Remove summary messages and submit container
            const summaryMessages = document.querySelectorAll('.summary-message, .final-submit-container');
            summaryMessages.forEach(msg => msg.remove());
            
            // Remove the last bot message that shows the current question to be edited
            const botMessages = document.querySelectorAll('.bot-message');
            if (botMessages.length > 0) {
                // Find the bot message that corresponds to the question being edited
                const messagesArray = Array.from(botMessages);
                const messageToEdit = messagesArray.find(msg => msg.textContent.includes(questions[indexToEdit].text));
                if (messageToEdit) {
                    messageToEdit.remove();
                } else {
                    // If specific message not found, remove the last bot message as fallback
                    const lastBotMessage = messagesArray[messagesArray.length - 1];
                    if (lastBotMessage) lastBotMessage.remove();
                }
            }
            
            showQuestion();
        } catch (error) {
            console.error('Error editing question:', error);
            addErrorMessage("Ocorreu um erro ao editar. Tente novamente.");
        }
    }

    function showSummary() {
        try {
            updateProgress();
            progressFill.style.width = '100%';
            const typingIndicator = showTypingIndicator();
            setTimeout(() => {
                typingIndicator.remove();
                addMessage(" Informações recebidas! Vamos revisar:", "bot");
                inputContainer.innerHTML = "";
                const summaryContainer = document.createElement('div');
                summaryContainer.classList.add('chat-message', 'summary-message');
                summaryContainer.setAttribute('role', 'region');
                summaryContainer.setAttribute('aria-label', 'Resumo das informações');
                
                let summaryHtml = '<ul>';
                questions.forEach((q, index) => {
                    try {
                        const hiddenInput = document.getElementById(q.id);
                        let valueText = hiddenInput.value;
                        if (q.type === 'file') {
                            valueText = hiddenInput.files.length > 0 ? ` ${Array.from(hiddenInput.files).map(f => f.name).join(', ')}` : "Nenhum arquivo";
                        } else if (!valueText) {
                            valueText = "Não preenchido";
                        }
                        let questionText = q.text.replace(/[()]/g, "").trim();
                        summaryHtml += `<li><div><strong>${questionText.split('?')[0]}:</strong> ${valueText}</div><button type="button" class="edit-btn" data-index="${index}" aria-label="Editar ${questionText}"> Editar</button></li>`;
                    } catch (error) {
                        console.error(`Error processing question ${index}:`, error);
                    }
                });
                summaryHtml += '</ul>';
                summaryContainer.innerHTML = summaryHtml;
                chatMessages.appendChild(summaryContainer);
                
                summaryContainer.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        try {
                            const targetButton = e.target.closest('.edit-btn');
                            if (!targetButton) return;
                            const index = parseInt(targetButton.dataset.index);
                            editQuestion(index);
                        } catch (error) {
                            console.error('Error handling edit button:', error);
                        }
                    });
                });

                const submitContainer = document.createElement('div');
                submitContainer.classList.add('final-submit-container');
                const submitBtn = document.createElement("button");
                submitBtn.textContent = " Enviar Anúncio de Pet Perdido";
                submitBtn.style.width = "100%";
                submitBtn.setAttribute('aria-label', 'Enviar anúncio de pet perdido');
                
                submitContainer.appendChild(submitBtn);
                inputContainer.appendChild(submitContainer);
                
                submitBtn.addEventListener("click", () => {
                    try {
                        // Map the collected data to the backend form fields
                        // Map nome_animal to nome_pet
                        document.getElementById('nome_pet').value = document.getElementById('nome_animal').value;
                        
                        // Map especie_raca to tipo_pet
                        document.getElementById('tipo_pet').value = document.getElementById('especie_raca').value;
                        
                        // Map sexo to raca
                        document.getElementById('raca').value = document.getElementById('sexo').value;
                        
                        // Map idade to bairro (using idade field as bairro since it's asking for approximate age)
                        document.getElementById('bairro').value = document.getElementById('idade').value;
                        
                        // Combine multiple description fields into a single descricao field for backend
                        const descricaoFields = [
                            document.getElementById('cor_caracteristicas').value,
                            document.getElementById('local_desaparecimento').value,
                            document.getElementById('comportamento').value,
                            document.getElementById('acessorios').value,
                            document.getElementById('nome_tutor').value,
                            document.getElementById('recompensa').value,
                            document.getElementById('data_horario').value // Adding data/horario to description
                        ].filter(val => val && val.trim() !== '');
                        
                        // Set the combined description
                        document.getElementById('descricao').value = descricaoFields.join(' | ');
                        
                        // Map cidade (this field exists in both, so use directly)
                        document.getElementById('cidade').value = document.getElementById('cidade').value;
                        
                        // Map telefone_whatsapp to whatsapp
                        document.getElementById('whatsapp').value = document.getElementById('telefone_whatsapp').value;
                        
                        addMessage("Obrigado. Aguarde nossa análise e a publicação.", "bot");
                        hiddenForm.submit();
                        submitBtn.disabled = true;
                        submitBtn.textContent = " Enviando...";
                        clearProgress(); // Clear saved progress after submission
                    } catch (error) {
                        console.error('Error submitting form:', error);
                        addErrorMessage("Ocorreu um erro ao enviar. Tente novamente.");
                    }
                });
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 800);
        } catch (error) {
            console.error('Error showing summary:', error);
            addErrorMessage("Ocorreu um erro ao gerar o resumo. Tente novamente.");
        }
    }

    // Load saved progress on startup
    const hasProgress = loadProgress();
    
    // Auto-save progress periodically
    setInterval(saveProgress, 5000);
    
    // Save progress before page unload
    window.addEventListener('beforeunload', saveProgress);

    setTimeout(showQuestion, 500);
});