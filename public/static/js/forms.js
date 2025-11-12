document.addEventListener("chat:start", () => {
    const questions = [
        { id: "whatsapp", text: "Primeiro nos forneça seu WhatsApp - Servirá para entrarmos em contato caso seja necessário.", type: "tel", required: true },
        { id: "cidade", text: "Agora nos informe sua cidade.", type: "text", required: true },
        { id: "bairro", text: "Qual o seu Bairro?", type: "text", required: true },
        { id: "problema", text: "Agora nos diga qual o seu problema?", type: "textarea", required: true },
        { id: "img_path", text: "Envie uma imagem:", type: "file", accept: "image/*", required: true },
        { id: "video_path", text: "Envie o arquivo de vídeo (opcional):", type: "file", accept: "video/*", required: false }
    ];

    const summaryConfig = {
        title: "✅ Perfeito! Aqui está um resumo das suas informações:",
        labels: {
            whatsapp: "WhatsApp",
            cidade: "Cidade",
            bairro: "Bairro",
            problema: "Problema",
            img_path: "Imagem",
            video_path: "Vídeo"
        }
    };

    const submissionConfig = {
        buttonText: "🚀 Cadastrar Reportagem",
        submittingText: "⏳ Enviando...",
        successText: "📤 Enviando sua reportagem..."
    };

    initializeChatForm({
        questions: questions,
        summaryConfig: summaryConfig,
        submissionConfig: submissionConfig
    });
}, { once: true });