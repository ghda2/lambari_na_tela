import { supabase } from './supabase-client.js';

// ===================================
// UTILITIES
// ===================================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
        if (k === 'class') node.className = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k.startsWith('on')) node.addEventListener(k.slice(2).toLowerCase(), v);
        else node.setAttribute(k, v);
    });
    (Array.isArray(children) ? children : [children]).forEach(c => {
        if (c == null) return;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
}

function parseJsonIfNeeded(value) {
    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
        try {
            return JSON.parse(value);
        } catch (e) { /* ignore */ }
    }
    return value;
}

function isImagePath(p) {
    return typeof p === 'string' && 
           (p.startsWith('/uploads/') && /\.(png|jpe?g|gif|webp|avif)$/i.test(p));
}

function isPdfPath(p) {
    return typeof p === 'string' && 
           (p.startsWith('/uploads/') && /\.pdf$/i.test(p));
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function showToast(message, type = 'info') {
    const toastContainer = $('#toast-container');
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    
    const toast = el('div', { class: `toast ${type}` }, [
        el('i', { class: `fas ${icons[type]}` }),
        el('span', {}, message)
    ]);
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===================================
// API FUNCTIONS
// ===================================
async function fetchRecord(table, id) {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
    if (error) throw error;
    return data;
}

async function deleteRecord(table, id) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
}

async function updateRecord(table, id, updates) {
    const { error } = await supabase.from(table).update(updates).eq('id', id);
    if (error) throw error;
}

// ===================================
// IMAGE GALLERY
// ===================================
let currentGalleryImages = [];
let currentGalleryIndex = 0;

function initGallery(images) {
    if (!images || images.length === 0) {
        $('#image-gallery').style.display = 'none';
        return;
    }
    
    currentGalleryImages = images;
    currentGalleryIndex = 0;
    
    $('#image-gallery').style.display = 'block';
    updateGalleryImage();
    renderThumbnails();
    
    $('#gallery-prev').addEventListener('click', () => {
        currentGalleryIndex = (currentGalleryIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
        updateGalleryImage();
    });
    
    $('#gallery-next').addEventListener('click', () => {
        currentGalleryIndex = (currentGalleryIndex + 1) % currentGalleryImages.length;
        updateGalleryImage();
    });
    
    // Lightbox
    $('#main-image').addEventListener('click', () => {
        $('#lightbox').classList.add('show');
        $('#lightbox-image').src = currentGalleryImages[currentGalleryIndex];
    });
    
    $('#lightbox-close').addEventListener('click', () => {
        $('#lightbox').classList.remove('show');
    });
    
    $('#lightbox').addEventListener('click', (e) => {
        if (e.target === $('#lightbox')) {
            $('#lightbox').classList.remove('show');
        }
    });
    
    // Comprovante modal
    $('#comprovante-close').addEventListener('click', () => {
        $('#comprovante-modal').classList.remove('show');
    });
    
    $('#comprovante-modal').addEventListener('click', (e) => {
        if (e.target === $('#comprovante-modal')) {
            $('#comprovante-modal').classList.remove('show');
        }
    });
}

function updateGalleryImage() {
    const localPath = currentGalleryImages[currentGalleryIndex].replace('/uploads/', '../uploads/');
    $('#main-image').src = localPath;
    
    // Update thumbnails
    $$('.gallery-thumbnails img').forEach((img, i) => {
        img.classList.toggle('active', i === currentGalleryIndex);
    });
}

function renderThumbnails() {
    const container = $('#gallery-thumbnails');
    container.innerHTML = '';
    
    currentGalleryImages.forEach((imgPath, index) => {
        const localPath = imgPath.replace('/uploads/', '../uploads/');
        const thumb = el('img', {
            src: localPath,
            alt: `Miniatura ${index + 1}`,
            onclick: () => {
                currentGalleryIndex = index;
                updateGalleryImage();
            }
        });
        
        if (index === 0) thumb.classList.add('active');
        container.appendChild(thumb);
    });
}

// ===================================
// RENDER DETAILS
// ===================================
function renderRecordDetails(record, table) {
    const typeIcons = {
        pets_perdidos: { icon: 'fa-paw', label: 'Pet Perdido', color: '#8B5CF6' },
        objetos_perdidos: { icon: 'fa-search', label: 'Objeto Perdido', color: '#3B82F6' },
        propagandas: { icon: 'fa-bullhorn', label: 'Propaganda', color: '#F59E0B' },
        reportagens: { icon: 'fa-newspaper', label: 'Reportagem', color: '#10B981' }
    };
    
    const typeInfo = typeIcons[table] || typeIcons.reportagens;
    const title = record.nome || record.titulo || `Item #${record.id}`;
    
    // Update header
    $('#item-title').textContent = title;
    $('#item-type').textContent = typeInfo.label;
    $('#item-type').style.background = typeInfo.color;
    $('#item-date').textContent = formatDate(record.created_at);
    
    // Process images
    const images = [];
    Object.entries(record).forEach(([key, rawValue]) => {
        const value = parseJsonIfNeeded(rawValue);
        if ((Array.isArray(value) && value.length > 0 && isImagePath(value[0]))) {
            images.push(...value);
        } else if (isImagePath(value)) {
            images.push(value);
        }
    });
    
    if (images.length > 0) {
        initGallery(images);
    }
    
    // Render details grid
    const grid = $('#details-grid');
    grid.innerHTML = '';
    
    const mainFields = ['nome', 'titulo', 'descricao', 'caracteristicas', 'local', 'contato'];
    const additionalFields = [];
    
    Object.entries(record).forEach(([key, rawValue]) => {
        if (key === 'id' || key === 'created_at' || key.includes('foto') || key.includes('imagem') || key === 'comprovante_pagamento') return;
        
        const value = parseJsonIfNeeded(rawValue);
        
        // Skip image fields
        if ((Array.isArray(value) && value.length > 0 && isImagePath(value[0])) || isImagePath(value)) {
            return;
        }
        
        const field = {
            key,
            label: key.replace(/_/g, ' '),
            value: value != null ? value.toString() : 'N/A'
        };
        
        if (mainFields.includes(key)) {
            const fieldEl = el('div', { class: 'detail-field' }, [
                el('label', {}, field.label),
                el('p', {}, field.value)
            ]);
            grid.appendChild(fieldEl);
        } else {
            additionalFields.push(field);
        }
    });
    
    // Render additional info
    if (additionalFields.length > 0) {
        const infoGrid = $('#info-grid');
        infoGrid.innerHTML = '';
        
        additionalFields.forEach(field => {
            const fieldEl = el('div', { class: 'detail-field' }, [
                el('label', {}, field.label),
                el('p', {}, field.value)
            ]);
            infoGrid.appendChild(fieldEl);
        });
    }
    
    // Show content
    $('#loading-state').style.display = 'none';
    $('#details-content').style.display = 'block';
    
    // Setup action buttons
    setupActionButtons(table, record.id);
    
    // Setup comprovante button if exists
    setupComprovanteButton(record);
    
    // Setup download images button if exists
    setupDownloadImagesButton(record);
}

function setupActionButtons(table, recordId) {
    $('#btn-approve').addEventListener('click', async () => {
        if (!confirm('Deseja aprovar este item?')) return;
        try {
            await updateRecord(table, recordId, { aprovado: true });
            showToast('Item aprovado com sucesso!', 'success');
            setTimeout(() => window.location.href = 'index.html', 1500);
        } catch (e) {
            showToast('Erro ao aprovar item: ' + e.message, 'error');
        }
    });
    
    $('#btn-delete').addEventListener('click', async () => {
        if (!confirm('Deseja realmente excluir este item? Esta ação não pode ser desfeita.')) return;
        try {
            await deleteRecord(table, recordId);
            showToast('Item excluído com sucesso!', 'success');
            setTimeout(() => window.location.href = 'index.html', 1500);
        } catch (e) {
            showToast('Erro ao excluir item: ' + e.message, 'error');
        }
    });
}

function setupComprovanteButton(record) {
    let comprovantePath = record.comprovante_pagamento;
    console.log('setupComprovanteButton chamado');
    console.log('Comprovante path ORIGINAL:', comprovantePath);
    console.log('Tipo:', typeof comprovantePath);
    
    if (!comprovantePath) {
        console.log('Sem comprovante - retornando');
        return;
    }
    
    // Parse JSON se for string
    if (typeof comprovantePath === 'string') {
        try {
            const parsed = JSON.parse(comprovantePath);
            if (Array.isArray(parsed)) {
                comprovantePath = parsed[0];
                console.log('Parsed de string JSON para array, primeiro elemento:', comprovantePath);
            }
        } catch (e) {
            // Se não for JSON válido, assume que já é uma string simples
            console.log('Não é JSON, mantendo como string:', comprovantePath);
        }
    } else if (Array.isArray(comprovantePath)) {
        comprovantePath = comprovantePath[0];
        console.log('Era array, pegou primeiro elemento:', comprovantePath);
    }
    
    console.log('Comprovante path FINAL:', comprovantePath);
    console.log('isImagePath result:', isImagePath(comprovantePath));
    console.log('isPdfPath result:', isPdfPath(comprovantePath));
    
    const actionsDiv = $('.details-actions');
    
    if (!actionsDiv) {
        console.error('Elemento .details-actions não encontrado!');
        return;
    }
    
    let button;
    
    if (isImagePath(comprovantePath)) {
        console.log('Comprovante é imagem');
        // Button to display image in modal
        button = el('button', { 
            class: 'btn btn-primary',
            onclick: () => {
                const localPath = comprovantePath.replace('/uploads/', '../uploads/');
                $('#comprovante-image').src = localPath;
                $('#comprovante-modal').classList.add('show');
            }
        }, [
            el('i', { class: 'fas fa-eye' }),
            el('span', {}, ' Ver Comprovante')
        ]);
    } else if (isPdfPath(comprovantePath)) {
        console.log('Comprovante é PDF');
        // Button to download PDF
        button = el('button', { 
            class: 'btn btn-primary',
            onclick: () => {
                const localPath = comprovantePath.replace('/uploads/', '../uploads/');
                window.open(localPath, '_blank');
            }
        }, [
            el('i', { class: 'fas fa-download' }),
            el('span', {}, ' Baixar Comprovante')
        ]);
    } else {
        console.log('Comprovante não é imagem nem PDF:', comprovantePath);
        return;
    }
    
    console.log('Adicionando botão');
    actionsDiv.appendChild(button);
    console.log('Botão adicionado com sucesso!');
}

function setupDownloadImagesButton(record) {
    const images = [];
    Object.entries(record).forEach(([key, rawValue]) => {
        const value = parseJsonIfNeeded(rawValue);
        if ((Array.isArray(value) && value.length > 0 && isImagePath(value[0]))) {
            images.push(...value);
        } else if (isImagePath(value)) {
            images.push(value);
        }
    });
    
    if (images.length === 0) return;
    
    const actionsDiv = $('.details-actions');
    const button = el('button', { 
        class: 'btn btn-primary',
        onclick: () => {
            images.forEach(imgPath => {
                const localPath = imgPath.replace('/uploads/', '../uploads/');
                window.open(localPath, '_blank');
            });
        }
    }, [
        el('i', { class: 'fas fa-download' }),
        el('span', {}, ' Baixar Imagens')
    ]);
    
    actionsDiv.appendChild(button);
}

function showError(message) {
    $('#loading-state').style.display = 'none';
    $('#error-state').style.display = 'flex';
    $('#error-message').textContent = message;
}

// ===================================
// INITIALIZATION
// ===================================
async function main() {
    const params = new URLSearchParams(window.location.search);
    const recordId = params.get('id');

    if (!recordId) {
        showError('ID do registro não encontrado.');
        return;
    }

    const [table, id] = recordId.split('-');

    if (!table || !id) {
        showError('ID do registro inválido.');
        return;
    }

    try {
        const record = await fetchRecord(table, id);
        renderRecordDetails(record, table);
    } catch (e) {
        console.error('Erro ao carregar detalhes:', e);
        showError(`Ocorreu um erro ao carregar os detalhes: ${e.message}`);
    }
}

document.addEventListener('DOMContentLoaded', main);
