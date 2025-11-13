function acceptPolicy() {
    document.getElementById('policy-modal').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
    document.dispatchEvent(new Event('chat:start'));
}

function acceptPaymentNotice() {
    document.getElementById('policy-modal').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
    document.dispatchEvent(new Event('chat:start'));
}

async function copyPixKey() {
    const pixKeyInput = document.getElementById('pix-key');
    if (!pixKeyInput) return;

    const pixKey = pixKeyInput.value;
    const btn = document.querySelector('.copy-btn');
    const originalText = btn.textContent;

    try {
        await navigator.clipboard.writeText(pixKey);
        btn.textContent = '✅ Copiado!';
        btn.style.background = '#45a049';
    } catch (err) {
        console.error('Falha ao copiar com a API do Clipboard:', err);
        // Fallback para execCommand
        try {
            pixKeyInput.select();
            document.execCommand('copy');
            btn.textContent = '✅ Copiado!';
            btn.style.background = '#45a049';
        } catch (fallbackErr) {
            console.error('Falha no fallback de cópia:', fallbackErr);
            alert('Não foi possível copiar. Copie manualmente: ' + pixKey);
        }
    } finally {
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '#4caf50';
        }, 2000);
    }
}
