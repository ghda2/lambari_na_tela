/**
 * Módulo de Formulário de Chat Interativo
 * * Este script gerencia um formulário de chat interativo com controle de estado.
 * * Estrutura HTML esperada:
 * - <div id="chat-messages"></div>
 * - <div id="chat-input-container"></div>
 * - <form id="hidden-form"></form>
 * - <div id="progress-fill"></div>
 * * Dependências:
 * - utils.js (para maskPhone e validatePhoneNumber)
 */

function initializeChatForm({ questions, options = {}, validationMessages = {}, summaryConfig = {}, submissionConfig = {} }) {
    const chatMessages = document.getElementById("chat-messages");
    const inputContainer = document.getElementById("chat-input-container");
    const hiddenForm = document.getElementById("hidden-form");
    const progressFill = document.getElementById("progress-fill");

    if (!chatMessages || !inputContainer || !hiddenForm || !progressFill) {
        console.error("Elementos essenciais do chat não encontrados no DOM.");
        return;
    }

    const STORAGE_KEY = options.storageKey || 'chatFormProgress';
    const MESSAGES = {
        REQUIRED: validationMessages.required || "Este campo é obrigatório.",
        INVALID_PHONE: validationMessages.invalidPhone || "Por favor, insira um número de telefone válido.",
        NO_FILE: validationMessages.noFile || "Nenhum arquivo selecionado.",
        SUMMARY_TITLE: summaryConfig.title || "✅ Perfeito! Aqui está um resumo:",
        SUBMIT_BUTTON_TEXT: submissionConfig.buttonText || "🚀 Enviar",
        SUBMITTING_TEXT: submissionConfig.submittingText || "⏳ Enviando...",
        SUBMIT_SUCCESS_TEXT: submissionConfig.successText || "📤 Enviando..."
    };

    // Variáveis de estado
    let state = {
        currentQuestionIndex: 0,
        isEditing: false,
        // Renomeada para 'isLocked' para indicar que a interface está travada/bloqueada
        isLocked: false,
        submissionToken: null,
    };

    // Gera um token de idempotência (usa crypto se disponível, fallback simples)
    function generateIdempotencyToken() {
        if (window.crypto && window.crypto.getRandomValues) {
            const arr = new Uint32Array(4);
            window.crypto.getRandomValues(arr);
            return Array.from(arr).map(n => n.toString(16)).join('-');
        }
        return 'tok-' + Date.now() + '-' + Math.random().toString(16).slice(2);
    }

    // Marca submissão concluída e impede nova tentativa (client-side)
    function flagFormSubmitted(form, token) {
        form.dataset.submitting = 'true';
        form.dataset.submittedAt = Date.now();
        if (token) form.dataset.token = token;
        // Persistência mínima na sessão para evitar clique repetido após histórico voltar
        try {
            sessionStorage.setItem('form:submitted:' + (form.action || 'noaction'), token || 'true');
        } catch (e) {
            // Silencia erros de storage (modo privado, etc.)
        }
    }

    // Listener genérico para prevenir duplas submissões disparadas por scripts externos
    hiddenForm.addEventListener('submit', (e) => {
        if (hiddenForm.dataset.submitting === 'true') {
            // Já submetido; bloqueia nova submissão
            e.preventDefault();
        }
    });

    /**
     * Gerencia o estado de habilitação/desabilitação dos elementos de input.
     * @param {boolean} disable - Se deve desabilitar (true) ou habilitar (false).
     */
    function toggleInputLock(disable) {
        state.isLocked = disable;
        const inputField = document.getElementById("chat-input-field");
        const sendBtn = document.getElementById("chat-send-btn");
        const skipBtn = document.getElementById("chat-skip-btn");
        const optionButtons = inputContainer.querySelectorAll('.option-buttons button');

        if (inputField) inputField.disabled = disable;
        if (sendBtn) sendBtn.disabled = disable;
        if (skipBtn) skipBtn.disabled = disable;
        
        optionButtons.forEach(btn => btn.disabled = disable);

        if (!disable && inputField) {
             inputField.focus();
        }
    }


    function updateProgress() {
        const progress = ((state.currentQuestionIndex) / questions.length) * 100;
        requestAnimationFrame(() => {
            progressFill.style.width = `${progress}%`;
        });
    }

    // Funções showTypingIndicator, addMessage e addErrorMessage (sem alterações na lógica)

    function showTypingIndicator() {
        const typingDiv = document.createElement("div");
        typingDiv.classList.add("typing-indicator");
        typingDiv.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return typingDiv;
    }

    function addMessage(text, sender) {
        const messageEl = document.createElement("div");
        messageEl.classList.add("chat-message", `${sender}-message`);
        // O texto aqui já foi processado/validado
        messageEl.innerHTML = text.replace(/\n/g, '<br>'); // Permite quebras de linha
        chatMessages.appendChild(messageEl);
        requestAnimationFrame(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }

    function addErrorMessage(text) {
        const messageEl = document.createElement("div");
        messageEl.classList.add("chat-message", "error-message");
        messageEl.textContent = text;
        messageEl.setAttribute('role', 'alert');
        chatMessages.appendChild(messageEl);
        requestAnimationFrame(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }

    function showQuestion() {
        if (state.currentQuestionIndex >= questions.length) {
            showSummary();
            return;
        }
        updateProgress();
        const question = questions[state.currentQuestionIndex];
        const typingIndicator = showTypingIndicator();
        
        // Habilitar inputs ao mostrar a nova pergunta
        toggleInputLock(false); 

        setTimeout(() => {
            typingIndicator.remove();
            addMessage(question.text, "bot");
            renderInput(question);
            // Garante que, mesmo após o setTimeout, o input está focado (importante para acessibilidade)
            const inputField = document.getElementById("chat-input-field");
            if (inputField) inputField.focus();
        }, 800);
    }

    // Funções renderInput, renderTextInput, renderFileInput, renderButtonOptions (pequenos ajustes de foco e lock)

    function renderInput(question) {
        inputContainer.innerHTML = "";
        switch (question.type) {
            case "text":
            case "textarea":
            case "tel":
                renderTextInput(question);
                break;
            case "file":
                renderFileInput(question);
                break;
            case "select":
            case "button":
                renderButtonOptions(question);
                break;
        }
    }

    function renderTextInput(question) {
        const inputEl = question.type === 'textarea' ? document.createElement("textarea") : document.createElement("input");
        inputEl.type = question.type === 'tel' ? 'text' : question.type;
        inputEl.id = "chat-input-field";
        inputEl.placeholder = question.placeholder || "Digite sua resposta...";
        // Definido como desabilitado no estado inicial (por segurança), mas showQuestion irá habilitar.
        if (state.isLocked) inputEl.disabled = true; 

        if (question.type === 'tel') {
            inputEl.inputMode = "tel";
        }

        const sendBtn = document.createElement("button");
        sendBtn.id = "chat-send-btn";
        sendBtn.textContent = "Enviar";
        if (state.isLocked) sendBtn.disabled = true;

        inputContainer.appendChild(inputEl);
        inputContainer.appendChild(sendBtn);

        if (question.type === 'tel') {
            // Verifica a existência de maskPhone globalmente
            if (typeof maskPhone === 'function') {
                inputEl.addEventListener("input", (e) => e.target.value = maskPhone(e.target.value));
            } else {
                console.warn("A função maskPhone não está definida. A máscara de telefone não será aplicada.");
            }
        }

        sendBtn.addEventListener("click", () => handleUserInput());
        inputEl.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleUserInput();
            }
        });
        inputEl.focus();
    }

    function renderFileInput(question) {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.id = "chat-input-field";
        fileInput.accept = question.accept || "*/*";
        fileInput.multiple = question.multiple || false;
        if (state.isLocked) fileInput.disabled = true; 

        const skipBtn = document.createElement("button");
        skipBtn.id = "chat-skip-btn";
        skipBtn.textContent = "Pular";
        if (state.isLocked) skipBtn.disabled = true;

        inputContainer.appendChild(fileInput);
        if (!question.required) {
            inputContainer.appendChild(skipBtn);
            // CORREÇÃO: Passa um objeto para forçar o tratamento de "Pular" e não ler o DOM.
            skipBtn.addEventListener("click", () => handleUserInput({ isSkip: true }, "⏭️ Pulei esta etapa"));
        }

        fileInput.addEventListener("change", (e) => {
            // Este evento é o único que aciona o handleUserInput sem um botão/enter
            if (state.isLocked) {
                e.preventDefault();
                return;
            }
            
            const maxFiles = question.maxFiles || Infinity;
            if (e.target.files.length > maxFiles) {
                addErrorMessage(`Máximo de ${maxFiles} arquivos permitidos.`);
                fileInput.value = '';
                return;
            }
            if (e.target.files.length > 0) {
                toggleInputLock(true); // Trava o input antes de chamar o handler
                handleUserInput(e.target.files, `📎 ${Array.from(e.target.files).map(f => f.name).join(', ')}`);
            }
        });
    }

    function renderButtonOptions(question) {
        const optionsContainer = document.createElement("div");
        optionsContainer.classList.add("option-buttons");
        const questionOptions = options.buttonOptions?.[question.id] || question.options || [];

        questionOptions.forEach(opt => {
            const optBtn = document.createElement("button");
            optBtn.type = "button";
            optBtn.textContent = opt.label || opt.text;
            optBtn.dataset.value = opt.value;
            if (state.isLocked) optBtn.disabled = true; 
            optionsContainer.appendChild(optBtn);

            optBtn.addEventListener("click", () => {
                 if (state.isLocked) return;
                 toggleInputLock(true); // Trava o input antes de chamar o handler
                 handleUserInput(opt.value, opt.label || opt.text);
            });
        });
        inputContainer.appendChild(optionsContainer);
    }

    function handleUserInput(predefinedValue = null, displayText = null) {
        // 1. Verificar o estado de bloqueio
        if (state.isLocked) return;
        
        // 2. Travar Imediatamente a interface
        toggleInputLock(true); 

        try {
            const question = questions[state.currentQuestionIndex];
            let value;
            let userMessageText;
            const isSkipAction = typeof predefinedValue === 'object' && predefinedValue !== null && predefinedValue.isSkip;

            // 3. Obter o valor
            if (predefinedValue !== null && !isSkipAction) { // Botão de Opção
                value = predefinedValue;
                userMessageText = displayText || value;
            } else if (isSkipAction) { // Ação "Pular"
                value = ""; // Valor vazio para o input hidden
                userMessageText = displayText || "⏭️ Pulei esta etapa";
            } else {
                // Leitura do DOM (Botão Enviar/Enter)
                const inputField = document.getElementById("chat-input-field");
                if (!inputField) {
                    throw new Error("Campo de input não encontrado.");
                }
                const isFile = question.type === "file";
                value = isFile ? inputField.files : inputField.value;
                userMessageText = isFile ? (value.length > 0 ? `📎 ${Array.from(value).map(f => f.name).join(', ')}` : MESSAGES.NO_FILE) : value;
            }

            // 4. Validação
            const isFile = value instanceof FileList;

            // Validação de campo obrigatório e vazio
            if (question.required && (!value || (isFile && value.length === 0) || (!isFile && typeof value === 'string' && value.trim() === ""))) {
                addErrorMessage(MESSAGES.REQUIRED);
                throw new Error("Erro de validação: Campo obrigatório não preenchido.");
            }

            // Validação de telefone
            if (question.type === 'tel' && typeof value === 'string') {
                 // Verifica se a função validatePhoneNumber existe
                 if (typeof validatePhoneNumber === 'function' && !validatePhoneNumber(value)) {
                    addErrorMessage(MESSAGES.INVALID_PHONE);
                    throw new Error("Erro de validação: Telefone inválido.");
                 } else if (typeof validatePhoneNumber !== 'function') {
                    console.warn("A função validatePhoneNumber não está definida. A validação de telefone não será aplicada.");
                 }
            }

            // 5. Processamento (Se a validação passou, a interface permanece travada)
            const hiddenInput = document.getElementById(question.id);
            if (hiddenInput) {
                if (isFile) {
                    // Para campos de arquivo, o input do formulário oculto precisa ser do tipo file para ser submetido
                    if (hiddenInput.type !== 'file') {
                        hiddenInput.type = 'file'; // Ajuste dinâmico (se necessário)
                    }
                    if (hiddenInput.files !== value) {
                        // Simulação de atribuição de FileList
                        Object.defineProperty(hiddenInput, 'files', {
                            value: value,
                            writable: false,
                        });
                    }
                } else {
                    hiddenInput.value = value || "";
                }
            } else {
                 // Se o input oculto não existe, criá-lo
                 const newHiddenInput = document.createElement(isFile ? 'input' : 'input');
                 newHiddenInput.type = isFile ? 'file' : 'hidden';
                 newHiddenInput.name = question.id;
                 newHiddenInput.id = question.id;
                 hiddenForm.appendChild(newHiddenInput);
                 if (isFile) {
                     Object.defineProperty(newHiddenInput, 'files', {
                         value: value,
                         writable: false,
                     });
                 } else {
                     newHiddenInput.value = value || "";
                 }
            }


            addMessage(userMessageText, "user");
            proceedToNext();
            
        } catch (error) {
            console.error("Erro no processamento da entrada do usuário:", error.message);
            // Ação CRÍTICA: Garante que o input é desbloqueado em caso de qualquer erro
            toggleInputLock(false); 
        }
    }

    function proceedToNext() {
        if (state.isEditing) {
            state.isEditing = false;
            state.currentQuestionIndex = questions.length;
        } else {
            state.currentQuestionIndex++;
        }
        
        // Destrava a interface e mostra a próxima pergunta após um pequeno delay
        setTimeout(() => {
            showQuestion();
        }, 500);
    }

    // Funções editQuestion e showSummary (sem alterações significativas)

    function editQuestion(indexToEdit) {
        state.isEditing = true;
        state.currentQuestionIndex = indexToEdit;
        inputContainer.innerHTML = "";
        document.querySelectorAll('.summary-message, .final-submit-container').forEach(el => el.remove());
        const botMessages = document.querySelectorAll('.bot-message');
        const lastBotMessage = botMessages[botMessages.length - 1];
        if (lastBotMessage && lastBotMessage.textContent.startsWith("✅")) {
            lastBotMessage.remove();
        }
        showQuestion();
    }

    function showSummary() {
        updateProgress();
        progressFill.style.width = '100%';
        const typingIndicator = showTypingIndicator();
        
        // Garante que o input está travado ao mostrar o sumário (só o botão de submit deve estar ativo)
        toggleInputLock(true); 

        setTimeout(() => {
            typingIndicator.remove();
            addMessage(MESSAGES.SUMMARY_TITLE, "bot");
            inputContainer.innerHTML = "";

            const summaryContainer = document.createElement('div');
            summaryContainer.classList.add('chat-message', 'summary-message');
            let summaryHtml = '<ul>';

            questions.forEach((q, index) => {
                const hiddenInput = document.getElementById(q.id);
                // Devemos garantir que o hiddenInput existe ou criar um placeholder para exibição
                if (!hiddenInput) {
                    // Crie um input hidden temporário ou use um valor padrão se a pergunta foi pulada
                    return; 
                }

                let valueText;
                if (q.type === 'file') {
                    const files = hiddenInput.files || [];
                    valueText = files.length > 0 ? `📎 ${Array.from(files).map(f => f.name).join(', ')}` : "Nenhum arquivo";
                } else {
                    valueText = hiddenInput.value || "Não preenchido";
                }
                
                const questionLabel = summaryConfig.labels?.[q.id] || q.text.split('?')[0];

                summaryHtml += `
                    <li>
                        <div><strong>${questionLabel}:</strong> ${valueText}</div>
                        <button type="button" class="edit-btn" data-index="${index}">✏️ Editar</button>
                    </li>`;
            });

            summaryHtml += '</ul>';
            summaryContainer.innerHTML = summaryHtml;
            chatMessages.appendChild(summaryContainer);

            summaryContainer.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.closest('.edit-btn').dataset.index);
                    editQuestion(index);
                });
            });

            const submitContainer = document.createElement('div');
            submitContainer.classList.add('final-submit-container');
            const submitBtn = document.createElement("button");
            submitBtn.textContent = MESSAGES.SUBMIT_BUTTON_TEXT;
            submitBtn.style.width = "100%";
            submitContainer.appendChild(submitBtn);
            inputContainer.appendChild(submitContainer);

            submitBtn.addEventListener("click", () => {
                // Evita clique duplo
                if (hiddenForm.dataset.submitting === 'true') {
                    return; // Já está em processo de envio
                }

                // Callback de preparação (ex: mapear campos)
                if (submissionConfig.preSubmitCallback) {
                    submissionConfig.preSubmitCallback();
                }

                // Gera token e adiciona ao formulário (para validação no backend futuramente)
                state.submissionToken = generateIdempotencyToken();
                let tokenInput = hiddenForm.querySelector('input[name="idempotency_token"]');
                if (!tokenInput) {
                    tokenInput = document.createElement('input');
                    tokenInput.type = 'hidden';
                    tokenInput.name = 'idempotency_token';
                    hiddenForm.appendChild(tokenInput);
                }
                tokenInput.value = state.submissionToken;

                // Mensagem visual e bloqueio
                addMessage(MESSAGES.SUBMIT_SUCCESS_TEXT, "bot");
                submitBtn.disabled = true;
                submitBtn.textContent = MESSAGES.SUBMITTING_TEXT;
                flagFormSubmitted(hiddenForm, state.submissionToken);

                // Usa requestSubmit para respeitar validators nativos
                if (hiddenForm.requestSubmit) {
                    hiddenForm.requestSubmit();
                } else {
                    hiddenForm.submit();
                }
            });

            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 800);
    }

    setTimeout(showQuestion, 500);
}