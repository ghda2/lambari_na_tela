document.addEventListener("chat:start", () => {
    const questions = [
        { id: "nome_responsavel", text: "Nome completo do responsável pela publicação (Quem está procurando o objeto)", type: "text", required: true },
        { id: "objeto_perdido", text: "Objeto perdido (Exemplo: carteira, celular, documento, bolsa, chave, etc.)", type: "text", required: true },
        { id: "descricao_detalhada", text: "Descrição detalhada do objeto (Cor, tamanho, marca, características que ajudem na identificação)", type: "textarea", required: true },
        { id: "data_horario", text: "Data e horário aproximado do desaparecimento (Quando o objeto foi visto pela última vez)", type: "text", required: true },
        { id: "local_perdido", text: "Local onde possivelmente foi perdido (Bairro, rua, ponto de referência, estabelecimento, etc.)", type: "textarea", required: true },
        { id: "possibilidade_levado", text: "Há possibilidade de ter sido levado ou esquecido em algum lugar específico? (Sim / Não / Não sei – explique brevemente)", type: "textarea", required: true },
        { id: "nome_telefone_contato", text: "Nome e telefone para contato (WhatsApp preferencialmente)", type: "text", required: true },
        { id: "recompensa", text: "Há recompensa para quem encontrar? (Sim / Não / Preferimos não divulgar)", type: "button", required: true },
        { id: "observacao", text: "Deseja acrescentar alguma observação importante? (Informações adicionais, documentos dentro do objeto, etc.)", type: "textarea", required: false },
        { id: "fotos", text: "Envie 1 ou mais fotos se possível (Imagem do objeto, local, ou comprovante — se aplicável)", type: "file", accept: "image/*", multiple: true, required: false }
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

    initializeChatForm({
        questions: questions,
        options: {
            storageKey: 'objetoFormProgress',
            buttonOptions: buttonOptions
        },
        submissionConfig: submissionConfig
    });
}, { once: true });