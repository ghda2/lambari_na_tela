document.addEventListener("chat:start", () => {
<<<<<<< HEAD
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
=======
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

    const buttonOptions = {
        especie_raca: [
            { value: "Cachorro vira-lata", label: "🐕 Cachorro vira-lata" },
            { value: "Cachorro com raça definida", label: "🐕 Cachorro com raça definida" },
            { value: "Gato vira-lata", label: "🐱 Gato vira-lata" },
            { value: "Gato com raça definida", label: "🐱 Gato com raça definida" },
>>>>>>> eebceffa0a062648d3db705e63b1979a3dc96c45
            { value: "Pássaro", label: "🦜 Pássaro" },
            { value: "Outro", label: "✏️ Outro" }
        ],
        sexo: [
            { value: "Macho", label: "♂️ Macho" },
            { value: "Fêmea", label: "♀️ Fêmea" }
<<<<<<< HEAD
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
=======
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

    const submissionConfig = {
        buttonText: "📢 Enviar Anúncio de Pet Perdido",
        submittingText: "⏳ Enviando...",
        successText: "✅ Obrigado. Aguarde nossa análise e a publicação.",
        preSubmitCallback: () => {
            // Mapeia os dados do formulário do chat para o formulário oculto do backend
            document.getElementById('nome_pet').value = document.getElementById('nome_animal').value;
            document.getElementById('tipo_pet').value = document.getElementById('especie_raca').value;
            document.getElementById('raca').value = document.getElementById('sexo').value;
            document.getElementById('bairro').value = document.getElementById('idade').value;
            
            const descricaoFields = [
                document.getElementById('cor_caracteristicas').value,
                document.getElementById('local_desaparecimento').value,
                document.getElementById('comportamento').value,
                document.getElementById('acessorios').value,
                document.getElementById('nome_tutor').value,
                document.getElementById('recompensa').value,
                document.getElementById('data_horario').value
            ].filter(val => val && val.trim() !== '');
            
            document.getElementById('descricao').value = descricaoFields.join(' | ');
            document.getElementById('cidade').value = document.getElementById('cidade').value;
            document.getElementById('whatsapp').value = document.getElementById('telefone_whatsapp').value;
        }
>>>>>>> eebceffa0a062648d3db705e63b1979a3dc96c45
    };

    initializeChatForm({
        questions: questions,
        options: {
            storageKey: 'petFormProgress',
            buttonOptions: buttonOptions
        },
<<<<<<< HEAD
        summaryConfig: summaryConfig, // Adicionado
=======
>>>>>>> eebceffa0a062648d3db705e63b1979a3dc96c45
        submissionConfig: submissionConfig
    });
}, { once: true });