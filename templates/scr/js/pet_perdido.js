document.addEventListener("DOMContentLoaded", () => {
    const chatMessages = document.getElementById("chat-messages");
    const inputContainer = document.getElementById("chat-input-container");
    const hiddenForm = document.getElementById("hidden-form");
    const progressFill = document.getElementById("progress-fill");

    function maskPhone(value) {
        value = value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
        }
        return value;
    }

    const questions = [
        { id: "comprovante", text: "Comprovante de pagamento (anexe o comprovante do Pix)", type: "file", accept: "image/*", multiple: true, required: true },
        { id: "nome_animal", text: "Nome do animal", type: "text", required: true },
        { id: "especie_raca", text: "Espécie e raça (ex: cachorro vira-lata, gato siamês, etc.)", type: "text", required: true },
        { id: "sexo", text: "Sexo (macho ou fêmea)", type: "text", required: true },
        { id: "idade", text: "Idade aproximada", type: "text", required: true },
        { id: "cor_caracteristicas", text: "Cor e características marcantes (manchas, tamanho, coleira, cicatriz, etc.)", type: "textarea", required: true },
        { id: "data_horario", text: "Data e horário do desaparecimento", type: "text", required: true },
        { id: "local_desaparecimento", text: "Local onde possivelmente tenha desaparecido (bairro, rua, ponto de referência)", type: "textarea", required: true },
        { id: "comportamento", text: "Comportamento do animal (assustado, dócil, não acostumado a sair, etc.)", type: "textarea", required: true },
        { id: "acessorios", text: "Se estava com coleira, plaquinha ou roupa no momento", type: "text", required: true },
        { id: "nome_tutor", text: "Nome do tutor ou responsável pelo animal", type: "text", required: true },
        { id: "telefone_whatsapp", text: "Telefone ou WhatsApp para contato", type: "tel", required: true },
        { id: "recompensa", text: "Se há recompensa oferecida", type: "text", required: true },
        { id: "cidade", text: "Cidade", type: "text", required: true },
        { id: "fotos", text: "Anexar no batão abaixo de 1 a 3 fotos do animal", type: "file", accept: "image/*", multiple: true, required: true }
    ];

    let currentQuestionIndex = 0;
    let isEditing = false;

    function updateProgress() {
        const progress = ((currentQuestionIndex) / questions.length) * 100;
        progressFill.style.width = `${progress}%`;
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
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addErrorMessage(text) {
        const messageEl = document.createElement("div");
        messageEl.classList.add("chat-message", "error-message");
        messageEl.textContent = text;
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
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
                const inputEl = question.type === "text" ? document.createElement("input") : document.createElement("textarea");
                if (question.type === "tel" || question.id === "telefone_whatsapp") {
                    inputEl.type = "text";
                    inputEl.inputMode = "numeric";
                    inputEl.placeholder = "(11) 99999-9999";
                } else {
                    inputEl.type = question.type;
                    inputEl.placeholder = "Digite sua resposta...";
                }
                inputEl.id = "chat-input-field";
                const sendBtn = document.createElement("button");
                sendBtn.id = "chat-send-btn";
                sendBtn.textContent = "Enviar";
                inputContainer.appendChild(inputEl);
                inputContainer.appendChild(sendBtn);
                if (question.id === "telefone_whatsapp") {
                    inputEl.addEventListener("input", (e) => {
                        e.target.value = maskPhone(e.target.value);
                    });
                }
                sendBtn.addEventListener("click", () => handleUserInput());
                inputEl.addEventListener("keypress", (e) => {
                    if (e.key === "Enter" && (!e.shiftKey || question.type === "text")) {
                        e.preventDefault();
                        handleUserInput();
                    }
                });
                inputEl.focus();
                break;
            case "file":
                const fileInput = document.createElement("input");
                fileInput.type = "file";
                fileInput.id = "chat-input-field";
                fileInput.accept = question.accept;
                fileInput.multiple = question.multiple || false;
                inputContainer.appendChild(fileInput);
                fileInput.addEventListener("change", (e) => {
                    if (e.target.files.length > 0) {
                        const files = Array.from(e.target.files);
                        const displayText = files.map(f => f.name).join(', ');
                        handleUserInput(files, ` ${displayText}`);
                    }
                });
                break;
        }
    }

    function handleUserInput(predefinedValue = null, displayText = null) {
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
                userMessageText = value.length > 0 ? ` ${Array.from(value).map(f => f.name).join(', ')}` : "Nenhum arquivo selecionado";
            } else {
                value = inputField.value;
                userMessageText = value;
            }
        }
        if (question.required && ((question.type === "file" && value.length === 0) || (question.type !== "file" && (!value || (typeof value === 'string' && value.trim() === ""))))) {
            addErrorMessage(" Este campo é obrigatório. Por favor, forneça uma resposta.");
            return;
        }
        if (question.id === "telefone_whatsapp" && typeof value === 'string') {
            const digits = value.replace(/\D/g, '');
            if (digits.length !== 11) {
                addErrorMessage(" Por favor, insira um número de telefone válido com 11 dígitos (DDD + 9 dígitos).");
                return;
            }
        }
        const hiddenInput = document.getElementById(question.id);
        if (question.type === "file" && value.length > 0) {
            hiddenInput.files = value;
        } else if (hiddenInput) {
            hiddenInput.value = value || "";
        }
        addMessage(userMessageText, "user");
        proceedToNext();
    }

    function proceedToNext() {
        if (isEditing) {
            isEditing = false;
            currentQuestionIndex = questions.length;
            setTimeout(showSummary, 500);
        } else {
            currentQuestionIndex++;
            setTimeout(showQuestion, 500);
        }
    }

    function editQuestion(indexToEdit) {
        isEditing = true;
        currentQuestionIndex = indexToEdit;
        inputContainer.innerHTML = "";
        const summaryMessages = document.querySelectorAll('.summary-message, .final-submit-container');
        summaryMessages.forEach(msg => msg.remove());
        const botMessages = document.querySelectorAll('.bot-message');
        const lastBotMessage = botMessages[botMessages.length - 1];
        if (lastBotMessage && lastBotMessage.textContent.startsWith("")) {
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
            addMessage(" Informações recebidas! Vamos revisar:", "bot");
            inputContainer.innerHTML = "";
            const summaryContainer = document.createElement('div');
            summaryContainer.classList.add('chat-message', 'summary-message');
            let summaryHtml = '<ul>';
            questions.forEach((q, index) => {
                const hiddenInput = document.getElementById(q.id);
                let valueText = hiddenInput.value;
                if (q.type === 'file') {
                    valueText = hiddenInput.files.length > 0 ? ` ${Array.from(hiddenInput.files).map(f => f.name).join(', ')}` : "Nenhum arquivo";
                } else if (!valueText) {
                    valueText = "Não preenchido";
                }
                let questionText = q.text.replace(/[]/g, "").trim();
                summaryHtml += `<li><div><strong>${questionText.split('?')[0]}:</strong> ${valueText}</div><button type="button" class="edit-btn" data-index="${index}"> Editar</button></li>`;
            });
            summaryHtml += '</ul>';
            summaryContainer.innerHTML = summaryHtml;
            chatMessages.appendChild(summaryContainer);
            summaryContainer.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const targetButton = e.target.closest('.edit-btn');
                    if (!targetButton) return;
                    const index = parseInt(targetButton.dataset.index);
                    editQuestion(index);
                });
            });
            const submitContainer = document.createElement('div');
            submitContainer.classList.add('final-submit-container');
            const submitBtn = document.createElement("button");
            submitBtn.textContent = " Enviar Anúncio de Pet Perdido";
            submitBtn.style.width = "100%";
            submitContainer.appendChild(submitBtn);
            inputContainer.appendChild(submitContainer);
            submitBtn.addEventListener("click", () => {
                addMessage("Obrigado. Aguarde nossa análise e a publicação.", "bot");
                hiddenForm.submit();
                submitBtn.disabled = true;
                submitBtn.textContent = " Enviando...";
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 800);
    }

    setTimeout(showQuestion, 500);
});
