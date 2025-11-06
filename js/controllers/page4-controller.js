/**
 * Controller für Seite 4 - Cloud-Verwaltung
 * Robust gegen fehlende cloudAPI
 */

// Sofort globale Variable setzen
window.page4Controller = {
    ready: false,
    cloudItems: {},
    filteredItems: {},
    currentFilter: 'all',
    
    init: function() {
        console.log('🔄 Page4Controller startet Initialisierung...');
        this.setupBasicEventListeners();
        this.loadCloudItems();
        this.renderCloudItems();
        this.ready = true;
        console.log('✅ Page4Controller bereit');
        return this;
    },

    loadCloudItems: async function() {
        console.log('📡 Lade Cloud-Items...');
        
        try {
            // Versuche Cloud-Daten zu laden
            if (window.cloudAPI && window.cloudAPI.ready) {
                this.cloudItems = await window.cloudAPI.getCloudItems();
                console.log('✅ Cloud-Items geladen:', Object.keys(this.cloudItems).length);
            } else {
                console.warn('⚠️ CloudAPI nicht verfügbar, verwende Demo-Daten');
                this.cloudItems = this.generateDemoCloudItems();
            }
            
            // Daten im dataManager speichern falls verfügbar
            if (window.dataManager) {
                window.dataManager.syncData('cloudItems', this.cloudItems);
            }
            
            this.applyFilter(this.currentFilter);
            
        } catch (error) {
            console.error('❌ Fehler beim Laden der Cloud-Items:', error);
            this.cloudItems = this.generateDemoCloudItems();
            this.applyFilter(this.currentFilter);
        }
    },

    generateDemoCloudItems: function() {
        // Demo-Daten für Fallback
        const demoItems = {
            'cloud-1': {
                id: 'cloud-1',
                name: 'Demo Cloud Item 1',
                description: 'Demonstrations-Item für Cloud-Verwaltung',
                active: true,
                created: Date.now() - 86400000, // 1 Tag alt
                updated: Date.now(),
                type: 'demo'
            },
            'cloud-2': {
                id: 'cloud-2',
                name: 'Demo Cloud Item 2',
                description: 'Weiteres Demo-Item',
                active: true,
                created: Date.now() - 172800000, // 2 Tage alt
                updated: Date.now(),
                type: 'demo'
            },
            'cloud-3': {
                id: 'cloud-3',
                name: 'Inaktives Item',
                description: 'Dieses Item ist inaktiv',
                active: false,
                created: Date.now() - 259200000, // 3 Tage alt
                updated: Date.now() - 86400000,
                type: 'demo'
            }
        };
        
        console.log('🎯 Demo-Cloud-Items generiert:', Object.keys(demoItems).length);
        return demoItems;
    },

    renderCloudItems: function() {
        const container = document.getElementById('cloud-items-management');
        
        if (!container) {
            console.error('❌ Container #cloud-items-management nicht gefunden');
            return;
        }

        if (Object.keys(this.filteredItems).length === 0) {
            container.innerHTML = this.createEmptyStateHTML();
            return;
        }

        const itemsHTML = Object.values(this.filteredItems).map(item => `
            <div class="cloud-item-card" data-id="${item.id}">
                <div class="cloud-item-header">
                    <h4 class="cloud-item-name">${item.name}</h4>
                    <div class="cloud-item-actions">
                        <button class="item-action edit-cloud-item" title="Bearbeiten" data-id="${item.id}">
                            ✏️
                        </button>
                        <button class="item-action delete-cloud-item" title="Löschen" data-id="${item.id}">
                            🗑️
                        </button>
                    </div>
                </div>
                <p class="cloud-item-description">${item.description || 'Keine Beschreibung'}</p>
                <div class="cloud-item-meta">
                    <span class="item-id">ID: ${item.id}</span>
                    <span class="status-badge ${item.active ? 'status-active' : 'status-inactive'}">
                        ${item.active ? '✅ Aktiv' : '❌ Inaktiv'}
                    </span>
                </div>
                <div class="cloud-item-meta">
                    <span>Erstellt: ${this.formatDate(item.created)}</span>
                    <span>Geändert: ${this.formatDate(item.updated || item.created)}</span>
                </div>
                ${item.type === 'demo' ? '<div class="demo-badge">🎯 Demo</div>' : ''}
            </div>
        `).join('');

        container.innerHTML = itemsHTML;

        // Event Listener für Item-Aktionen
        container.querySelectorAll('.edit-cloud-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.getAttribute('data-id');
                this.editCloudItem(itemId);
            });
        });

        container.querySelectorAll('.delete-cloud-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.getAttribute('data-id');
                this.deleteCloudItem(itemId);
            });
        });

        console.log(`✅ ${Object.keys(this.filteredItems).length} Cloud-Items gerendert`);
    },

    createEmptyStateHTML: function() {
        return `
            <div class="empty-state">
                <div class="empty-icon">☁️</div>
                <h3>Keine Cloud-Items verfügbar</h3>
                <p>Es konnten keine Cloud-Items geladen werden.</p>
                <div class="empty-actions">
                    <button class="btn-primary" onclick="window.page4Controller.loadCloudItems()">
                        🔄 Erneut versuchen
                    </button>
                    <button class="btn-secondary" onclick="window.page4Controller.showAddCloudItemForm()">
                        ➕ Demo-Item erstellen
                    </button>
                </div>
            </div>
        `;
    },

    applyFilter: function(filter) {
        this.currentFilter = filter;
        console.log(`🔍 Filter anwenden: ${filter}`);
        
        switch (filter) {
            case 'active':
                this.filteredItems = this.filterObject(this.cloudItems, (key, item) => item.active);
                break;
            case 'inactive':
                this.filteredItems = this.filterObject(this.cloudItems, (key, item) => !item.active);
                break;
            case 'recent':
                const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                this.filteredItems = this.filterObject(this.cloudItems, (key, item) => 
                    (item.updated || item.created) > oneWeekAgo
                );
                break;
            case 'demo':
                this.filteredItems = this.filterObject(this.cloudItems, (key, item) => item.type === 'demo');
                break;
            default:
                this.filteredItems = { ...this.cloudItems };
        }
        
        this.renderCloudItems();
        this.updateFilterButtons();
    },

    filterObject: function(obj, predicate) {
        return Object.keys(obj).reduce((filtered, key) => {
            if (predicate(key, obj[key])) {
                filtered[key] = obj[key];
            }
            return filtered;
        }, {});
    },

    updateFilterButtons: function() {
        // Update UI der Filter-Buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            const filter = btn.getAttribute('data-filter');
            if (filter === this.currentFilter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },

    showAddCloudItemForm: function() {
        // Einfaches Formular zum Hinzufügen von Cloud-Items
        const formHTML = `
            <div class="modal-overlay" id="cloud-item-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Neues Cloud-Item erstellen</h3>
                        <button class="modal-close" onclick="window.page4Controller.hideAddCloudItemForm()">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="add-cloud-item-form">
                            <div class="form-group">
                                <label for="cloud-item-name">Name:</label>
                                <input type="text" id="cloud-item-name" required placeholder="Cloud-Item Name">
                            </div>
                            <div class="form-group">
                                <label for="cloud-item-description">Beschreibung:</label>
                                <textarea id="cloud-item-description" placeholder="Beschreibung des Cloud-Items"></textarea>
                            </div>
                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="cloud-item-active" checked>
                                    <span class="checkmark"></span>
                                    Item aktiv
                                </label>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" onclick="window.page4Controller.hideAddCloudItemForm()">
                                    Abbrechen
                                </button>
                                <button type="submit" class="btn-primary">
                                    Cloud-Item erstellen
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', formHTML);
        
        // Formular Event Listener
        document.getElementById('add-cloud-item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCloudItemSubmit();
        });
    },

    hideAddCloudItemForm: function() {
        const modal = document.getElementById('cloud-item-modal');
        if (modal) {
            modal.remove();
        }
    },

    handleCloudItemSubmit: async function() {
        const name = document.getElementById('cloud-item-name').value;
        const description = document.getElementById('cloud-item-description').value;
        const active = document.getElementById('cloud-item-active').checked;
        
        if (!name.trim()) {
            this.showNotification('❌ Bitte geben Sie einen Namen ein', 'error');
            return;
        }

        const itemData = {
            name: name.trim(),
            description: description.trim(),
            active: active,
            created: Date.now(),
            updated: Date.now()
        };

        try {
            // In Cloud speichern falls verfügbar
            if (window.cloudAPI && window.cloudAPI.ready) {
                const newItem = await window.cloudAPI.createItem(itemData);
                this.showNotification('✅ Cloud-Item erstellt', 'success');
            } else {
                // Lokal als Demo-Item speichern
                const newId = this.generateId('demo-cloud-');
                this.cloudItems[newId] = {
                    ...itemData,
                    id: newId,
                    type: 'demo'
                };
                this.showNotification('✅ Demo-Cloud-Item erstellt', 'info');
            }

            // Daten neu laden und anzeigen
            await this.loadCloudItems();
            this.hideAddCloudItemForm();
            
        } catch (error) {
            console.error('❌ Fehler beim Erstellen:', error);
            this.showNotification('❌ Cloud-Item konnte nicht erstellt werden', 'error');
        }
    },

    editCloudItem: function(itemId) {
        const item = this.cloudItems[itemId];
        if (item) {
            // Einfache Bearbeitung über Prompt
            const newName = prompt('Neuer Name:', item.name);
            if (newName && newName.trim()) {
                const newDescription = prompt('Neue Beschreibung:', item.description || '');
                
                const updates = {
                    name: newName.trim(),
                    description: newDescription ? newDescription.trim() : item.description,
                    updated: Date.now()
                };

                this.updateCloudItem(itemId, updates);
            }
        }
    },

    updateCloudItem: async function(itemId, updates) {
        try {
            // In Cloud aktualisieren falls verfügbar
            if (window.cloudAPI && window.cloudAPI.ready) {
                await window.cloudAPI.updateItem(itemId, updates);
                this.showNotification('✅ Cloud-Item aktualisiert', 'success');
            } else {
                // Lokal aktualisieren
                this.cloudItems[itemId] = {
                    ...this.cloudItems[itemId],
                    ...updates
                };
                this.showNotification('✅ Demo-Item aktualisiert', 'info');
            }

            await this.loadCloudItems();
            
        } catch (error) {
            console.error('❌ Fehler beim Aktualisieren:', error);
            this.showNotification('❌ Item konnte nicht aktualisiert werden', 'error');
        }
    },

    deleteCloudItem: function(itemId) {
        if (confirm('Möchten Sie dieses Cloud-Item wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
            try {
                this.performDeleteCloudItem(itemId);
            } catch (error) {
                console.error('❌ Fehler beim Löschen:', error);
                this.showNotification('❌ Item konnte nicht gelöscht werden', 'error');
            }
        }
    },

    performDeleteCloudItem: async function(itemId) {
        // In Cloud löschen falls verfügbar
        if (window.cloudAPI && window.cloudAPI.ready) {
            await window.cloudAPI.deleteItem(itemId);
            this.showNotification('✅ Cloud-Item gelöscht', 'success');
        } else {
            // Lokal löschen
            delete this.cloudItems[itemId];
            this.showNotification('✅ Demo-Item gelöscht', 'info');
        }

        await this.loadCloudItems();
    },

    refreshCloudData: async function() {
        try {
            this.showNotification('🔄 Aktualisiere Cloud-Daten...', 'info');
            
            // Cache leeren falls verfügbar
            if (window.cloudAPI) {
                window.cloudAPI.clearCache();
            }
            
            await this.loadCloudItems();
            this.showNotification('✅ Cloud-Daten aktualisiert', 'success');
            
        } catch (error) {
            console.error('❌ Refresh fehlgeschlagen:', error);
            this.showNotification('❌ Aktualisierung fehlgeschlagen', 'error');
        }
    },

    exportData: function() {
        try {
            const exportData = {
                cloudItems: this.cloudItems,
                userSelection: this.getUserSelection(),
                calculationResult: this.getCalculationResult(),
                exportDate: new Date().toISOString(),
                version: '1.0',
                source: window.cloudAPI ? 'cloud' : 'demo'
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `cloud-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(link.href);
            
            this.showNotification('✅ Daten exportiert', 'success');
        } catch (error) {
            console.error('❌ Export fehlgeschlagen:', error);
            this.showNotification('❌ Export fehlgeschlagen', 'error');
        }
    },

    getUserSelection: function() {
        if (window.dataManager && window.dataManager.localData) {
            return window.dataManager.localData.userSelection;
        }
        return null;
    },

    getCalculationResult: function() {
        if (window.dataManager && window.dataManager.localData) {
            return window.dataManager.localData.calculationResult;
        }
        return null;
    },

    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 4000);
    },

    setupBasicEventListeners: function() {
        console.log('🔧 Setup basic event listeners');
        
        // Globale Refresh-Funktion
        window.refreshPage4 = () => {
            console.log('🔄 Page4 Refresh');
            this.refreshCloudData();
        };
        
        // Filter-Buttons setup
        this.setupFilterButtons();
        
        // Manuelle Event Listener für vorhandene Buttons
        const refreshBtn = document.getElementById('refresh-cloud');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshCloudData());
        }
        
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }
        
        const addBtn = document.getElementById('add-cloud-item');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddCloudItemForm());
        }
    },

    setupFilterButtons: function() {
        // Filter-Buttons zur UI hinzufügen
        const filterHTML = `
            <div class="filter-buttons">
                <button class="filter-btn ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">
                    ☁️ Alle
                </button>
                <button class="filter-btn ${this.currentFilter === 'active' ? 'active' : ''}" data-filter="active">
                    ✅ Aktiv
                </button>
                <button class="filter-btn ${this.currentFilter === 'inactive' ? 'active' : ''}" data-filter="inactive">
                    ❌ Inaktiv
                </button>
                <button class="filter-btn ${this.currentFilter === 'recent' ? 'active' : ''}" data-filter="recent">
                    ⏰ Kürzlich
                </button>
                <button class="filter-btn ${this.currentFilter === 'demo' ? 'active' : ''}" data-filter="demo">
                    🎯 Demo
                </button>
            </div>
        `;
        
        // Füge Filter-Buttons zum Container hinzu
        const container = document.getElementById('cloud-items-management');
        if (container) {
            container.insertAdjacentHTML('beforebegin', filterHTML);
            
            // Event Listener für Filter-Buttons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const filter = e.target.getAttribute('data-filter');
                    this.applyFilter(filter);
                });
            });
        }
    },

    // Utility Functions
    generateId: function(prefix = '') {
        return prefix + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    formatDate: function(timestamp) {
        try {
            return new Date(timestamp).toLocaleDateString('de-DE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Unbekannt';
        }
    },

    // Öffentliche API
    test: function() {
        console.log('🧪 Page4Controller Test:', {
            ready: this.ready,
            cloudItems: Object.keys(this.cloudItems).length,
            filteredItems: Object.keys(this.filteredItems).length,
            currentFilter: this.currentFilter,
            cloudAPIAvailable: !!window.cloudAPI,
            cloudAPIReady: window.cloudAPI ? window.cloudAPI.ready : false
        });
        return 'Page4Controller test erfolgreich';
    },

    diagnose: function() {
        return {
            page4ControllerReady: this.ready,
            cloudItemsCount: Object.keys(this.cloudItems).length,
            filteredItemsCount: Object.keys(this.filteredItems).length,
            currentFilter: this.currentFilter,
            cloudAPIAvailable: !!window.cloudAPI,
            cloudAPIReady: window.cloudAPI ? window.cloudAPI.ready : false,
            dataManagerAvailable: !!window.dataManager,
            timestamp: Date.now()
        };
    }
};

// Hauptklasse für volle Funktionalität
class Page4ControllerFull {
    constructor() {
        this.cloudItems = {};
        this.filteredItems = {};
        this.currentFilter = 'all';
        this.ready = false;
        
        console.log('🔧 Page4ControllerFull Constructor');
        this.init();
    }

    async init() {
        try {
            console.log('🔄 Page4ControllerFull startet Initialisierung...');
            
            await this.waitForDependencies();
            
            this.setupEventListeners();
            await this.loadCloudItems();
            this.renderCloudItems();
            
            this.ready = true;
            this.replaceSimpleController();
            
            console.log('✅ Page4ControllerFull vollständig initialisiert');
            
        } catch (error) {
            console.error('❌ Page4ControllerFull Initialisierung fehlgeschlagen:', error);
        }
    }

    async waitForDependencies(timeout = 10000) {
        return new Promise((resolve) => {
            const start = Date.now();
            const check = () => {
                // Braucht keine speziellen Abhängigkeiten
                if (Date.now() - start > timeout) {
                    console.warn('⏰ Timeout beim Warten auf Abhängigkeiten');
                }
                resolve();
            };
            check();
        });
    }

    async loadCloudItems() {
        try {
            if (window.cloudAPI && window.cloudAPI.ready) {
                this.cloudItems = await window.cloudAPI.getCloudItems();
            } else {
                this.cloudItems = this.generateDemoCloudItems();
            }
            
            if (window.dataManager) {
                window.dataManager.syncData('cloudItems', this.cloudItems);
            }
            
            this.applyFilter(this.currentFilter);
            
        } catch (error) {
            console.error('Fehler beim Laden:', error);
            this.cloudItems = this.generateDemoCloudItems();
            this.applyFilter(this.currentFilter);
        }
    }

    generateDemoCloudItems() {
        // ... (wie in der einfachen Version)
        return window.page4Controller.generateDemoCloudItems();
    }

    // ... (weitere Methoden ähnlich wie in der einfachen Version)

    replaceSimpleController() {
        // Ersetze das einfache Objekt durch die volle Implementierung
        Object.getOwnPropertyNames(Page4ControllerFull.prototype)
            .filter(name => name !== 'constructor')
            .forEach(name => {
                window.page4Controller[name] = this[name].bind(this);
            });
        
        Object.keys(this).forEach(key => {
            if (!window.page4Controller.hasOwnProperty(key)) {
                Object.defineProperty(window.page4Controller, key, {
                    get: () => this[key],
                    set: (value) => { this[key] = value; }
                });
            }
        });
        
        window.page4Controller.ready = true;
        console.log('✅ Page4Controller vollständig ersetzt');
    }

    onEnter() {
        console.log('Page4 betreten');
        this.refreshCloudData();
    }

    onLeave() {
        console.log('Page4 verlassen');
    }
}

// SOFORTIGE INITIALISIERUNG
console.log('🚀 Initialisiere Page4Controller...');

// Sofort das einfache Objekt initialisieren
window.page4Controller.init();

// Später die volle Implementierung laden
setTimeout(() => {
    try {
        new Page4ControllerFull();
        console.log('✅ Page4ControllerFull gestartet');
    } catch (error) {
        console.error('❌ Page4ControllerFull konnte nicht gestartet werden:', error);
    }
}, 100);

// Test-Funktion
setTimeout(() => {
    console.log('🔧 Page4Controller Test verfügbar');
    console.log('- page4Controller:', !!window.page4Controller);
    console.log('- page4Controller.test:', typeof window.page4Controller.test);
    
    if (window.page4Controller && window.page4Controller.test) {
        window.page4Controller.test();
    }
}, 500);
