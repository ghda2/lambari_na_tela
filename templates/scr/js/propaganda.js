let currentQuestionIndex = 0;
let uploadedImagePath = null;
let uploadedComprovantePath = null;

const questions = [
    { id: "comprovante_path", text: "📄 Anexe o comprovante de pagamento (imagem ou screenshot)", type: "file", accept: "image/*", required: true },
    { id: "whatsapp", text: "Qual seu número de WhatsApp para contato?", type: "tel", required: true },
    { id: "nome_negocio", text: "Qual o nome do seu negócio/serviço?", type: "text", required: true },
    { id: "cidade", text: "Em qual cidade?", type: "text", required: true },
    { id: "bairro", text: "Em qual bairro?", type: "text", required: true },
    { id: "descricao", text: "Descreva seu produto/serviço (o que oferece, diferenciais, etc)", type: "textarea", required: true },
    { id: "img_path", text: "Envie uma imagem do seu produto/serviço", type: "file", accept: "image/*", required: true }
];

function maskPhone(value) {
    value = value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (value.length > 0) {
        value = value.replace(/^(\d*)/, '($1');
    }
    return value;
}

function showQuestion(index) {
    const chatMessages = document.getElementById("chat-messages");
    const chatInputContainer = document.getElementById("chat-input-container");
    const question = questions[index];

    const botMessage = document.createElement("div");
    botMessage.className = "message bot-message";
    botMessage.textContent = question.text;
    chatMessages.appendChild(botMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    chatInputContainer.innerHTML = "";
    
    const inputWrapper = document.createElement("div");
    inputWrapper.className = "input-wrapper";

    const inputEl = renderInput(question);
    inputWrapper.appendChild(inputEl);

    const sendButton = document.createElement("button");
    sendButton.className = "send-button";
    sendButton.textContent = "Enviar";
    sendButton.addEventListener("click", () => handleUserInput());
    inputWrapper.appendChild(sendButton);

    chatInputContainer.appendChild(inputWrapper);

    if (question.type !== "file") {
        inputEl.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleUserInput();
            }
        });
    }

    inputEl.focus();
}

function renderInput(question) {
    let inputEl;
    
    if (question.type === "textarea") {
        inputEl = document.createElement("textarea");
        inputEl.rows = 4;
        inputEl.placeholder = "Digite aqui...";
    } else if (question.type === "file") {
        inputEl = document.createElement("input");
        inputEl.type = "file";
        inputEl.accept = question.accept;
    } else if (question.type === "tel") {
        inputEl = document.createElement("input");
        inputEl.type = "text";
        inputEl.inputMode = "numeric";
        inputEl.placeholder = "(XX) XXXXX-XXXX";
        inputEl.addEventListener("input", (e) => {
            e.target.value = maskPhone(e.target.value);
        });
    } else {
        inputEl = document.createElement("input");
        inputEl.type = question.type;
        inputEl.placeholder = "Digite aqui...";
    }

    inputEl.id = "chat-input-field";
    inputEl.className = "chat-input-field";
    inputEl.required = question.required;
    
    return inputEl;
}

function handleUserInput() {
    const question = questions[currentQuestionIndex];
    const inputField = document.getElementById("chat-input-field");

    if (!inputField) {
        console.error("Campo de entrada não encontrado");
        return;
    }

    let value;
    if (question.type === "file") {
        const file = inputField.files[0];
        if (!file) {
            alert("Por favor, selecione uma imagem.");
            return;
        }
        value = file.name;
        
        // Armazenar os arquivos separadamente
        if (question.id === "comprovante_path") {
            uploadedComprovantePath = file;
        } else if (question.id === "img_path") {
            uploadedImagePath = file;
        }
    } else {
        value = inputField.value.trim();
        
        if (!value) {
            alert("Por favor, preencha este campo.");
            return;
        }

        if (question.id === "whatsapp") {
            const digitsOnly = value.replace(/\D/g, '');
            if (digitsOnly.length !== 11) {
                alert("Por favor, insira um número de WhatsApp válido com 11 dígitos.");
                return;
            }
        }
    }

    const hiddenInput = document.getElementById(question.id);
    if (hiddenInput) {
        if (question.type === "file") {
            const dataTransfer = new DataTransfer();
            if (question.id === "comprovante_path") {
                dataTransfer.items.add(uploadedComprovantePath);
            } else if (question.id === "img_path") {
                dataTransfer.items.add(uploadedImagePath);
            }
            hiddenInput.files = dataTransfer.files;
        } else {
            hiddenInput.value = value;
        }
    }

    const chatMessages = document.getElementById("chat-messages");
    const userMessage = document.createElement("div");
    userMessage.className = "message user-message";
    userMessage.textContent = value;
    chatMessages.appendChild(userMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    currentQuestionIndex++;
    updateProgressBar();

    if (currentQuestionIndex < questions.length) {
        setTimeout(() => showQuestion(currentQuestionIndex), 500);
    } else {
        setTimeout(() => showSummary(), 500);
    }
}

function updateProgressBar() {
    const progressFill = document.getElementById("progress-fill");
    const progress = ((currentQuestionIndex) / questions.length) * 100;
    progressFill.style.width = `${progress}%`;
}

function showSummary() {
    const chatMessages = document.getElementById("chat-messages");
    const chatInputContainer = document.getElementById("chat-input-container");

    const summaryMessage = document.createElement("div");
    summaryMessage.className = "message bot-message";
    summaryMessage.innerHTML = `
        <p>✅ Informações recebidas! Vamos revisar:</p>
        <p><strong>Comprovante:</strong> ${uploadedComprovantePath.name}</p>
        <p><strong>WhatsApp:</strong> ${document.getElementById("whatsapp").value}</p>
        <p><strong>Nome do Negócio:</strong> ${document.getElementById("nome_negocio").value}</p>
        <p><strong>Cidade:</strong> ${document.getElementById("cidade").value}</p>
        <p><strong>Bairro:</strong> ${document.getElementById("bairro").value}</p>
        <p><strong>Descrição:</strong> ${document.getElementById("descricao").value}</p>
        <p><strong>Imagem:</strong> ${uploadedImagePath.name}</p>
    `;
    chatMessages.appendChild(summaryMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    chatInputContainer.innerHTML = "";

    const confirmButton = document.createElement("button");
    confirmButton.className = "send-button";
    confirmButton.textContent = "Enviar Propaganda";
    confirmButton.style.width = "100%";
    confirmButton.addEventListener("click", () => {
        document.getElementById("hidden-form").submit();
    });

    chatInputContainer.appendChild(confirmButton);
}

document.addEventListener("DOMContentLoaded", () => {
    showQuestion(currentQuestionIndex);
});
