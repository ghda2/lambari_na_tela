// Supabase configuration for frontend
const SUPABASE_URL = 'https://wgifmlnbztpdydwfaejm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnaWZtbG5ienRwZHlkd2ZhZWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NzMwNjIsImV4cCI6MjA3ODU0OTA2Mn0.5JC0yjFxkP0xBCM_iSw9mlrX6xlmNmn59ushoXkVWDQ'; // Replace with your actual anon key

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to upload file locally
async function uploadFileLocally(file, baseName = '', fieldId = '') {
    const formData = new FormData();
    formData.append('file', file);
    if (baseName) {
        formData.append('baseName', baseName);
    }

    const endpoint = fieldId === 'comprovante_pagamento' ? '/upload-comprovante' : '/upload';

    const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const errorText = await response.text();
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.error || 'Erro no upload');
        } catch (e) {
            // Se não for JSON, a resposta é provavelmente uma página de erro HTML
            throw new Error(`Erro no servidor: ${response.status} ${response.statusText}. Resposta: ${errorText}`);
        }
    }

    const result = await response.json();
    return result.filepath; // Retorna o caminho relativo do arquivo
}

// Function to submit form data to Supabase
async function submitToSupabase(tableName, formData) {
    const { data, error } = await supabaseClient
        .from(tableName)
        .insert([formData]);

    if (error) {
        throw error;
    }

    return data;
}

// Export functions for use in other scripts
window.SupabaseUtils = {
    uploadFileLocally,
    submitToSupabase,
    supabaseClient
};

// Confirmar que o módulo foi carregado
console.log('✅ SupabaseUtils carregado com sucesso:', {
    uploadFileLocally: typeof uploadFileLocally,
    submitToSupabase: typeof submitToSupabase,
    supabaseClient: typeof supabaseClient
});