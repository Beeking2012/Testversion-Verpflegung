/**
 * Controller für Seite 4 - Cloud-Verwaltung
 */

class Page4Controller {
    constructor() {
        this.cloudItems = {};
        this.filteredItems = {};
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        await this.loadCloudItems();
        this.setupEventListeners();
        this.renderCloudItems();
        
        console.log('Page4Controller initialisiert');
    }

    async loadCloudItems() {
        try {
            this.cloudItems = await cloudAPI.getCloudItems();
            window.dataManager.syncData('cloudItems', this.cloudItems);
            this.applyFilter(this.currentFilter);
        } catch (error) {
            // Fallback: Lokale Daten
            this.cloudItems = window.dataManager.localData.cloudItems || {};
            ErrorHandler.handleCloudError(error, 'fetch', { context: 'cloud-items' });
        }
    }

    renderCloudItems() {
        const container = document.getElementById('cloud-items-management');
        
        if (Object.keys(this.filteredItems).length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Keine Cloud-Items verfügbar</p>
                    <button class="btn-primary" onclick="document.getElementById('add-cloud-item').click()">
                        Erstes Cloud-Item erstellen
                    </button>
                </div>
            `;
            return;
        }

        const itemsHTML = Object.values(this.filteredItems).map(item => `
            <div class="cloud-item-card" data-id="${item.id}">
                <div class="cloud-item-header">
                    <h4 class="cloud-item-name">${item.name}</h4>
                    <div class="cloud-item-actions">
                        <button class="item-action edit-cloud-item" title="Bearbeiten">
                            ✏️
                        </button>
                        <button class="item-action delete-cloud-item" title="Löschen">
                            🗑️
                        </button>
                    </div>
                </div>
                <p class="cloud-item-description">${item.description || 'Keine Beschreibung'}</p>
                <div class="cloud-item-meta">
                    <span>ID: ${item.id}</span>
                    <span class="status-badge ${item.active ? 'status-active' : 'status-inactive'}">
                        ${item.active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                </div>
                <div class="cloud-item-meta">
                    <span>Erstellt: ${helpers.formatDate(item.created)}</span>
                    <span>Geändert: ${helpers.formatDate(item.updated || item.created)}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = itemsHTML;

        // Event Listener für Item-Aktionen
        container.querySelectorAll('.edit-cloud-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('.cloud-item-card').getAttribute('data-id');
                this.editCloudItem(itemId);
            });
        });

        container.querySelectorAll('.delete-cloud-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('.cloud-item-card').getAttribute('data-id');
                this.deleteCloudItem(itemId);
            });
        });
    }

    applyFilter(filter) {
        this.currentFilter = filter;
        
        switch (filter) {
            case 'active':
                this.filteredItems = helpers.filterObject(this.cloudItems, (key, item) => item.active);
                break;
            case 'inactive':
                this.filteredItems = helpers.filterObject(this.cloudItems, (key, item) => !item.active);
                break;
            case 'recent':
                const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                this.filteredItems = helpers.filterObject(this.cloudItems, (key, item) => 
                    item.updated > oneWeekAgo || item.created > oneWeekAgo
                );
                break;
            default:
                this.filteredItems = { ...this.cloudItems };
        }
        
        this.renderCloudItems();
    }

    // Cloud Item Management
    async handleItemSubmit(itemData) {
        try {
            if (itemData.id) {
                // Bestehendes Item aktualisieren
                await cloudAPI.updateItem(itemData.id, {
                    name: itemData.name,
                    description: itemData.description,
                    updated: Date.now()
                });
            } else {
                // Neues Item erstellen
                await cloudAPI.createItem({
                    name: itemData.name,
                    description: itemData.description,
                    active: true,
                    created: Date.now(),
                    updated: Date.now()
                });
            }

            // Daten neu laden
            await this.loadCloudItems();
            ErrorHandler.showUserNotification('Cloud-Item erfolgreich gespeichert', 'success');
            
        } catch (error) {
            ErrorHandler.handleCloudError(error, 'save', { context: 'cloud-item', item: itemData });
            throw error;
        }
    }

    editCloudItem(itemId) {
        const item = this.cloudItems[itemId];
        if (item) {
            window.app.showModal('Cloud-Item bearbeiten', item);
        }
    }

    async deleteCloudItem(itemId) {
        if (confirm('Möchten Sie dieses Cloud-Item wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
            try {
                await cloudAPI.deleteItem(itemId);
                await this.loadCloudItems();
                ErrorHandler.showUserNotification('Cloud-Item gelöscht', 'success');
            } catch (error) {
                ErrorHandler.handleCloudError(error, 'delete', { context: 'cloud-item', itemId });
            }
        }
    }

    async refreshCloudData() {
        try {
            ErrorHandler.showUserNotification('Aktualisiere Cloud-Daten...', 'info');
            
            // Cache leeren und neu laden
            cloudAPI.clearCache();
            await this.loadCloudItems();
            
            ErrorHandler.showUserNotification('Cloud-Daten aktualisiert', 'success');
        } catch (error) {
            ErrorHandler.handleCloudError(error, 'refresh', { context: 'cloud-data-refresh' });
        }
    }

    async exportData() {
        try {
            const exportData = {
                cloudItems: this.cloudItems,
                userSelection: window.dataManager.localData.userSelection,
                calculationResult: window.dataManager.localData.calculationResult,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `cloud-app-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(link.href);
            
            ErrorHandler.showUserNotification('Daten exportiert', 'success');
        } catch (error) {
            ErrorHandler.showUserNotification('Export fehlgeschlagen', 'error');
        }
    }

    setupEventListeners() {
        // Toolbar Buttons
        document.getElementById('refresh-cloud')?.addEventListener('click', () => {
            this.refreshCloudData();
        });

        document.getElementById('export-data')?.addEventListener('click', () => {
            this.exportData();
        });

        // Filter Buttons (könnten dynamisch erstellt werden)
        this.setupFilterButtons();

        // Auf Datenänderungen reagieren
        window.dataManager.eventBus.addEventListener('dataChanged', (e) => {
            if (e.detail.key === 'cloudItems') {
                this.cloudItems = e.detail.data;
                this.applyFilter(this.currentFilter);
            }
        });
    }

    setupFilterButtons() {
        // Filter-Buttons zur Toolbar hinzufügen
        const toolbar = document.querySelector('.toolbar');
        
        const filterContainer = helpers.createElement('div', ['filter-buttons']);
        filterContainer.innerHTML = `
            <button class="btn-filter ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all">Alle</button>
            <button class="btn-filter ${this.currentFilter === 'active' ? 'active' : ''}" data-filter="active">Aktiv</button>
            <button class="btn-filter ${this.currentFilter === 'inactive' ? 'active' : ''}" data-filter="inactive">Inaktiv</button>
            <button class="btn-filter ${this.currentFilter === 'recent' ? 'active' : ''}" data-filter="recent">Kürzlich</button>
        `;

        toolbar.appendChild(filterContainer);

        // Filter Event Listener
        filterContainer.querySelectorAll('.btn-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                
                // UI aktualisieren
                filterContainer.querySelectorAll('.btn-filter').forEach(b => {
                    b.classList.remove('active');
                });
                e.target.classList.add('active');
                
                // Filter anwenden
                this.applyFilter(filter);
            });
        });
    }

    onEnter() {
        console.log('Page4 betreten');
        // Beim Betreten Daten aktualisieren
        this.refreshCloudData();
    }

    onLeave() {
        console.log('Page4 verlassen');
    }

    handleGlobalMessage(message) {
        if (message.type === 'cloudDataUpdated') {
            this.refreshCloudData();
        }
    }

    handleDataChange(detail) {
        if (detail.key === 'cloudItems' && detail.source === 'crossPage') {
            this.cloudItems = detail.data;
            this.applyFilter(this.currentFilter);
        }
    }
}
