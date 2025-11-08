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
    return digits.length === 10 || digits.length === 11;
}
