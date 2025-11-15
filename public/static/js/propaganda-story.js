document.addEventListener("chat:start", () => {
    const questions = [
        { id: "comprovante_pagamento", text: "1. Anexe o comprovante de pagamento: 👉 Anexe a imagem ou PDF do comprovante do Pix realizado.", type: "file", accept: "image/*,application/pdf", required: true },
        { id: "arquivos_stories", text: "2. Envio de arquivos para os Stories: 👉 Anexe as imagens ou vídeos que deseja publicar nos Stories — máximo de 10 arquivos.", type: "file", accept: "image/*,video/*", multiple: true, maxFiles: 10, required: true }
    ];

    const summaryConfig = {
        title: "✅ Informações recebidas! Vamos revisar:",
        labels: {
            comprovante_pagamento: "Comprovante de Pagamento",
            arquivos_stories: "Arquivos dos Stories"
        }
    };

    const submissionConfig = {
        buttonText: "📢 Enviar Propaganda no Story",
        submittingText: "⏳ Enviando...",
        successText: "📤 Enviando sua propaganda no Story..."
    };

    initializeChatForm({
        questions: questions,
        summaryConfig: summaryConfig,
        submissionConfig: submissionConfig
    });
}, { once: true });