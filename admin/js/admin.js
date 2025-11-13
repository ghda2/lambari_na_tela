import { supabase } from './supabase-client.js';

// ===================================
// STATE MANAGEMENT
// ===================================
const state = {
    currentSection: 'dashboard',
    allRecords: [],
    filteredRecords: [],
    currentPage: 1,
    itemsPerPage: 12,
    searchQuery: '',
    filterStatus: 'all',
    sortBy: 'newest',
    stats: {
        pets_perdidos: 0,
        objetos_perdidos: 0,
        propagandas: 0,
        reportagens: 0
    }
};

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

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
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

function showLoading(show = true) {
    const loading = $('#loading-state');
    const empty = $('#empty-state');
    const grid = $('#publications-list');
    
    if (show) {
        loading.style.display = 'flex';
        empty.style.display = 'none';
        grid.style.display = 'none';
    } else {
        loading.style.display = 'none';
    }
}

// ===================================
// API FUNCTIONS
// ===================================
async function fetchTable(table) {
    const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(record => ({ ...record, _table: table }));
}

async function deleteRecord(table, id) {
    const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
    
    if (error) throw error;
}

async function updateRecord(table, id, updates) {
    const { error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id);
    
    if (error) throw error;
}

// ===================================
// DATA LOADING
// ===================================
async function loadAllData() {
    showLoading(true);
    
    try {
        const tables = ['pets_perdidos', 'objetos_perdidos', 'propagandas', 'reportagens'];
        const results = await Promise.all(tables.map(table => fetchTable(table)));
        
        state.allRecords = results.flat();
        
        // Update stats
        tables.forEach((table, index) => {
            state.stats[table] = results[index].length;
        });
        
        updateStats();
        filterAndSort();
        showLoading(false);
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showToast('Erro ao carregar dados: ' + error.message, 'error');
        showLoading(false);
    }
}

// ===================================
// FILTERING & SORTING
// ===================================
function filterAndSort() {
    let records = [...state.allRecords];
    
    // Filter by section
    if (state.currentSection !== 'dashboard') {
        records = records.filter(r => r._table === state.currentSection);
    }
    
    // Filter by search
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        records = records.filter(r => {
            const searchableText = [
                r.nome,
                r.titulo,
                r.descricao,
                r.local,
                r.contato,
                r.caracteristicas
            ].filter(Boolean).join(' ').toLowerCase();
            
            return searchableText.includes(query);
        });
    }
    
    // Sort
    records.sort((a, b) => {
        switch (state.sortBy) {
            case 'newest':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'oldest':
                return new Date(a.created_at) - new Date(b.created_at);
            case 'name':
                const nameA = (a.nome || a.titulo || '').toLowerCase();
                const nameB = (b.nome || b.titulo || '').toLowerCase();
                return nameA.localeCompare(nameB);
            default:
                return 0;
        }
    });
    
    state.filteredRecords = records;
    state.currentPage = 1;
    renderPublications();
}

// ===================================
// RENDERING
// ===================================
function updateStats() {
    $('#stat-pets').textContent = state.stats.pets_perdidos;
    $('#stat-objetos').textContent = state.stats.objetos_perdidos;
    $('#stat-propagandas').textContent = state.stats.propagandas;
    $('#stat-reportagens').textContent = state.stats.reportagens;
    
    $('#badge-pets').textContent = state.stats.pets_perdidos;
    $('#badge-objetos').textContent = state.stats.objetos_perdidos;
    $('#badge-propagandas').textContent = state.stats.propagandas;
    $('#badge-reportagens').textContent = state.stats.reportagens;
}

function renderPublications() {
    const grid = $('#publications-list');
    const empty = $('#empty-state');
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    const pageRecords = state.filteredRecords.slice(startIndex, endIndex);
    
    grid.innerHTML = '';
    
    if (pageRecords.length === 0) {
        grid.style.display = 'none';
        empty.style.display = 'flex';
        return;
    }
    
    grid.style.display = 'grid';
    empty.style.display = 'none';
    
    pageRecords.forEach(record => {
        const card = createPublicationCard(record);
        grid.appendChild(card);
    });
    
    updatePagination();
}

function createPublicationCard(record) {
    const typeIcons = {
        pets_perdidos: { icon: 'fa-paw', gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' },
        objetos_perdidos: { icon: 'fa-search', gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)' },
        propagandas: { icon: 'fa-bullhorn', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)' },
        reportagens: { icon: 'fa-newspaper', gradient: 'linear-gradient(135deg, #10B981, #059669)' }
    };
    
    const typeInfo = typeIcons[record._table] || typeIcons.reportagens;
    const title = record.nome || record.titulo || `Item #${record.id}`;
    const description = record.descricao || record.caracteristicas || 'Sem descrição';
    
    const cardIcon = el('div', { 
        class: 'card-icon',
        style: `background: ${typeInfo.gradient}`
    }, [
        el('i', { class: `fas ${typeInfo.icon}` })
    ]);
    
    const card = el('div', { class: 'publication-card' }, [
        el('div', { class: 'card-header' }, [
            cardIcon,
            el('div', { class: 'card-info' }, [
                el('h3', { class: 'card-title' }, title),
                el('div', { class: 'card-meta' }, [
                    el('span', { class: 'meta-badge' }, record._table.replace('_', ' ')),
                    el('span', { class: 'meta-date' }, formatDate(record.created_at))
                ])
            ])
        ]),
        el('div', { class: 'card-body' }, description),
        el('div', { class: 'card-footer' }, [
            el('button', { 
                class: 'card-action',
                onclick: () => {
                    const recordId = `${record._table}-${record.id}`;
                    window.location.href = `details.html?id=${recordId}`;
                }
            }, [
                el('i', { class: 'fas fa-eye' }),
                el('span', {}, ' Ver Detalhes')
            ]),
            el('button', { 
                class: 'card-action approve',
                onclick: (e) => {
                    e.stopPropagation();
                    approveRecord(record);
                }
            }, [
                el('i', { class: 'fas fa-check' }),
                el('span', {}, ' Aprovar')
            ]),
            el('button', { 
                class: 'card-action reject',
                onclick: (e) => {
                    e.stopPropagation();
                    deleteRecordConfirm(record);
                }
            }, [
                el('i', { class: 'fas fa-trash' }),
                el('span', {}, ' Excluir')
            ])
        ])
    ]);
    
    return card;
}

function updatePagination() {
    const totalPages = Math.ceil(state.filteredRecords.length / state.itemsPerPage);
    
    $('#current-page').textContent = state.currentPage;
    $('#total-pages').textContent = totalPages || 1;
    
    $('#prev-page').disabled = state.currentPage === 1;
    $('#next-page').disabled = state.currentPage >= totalPages;
}

function closeModal() {
    $('#detail-modal').classList.remove('show');
}

// ===================================
// ACTIONS
// ===================================
async function deleteRecordConfirm(record) {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    
    try {
        await deleteRecord(record._table, record.id);
        showToast('Item excluído com sucesso!', 'success');
        await loadAllData();
    } catch (error) {
        console.error('Erro ao excluir:', error);
        showToast('Erro ao excluir item: ' + error.message, 'error');
    }
}

async function approveRecord(record) {
    try {
        await updateRecord(record._table, record.id, { status: 'aprovado' });
        showToast('Item aprovado com sucesso!', 'success');
        await loadAllData();
    } catch (error) {
        console.error('Erro ao aprovar:', error);
        showToast('Erro ao aprovar item: ' + error.message, 'error');
    }
}

function exportData() {
    const dataStr = JSON.stringify(state.filteredRecords, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = el('a', { 
        href: url, 
        download: `export_${state.currentSection}_${Date.now()}.json` 
    });
    link.click();
    URL.revokeObjectURL(url);
    showToast('Dados exportados com sucesso!', 'success');
}

// ===================================
// EVENT LISTENERS
// ===================================
function initEventListeners() {
    // Mobile menu
    $('#mobile-menu-toggle')?.addEventListener('click', () => {
        $('#sidebar').classList.toggle('open');
    });
    
    $('#sidebar-close')?.addEventListener('click', () => {
        $('#sidebar').classList.remove('open');
    });
    
    // Navigation
    $$('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            $$('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            state.currentSection = item.dataset.section;
            
            // Update page title
            const titles = {
                dashboard: 'Dashboard',
                pets_perdidos: 'Pets Perdidos',
                objetos_perdidos: 'Objetos Perdidos',
                propagandas: 'Propagandas',
                reportagens: 'Reportagens'
            };
            
            $('#page-title').textContent = titles[state.currentSection];
            
            // Show/hide stats based on section
            if (state.currentSection === 'dashboard') {
                $('#stats-grid').style.display = 'grid';
                $('#page-subtitle').textContent = 'Visão geral do sistema';
            } else {
                $('#stats-grid').style.display = 'none';
                $('#page-subtitle').textContent = `Gerenciar ${titles[state.currentSection]}`;
            }
            
            filterAndSort();
            $('#sidebar').classList.remove('open');
        });
    });
    
    // Search
    $('#search-input').addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        filterAndSort();
    });
    
    // Filters
    $('#filter-status').addEventListener('change', (e) => {
        state.filterStatus = e.target.value;
        filterAndSort();
    });
    
    $('#sort-by').addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        filterAndSort();
    });
    
    // Pagination
    $('#prev-page').addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            renderPublications();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    
    $('#next-page').addEventListener('click', () => {
        const totalPages = Math.ceil(state.filteredRecords.length / state.itemsPerPage);
        if (state.currentPage < totalPages) {
            state.currentPage++;
            renderPublications();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    
    // Refresh
    $('#btn-refresh').addEventListener('click', async () => {
        $('#btn-refresh i').style.animation = 'spin 0.6s linear';
        await loadAllData();
        setTimeout(() => {
            $('#btn-refresh i').style.animation = '';
        }, 600);
    });
    
    // Export
    $('#btn-export').addEventListener('click', exportData);
    
    // Modal
    $('#modal-close').addEventListener('click', closeModal);
    $('#detail-modal').addEventListener('click', (e) => {
        if (e.target === $('#detail-modal')) closeModal();
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
    
    // Theme toggle
    $('#theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        const icon = $('#theme-toggle i');
        const text = $('#theme-toggle span');
        
        if (isDark) {
            icon.className = 'fas fa-sun';
            text.textContent = 'Modo Claro';
        } else {
            icon.className = 'fas fa-moon';
            text.textContent = 'Modo Escuro';
        }
    });
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        $('#theme-toggle i').className = 'fas fa-sun';
        $('#theme-toggle span').textContent = 'Modo Claro';
    }
}

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', async () => {
    initEventListeners();
    await loadAllData();
});
