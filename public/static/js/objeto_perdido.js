document.addEventListener("chat:start", () => {
    const questions = [
        { id: "comprovante_pagamento", text: "1. Anexe o comprovante de pagamento: 👉 Anexe a imagem ou PDF do comprovante do Pix realizado.", type: "file", accept: "image/*,application/pdf", required: true },
        { id: "nome_responsavel", text: "2. Nome completo do responsável pela publicação (Quem está procurando o objeto)", type: "text", required: true },
        { id: "objeto_perdido", text: "3. Objeto perdido (Exemplo: carteira, celular, documento, bolsa, chave, etc.)", type: "text", required: true },
        { id: "descricao_detalhada", text: "4. Descrição detalhada do objeto (Cor, tamanho, marca, características que ajudem na identificação)", type: "textarea", required: true },
        { id: "data_horario", text: "5. Data e horário aproximado do desaparecimento (Quando o objeto foi visto pela última vez)", type: "text", required: true },
        { id: "local_perdido", text: "6. Local onde possivelmente foi perdido (Bairro, rua, ponto de referência, estabelecimento, etc.)", type: "textarea", required: true },
        { id: "possibilidade_levado", text: "7. Há possibilidade de ter sido levado ou esquecido em algum lugar específico? (Sim / Não / Não sei – explique brevemente)", type: "textarea", required: true },
        { id: "nome_telefone_contato", text: "8. Nome e telefone/WhatsApp para contato", type: "tel", required: true },
        { id: "recompensa", text: "9. Há recompensa para quem encontrar? (Sim / Não / Preferimos não divulgar)", type: "button", required: true },
        { id: "observacao", text: "10. Deseja acrescentar alguma observação importante? (Informações adicionais, documentos dentro do objeto, etc.)", type: "textarea", required: false },
        { id: "fotos", text: "11. Envie 1 ou mais fotos se possível (Imagem do objeto, local, ou comprovante — se aplicável)", type: "file", accept: "image/*", multiple: true, required: false }
    ];

    const buttonOptions = {
        recompensa: [
            { value: "Sim", label: "💰 Sim" },
            { value: "Não", label: "❌ Não" },
            { value: "Preferimos não divulgar", label: "🤐 Preferimos não divulgar" }
        ]
    };

    const submissionConfig = {
        buttonText: "📢 Enviar Anúncio de Objeto Perdido",
        submittingText: "⏳ Enviando...",
        successText: "✅ Obrigado. Aguarde nossa análise e a publicação.",
        preSubmitCallback: () => {
            // The form fields are already mapped by id
        }
    };

    const summaryConfig = {
        title: "✅ Informações recebidas! Vamos revisar:",
        labels: {
            comprovante_pagamento: "Comprovante de Pagamento",
            nome_responsavel: "Nome do Responsável",
            objeto_perdido: "Objeto Perdido",
            descricao_detalhada: "Descrição Detalhada",
            data_horario: "Data e Horário",
            local_perdido: "Local Perdido",
            possibilidade_levado: "Possibilidade de Ter Sido Levado",
            nome_telefone_contato: "Nome e Telefone para Contato",
            recompensa: "Recompensa",
            observacao: "Observação",
            fotos: "Fotos"
        }
    };

    initializeChatForm({
        questions: questions,
        options: {
            storageKey: 'objetoFormProgress',
            buttonOptions: buttonOptions
        },
        submissionConfig: submissionConfig,
        summaryConfig: summaryConfig
    });
}, { once: true });