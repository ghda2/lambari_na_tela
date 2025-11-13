document.addEventListener("chat:start", () => {
    // IDs correspondem diretamente às colunas do Supabase
    const questions = [
        { id: "comprovante_path", text: "Anexe o comprovante de pagamento do Pix.", type: "file", accept: "image/*", required: true },
        { id: "nome_pet", text: "Qual o nome do seu pet?", type: "text", required: true },
        { id: "tipo_pet", text: "Qual a espécie do seu pet?", type: "button", required: true },
        { id: "raca", text: "E a raça? (Se não souber, pode escrever 'Vira-lata')", type: "text", required: true },
        { id: "sexo", text: "Qual o sexo do animal?", type: "button", required: true },
        { id: "idade", text: "Qual a idade aproximada?", type: "text", required: true },
        { id: "descricao", text: "Descreva cor e características marcantes (manchas, tamanho, coleira, etc.)", type: "textarea", required: true },
        { id: "local_desaparecimento", text: "Onde ele desapareceu? (Bairro, rua, ponto de referência)", type: "textarea", required: true },
        { id: "data_desaparecimento", text: "Quando ele desapareceu? (Data e horário aproximado)", type: "text", required: true },
        { id: "bairro", text: "Qual o bairro do desaparecimento?", type: "text", required: true },
        { id: "nome_tutor", text: "Qual o nome do tutor?", type: "text", required: true },
        { id: "whatsapp", text: "Qual o seu WhatsApp para contato?", type: "tel", required: true },
        { id: "cidade", text: "Em qual cidade o pet desapareceu?", type: "text", required: true },
        { id: "img_path", text: "Anexe de 1 a 3 fotos do seu pet.", type: "file", accept: "image/*", multiple: true, required: true }
    ];

    const buttonOptions = {
        tipo_pet: [
            { value: "Cachorro", label: "🐕 Cachorro" },
            { value: "Gato", label: "🐱 Gato" },
            { value: "Pássaro", label: "🦜 Pássaro" },
            { value: "Outro", label: "✏️ Outro" }
        ],
        sexo: [
            { value: "Macho", label: "♂️ Macho" },
            { value: "Fêmea", label: "♀️ Fêmea" }
        ]
    };

    // Labels para a tela de resumo
    const summaryConfig = {
        title: "✅ Tudo certo! Revise as informações do seu pet:",
        labels: {
            comprovante_path: "Comprovante",
            nome_pet: "Nome do Pet",
            tipo_pet: "Tipo",
            raca: "Raça",
            sexo: "Sexo",
            idade: "Idade",
            descricao: "Descrição",
            local_desaparecimento: "Local",
            data_desaparecimento: "Data",
            bairro: "Bairro",
            nome_tutor: "Tutor",
            whatsapp: "WhatsApp",
            cidade: "Cidade",
            img_path: "Fotos"
        }
    };

    const submissionConfig = {
        buttonText: "📢 Enviar Anúncio de Pet Perdido",
        submittingText: "⏳ Enviando...",
        successText: "✅ Obrigado! Seu anúncio foi enviado para análise."
    };

    initializeChatForm({
        questions: questions,
        options: {
            storageKey: 'petFormProgress',
            buttonOptions: buttonOptions
        },
        summaryConfig: summaryConfig, // Adicionado
        submissionConfig: submissionConfig
    });
}, { once: true });