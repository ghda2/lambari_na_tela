document.addEventListener("chat:start", () => {
    const questions = [
        { id: "comprovante_pagamento", text: "1. Anexe o comprovante de pagamento: 👉 Anexe a imagem ou PDF do comprovante do Pix realizado.", type: "file", accept: "image/*,application/pdf", required: true },
        { id: "nome_empresa", text: "2. Nome da empresa: (Exemplo: Madeireira do Levy, LLs Bistrô, Evandro Café Consulting...)", type: "text", required: true },
        { id: "nome_responsavel", text: "3. Nome do responsável pelo anúncio: (Quem autoriza ou representa a empresa para esta divulgação. 👉 O nome não será utilizado na publicação — servirá apenas para contato, caso seja necessário.)", type: "text", required: true },
        { id: "telefone_contato_equipe", text: "4. Telefone ou WhatsApp para contato com a equipe Lambari na Tela: (👉 Esse número será usado exclusivamente para contato interno, caso precisemos confirmar informações ou ajustar o conteúdo antes da publicação.)", type: "tel", required: true },
        { id: "telefone_empresa", text: "5. Telefone ou WhatsApp da empresa (para divulgação): (👉 Esse número será exibido na matéria para que os clientes possam entrar em contato diretamente com a empresa.)", type: "tel", required: true },
        { id: "endereco", text: "6. Endereço completo da empresa: (Rua, número, bairro e cidade)", type: "text", required: true },
        { id: "tipo_negocio", text: "7. Tipo de negócio / segmento: (Exemplo: restaurante, loja de roupas, madeireira, consultoria, academia, etc.)", type: "text", required: true },
        { id: "descricao_oferta", text: "8. Descreva brevemente o que a empresa oferece: (Produtos, serviços, diferenciais, o que a torna especial)", type: "textarea", required: true },
        { id: "formas_pagamento", text: "9. Formas de pagamento aceitas: (Exemplo: dinheiro, Pix, cartão de crédito, débito, transferência, etc.)", type: "text", required: true },
        { id: "desconto_vista", text: "10. A empresa oferece desconto no pagamento à vista? (Sim / Não — se sim, informe o percentual)", type: "text", required: true },
        { id: "parcelas_cartao", text: "11. Em quantas vezes é possível parcelar no cartão? (Informe o número de parcelas e se há juros)", type: "text", required: true },
        { id: "promocoes", text: "12. Há promoções ou ofertas especiais no momento? (Descreva brevemente)", type: "textarea", required: false },
        { id: "frase_destaque", text: "13. Deseja incluir uma frase de destaque ou slogan da empresa? (Exemplo: \"Tradição e qualidade que você confia\")", type: "text", required: false },
        { id: "produto_destaque", text: "14. Há algum produto ou serviço que você quer destacar na matéria? (Indique o principal foco da divulgação)", type: "text", required: false },
        { id: "links_redes", text: "15. Deseja incluir links de redes sociais ou site? (Informe os links — Instagram, Facebook, site, etc.)", type: "text", required: false },
        { id: "outras_informacoes", text: "16. Outras informações importantes que queira acrescentar: (Caso queira contar algo especial sobre a história da empresa, fundação, diferenciais, etc.)", type: "textarea", required: false },
        { id: "materiais_divulgacao", text: "17. Envio de materiais para divulgação: 👉 Anexe agora as fotos da empresa (fachada, produtos ou equipe), ou vídeos de até 1 minuto — máximo de 4 arquivos. 👉 Se preferir, você também pode enviar um banner pronto da sua empresa para ser utilizado na publicação.", type: "file", accept: "image/*,video/*", multiple: true, maxFiles: 4, required: false }
    ];

    const summaryConfig = {
        title: "✅ Informações recebidas! Vamos revisar:",
        labels: {
            comprovante_pagamento: "Comprovante de Pagamento",
            nome_empresa: "Nome da Empresa",
            nome_responsavel: "Nome do Responsável",
            telefone_contato_equipe: "Telefone Contato Equipe",
            telefone_empresa: "Telefone Empresa",
            endereco: "Endereço",
            tipo_negocio: "Tipo de Negócio",
            descricao_oferta: "Descrição da Oferta",
            formas_pagamento: "Formas de Pagamento",
            desconto_vista: "Desconto à Vista",
            parcelas_cartao: "Parcelas Cartão",
            promocoes: "Promoções",
            frase_destaque: "Frase de Destaque",
            produto_destaque: "Produto Destaque",
            links_redes: "Links Redes Sociais",
            outras_informacoes: "Outras Informações",
            materiais_divulgacao: "Materiais Divulgação"
        }
    };

    const submissionConfig = {
        buttonText: "📢 Enviar Propaganda",
        submittingText: "⏳ Enviando...",
        successText: "📤 Enviando sua propaganda..."
    };

    initializeChatForm({
        questions: questions,
        summaryConfig: summaryConfig,
        submissionConfig: submissionConfig
    });
}, { once: true });