// Funções utilitárias para validação e formatação

/**
 * Máscara para número de telefone.
 * @param {string} value - O valor do telefone a ser mascarado.
 * @returns {string} - O valor com a máscara.
 */
function maskPhone(value) {
    try {
        value = value.replace(/\D/g, '');
        if (value.length === 11) {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (value.length === 10) {
            value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return value;
    } catch (error) {
        console.error('Erro ao mascarar telefone:', error);
        return value;
    }
}

/**
 * Valida um número de telefone.
 * @param {string} phoneNumber - O número de telefone a ser validado.
 * @returns {boolean} - True se for válido, false caso contrário.
 */
function validatePhoneNumber(phoneNumber) {
    const digits = phoneNumber.replace(/\D/g, '');
    // Para telefone brasileiro: exatamente 10 dígitos (fixo) ou 11 dígitos (celular)
    return digits.length === 10 || digits.length === 11;
}

/**
 * Previne dupla submissão em todos os formulários padrão da página.
 * - Adiciona data-submitting="true" na primeira submissão.
 * - Desabilita botões de submit para evitar clique repetido.
 * - Armazena em sessionStorage uma chave simples para detecção de reenvio rápido (histórico / back).
 */
(function attachGlobalDoubleSubmitGuard() {
    if (window.__doubleSubmitGuardAttached) return;
    window.__doubleSubmitGuardAttached = true;

    function disableSubmitButtons(form) {
        const btns = form.querySelectorAll('button[type="submit"], input[type="submit"]');
        btns.forEach(b => b.disabled = true);
    }

    function alreadySubmitted(form) {
        return form.dataset.submitting === 'true';
    }

    function markSubmitted(form) {
        form.dataset.submitting = 'true';
        try {
            sessionStorage.setItem('form:submitted:' + (form.action || 'noaction'), Date.now().toString());
        } catch (e) {}
    }

    document.addEventListener('submit', (e) => {
        const form = e.target;
        if (!(form instanceof HTMLFormElement)) return;
        if (alreadySubmitted(form)) {
            e.preventDefault();
            return;
        }
        disableSubmitButtons(form);
        markSubmitted(form);
    }, true); // capture para interceptar rápido
})();

