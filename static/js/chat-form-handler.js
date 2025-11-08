/**
 * Módulo de Formulário de Chat Interativo
 * 
 * Este script gerencia um formulário de chat interativo.
 * Para usar, chame a função `initializeChatForm` com as configurações necessárias.
 * 
 * Dependências:
 * - utils.js (para maskPhone e validatePhoneNumber)
 * 
 * Estrutura HTML esperada:
 * - <div id="chat-messages"></div>
 * - <div id="chat-input-container"></div>
 * - <form id="hidden-form"></form>
 * - <div id="progress-fill"></div>
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

    let currentQuestionIndex = 0;
    let isEditing = false;

    function updateProgress() {
        const progress = ((currentQuestionIndex) / questions.length) * 100;
        requestAnimationFrame(() => {
            progressFill.style.width = `${progress}%`;
        });
    }

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
        messageEl.textContent = text;
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
    }

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
        if (question.type === 'tel') {
            inputEl.inputMode = "numeric";
        }

        const sendBtn = document.createElement("button");
        sendBtn.id = "chat-send-btn";
        sendBtn.textContent = "Enviar";

        inputContainer.appendChild(inputEl);
        inputContainer.appendChild(sendBtn);

        if (question.type === 'tel') {
            inputEl.addEventListener("input", (e) => e.target.value = maskPhone(e.target.value));
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

        const skipBtn = document.createElement("button");
        skipBtn.id = "chat-skip-btn";
        skipBtn.textContent = "Pular";

        inputContainer.appendChild(fileInput);
        if (!question.required) {
            inputContainer.appendChild(skipBtn);
            skipBtn.addEventListener("click", () => handleUserInput(null));
        }

        fileInput.addEventListener("change", (e) => {
            const maxFiles = question.maxFiles || Infinity;
            if (e.target.files.length > maxFiles) {
                addErrorMessage(`Máximo de ${maxFiles} arquivos permitidos.`);
                fileInput.value = '';
                return;
            }
            if (e.target.files.length > 0) {
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
            optionsContainer.appendChild(optBtn);

            optBtn.addEventListener("click", () => {
                handleUserInput(opt.value, opt.label || opt.text);
            });
        });
        inputContainer.appendChild(optionsContainer);
    }

    function handleUserInput(predefinedValue = null, displayText = null) {
        const question = questions[currentQuestionIndex];
        let value;
        let userMessageText;

        if (predefinedValue !== null) {
            value = predefinedValue;
            userMessageText = displayText || (value === null ? "⏭️ Pulei esta etapa" : value);
        } else {
            const inputField = document.getElementById("chat-input-field");
            if (!inputField) return;
            value = (question.type === "file") ? inputField.files : inputField.value;
            userMessageText = (question.type === "file") ? (value.length > 0 ? `📎 ${Array.from(value).map(f => f.name).join(', ')}` : MESSAGES.NO_FILE) : value;
        }

        const isFile = value instanceof FileList;
        if (question.required && (!value || (isFile && value.length === 0) || (!isFile && typeof value === 'string' && value.trim() === ""))) {
            addErrorMessage(MESSAGES.REQUIRED);
            return;
        }

        if (question.type === 'tel' && typeof value === 'string' && !validatePhoneNumber(value)) {
            addErrorMessage(MESSAGES.INVALID_PHONE);
            return;
        }

        const hiddenInput = document.getElementById(question.id);
        if (hiddenInput) {
            if (isFile) {
                hiddenInput.files = value;
            } else {
                hiddenInput.value = value || "";
            }
        }

        addMessage(userMessageText, "user");
        proceedToNext();
    }

    function proceedToNext() {
        if (isEditing) {
            isEditing = false;
            currentQuestionIndex = questions.length;
        } else {
            currentQuestionIndex++;
        }
        setTimeout(showQuestion, 500);
    }

    function editQuestion(indexToEdit) {
        isEditing = true;
        currentQuestionIndex = indexToEdit;
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
        setTimeout(() => {
            typingIndicator.remove();
            addMessage(MESSAGES.SUMMARY_TITLE, "bot");
            inputContainer.innerHTML = "";

            const summaryContainer = document.createElement('div');
            summaryContainer.classList.add('chat-message', 'summary-message');
            let summaryHtml = '<ul>';

            questions.forEach((q, index) => {
                const hiddenInput = document.getElementById(q.id);
                let valueText;
                if (q.type === 'file') {
                    valueText = hiddenInput.files.length > 0 ? `📎 ${Array.from(hiddenInput.files).map(f => f.name).join(', ')}` : "Nenhum arquivo";
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
                if (submissionConfig.preSubmitCallback) {
                    submissionConfig.preSubmitCallback();
                }
                addMessage(MESSAGES.SUBMIT_SUCCESS_TEXT, "bot");
                hiddenForm.submit();
                submitBtn.disabled = true;
                submitBtn.textContent = MESSAGES.SUBMITTING_TEXT;
            });

            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 800);
    }

    setTimeout(showQuestion, 500);
}
