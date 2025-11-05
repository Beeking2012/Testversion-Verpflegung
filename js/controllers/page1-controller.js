/**
 * Controller für Seite 1 - Auswahl
 */

class Page1Controller {
    constructor() {
        this.selectedItem = null;
        this.cloudData = null;
        this.init();
    }

    async init() {
        await this.loadCloudData();
        this.renderSelections();
        this.setupEventListeners();
        
        console.log('Page1Controller initialisiert');
    }

    async loadCloudData() {
        try {
            const progressBar = document.getElementById('selection-progress');
            helpers.showElement(progressBar);
            
            this.cloudData = await cloudAPI.getInitialData();
            window.dataManager.syncData('cloudData', this.cloudData);
            
            helpers.hideElement(progressBar);
        } catch (error) {
            ErrorHandler.handleCloudError(error, 'fetch', { context: 'initial-data' });
            
            // Fallback: Lokale Daten verwenden
            this.cloudData = window.dataManager.localData.cloudData || {};
        }
    }

    renderSelections() {
        const container = document.getElementById('selection-container');
        
        if (!this.cloudData || !this.cloudData.selections) {
            container.innerHTML = '<div class="no-data">Keine Auswahloptionen verfügbar</div>';
            return;
        }

        const selectionsHTML = this.cloudData.selections.map(item => `
            <div class="selection-card ${item.id === this.selectedItem?.id ? 'selected' : ''}" 
                 data-id="${item.id}">
                <h3>${helpers.capitalize(item.name)}</h3>
                <p>${item.description || 'Keine Beschreibung verfügbar'}</p>
                <div class="selection-meta">
                    <span>Erstellt: ${helpers.formatDate(item.created)}</span>
                    <span class="selection-badge">${item.type || 'Standard'}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = selectionsHTML;

        // Event Listener für Auswahlkarten
        container.querySelectorAll('.selection-card').forEach(card => {
            card.addEventListener('click', () => {
                this.handleSelection(card);
            });
        });
    }

    handleSelection(cardElement) {
        const itemId = cardElement.getAttribute('data-id');
        const selectedItem = this.cloudData.selections.find(item => item.id === itemId);
        
        if (!selectedItem) return;

        // Auswahl visualisieren
        document.querySelectorAll('.selection-card').forEach(card => {
            card.classList.remove('selected');
        });
        cardElement.classList.add('selected');

        this.selectedItem = selectedItem;
        
        // Auswahl speichern und synchronisieren
        window.dataManager.syncData('userSelection', selectedItem);
        
        // Cloud über Auswahl informieren
        this.saveSelectionToCloud(selectedItem);
        
        console.log('Auswahl getroffen:', selectedItem);
    }

    async saveSelectionToCloud(selection) {
        try {
            await cloudAPI.saveUserSelection(selection);
            ErrorHandler.showUserNotification('Auswahl erfolgreich gespeichert', 'success');
        } catch (error) {
            ErrorHandler.handleCloudError(error, 'save', { context: 'user-selection' });
        }
    }

    setupEventListeners() {
        // Auf Daten-Updates von anderen Seiten hören
        window.dataManager.eventBus.addEventListener('dataChanged', (e) => {
            if (e.detail.key === 'cloudData') {
                this.cloudData = e.detail.data;
                this.renderSelections();
            }
        });

        // Auf Cloud-Updates reagieren
        window.addEventListener('crossPageMessage', (e) => {
            if (e.detail.type === 'cloudDataUpdated') {
                this.refreshCloudData();
            }
        });
    }

    async refreshCloudData() {
        try {
            this.cloudData = await cloudAPI.getInitialData();
            window.dataManager.syncData('cloudData', this.cloudData, false); // Kein Cross-Page Event
            this.renderSelections();
        } catch (error) {
            ErrorHandler.handleCloudError(error, 'fetch', { context: 'refresh-data' });
        }
    }

    // Lifecycle Methods für App-Routing
    onEnter() {
        console.log('Page1 betreten');
        // Eventuell Daten aktualisieren wenn nötig
    }

    onLeave() {
        console.log('Page1 verlassen');
        // Cleanup wenn nötig
    }

    handleGlobalMessage(message) {
        // Globale Nachrichten verarbeiten
        if (message.type === 'forceRefresh') {
            this.refreshCloudData();
        }
    }

    handleDataChange(detail) {
        // Datenänderungen verarbeiten
        if (detail.key === 'userSelection' && detail.source === 'crossPage') {
            // Auswahl von anderer Seite aktualisieren
            this.selectedItem = detail.data;
            this.renderSelections();
        }
    }
}
