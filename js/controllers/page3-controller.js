/**
 * Controller für Seite 3 - Berechnung & Eigene Items
 */

class Page3Controller {
    constructor() {
        this.ownItems = {};
        this.calculationResult = null;
        this.init();
    }

    async init() {
        await this.loadOwnItems();
        this.setupEventListeners();
        this.renderOwnItems();
        this.checkForCalculationData();
        
        console.log('Page3Controller initialisiert');
    }

    async loadOwnItems() {
        try {
            const items = await cloudAPI.loadPage3Items();
            this.ownItems = items || {};
            window.dataManager.syncData('page3Items', this.ownItems);
        } catch (error) {
            // Fallback: Lokale Daten
            this.ownItems = window.dataManager.localData.page3Items || {};
            ErrorHandler.handleCloudError(error, 'fetch', { context: 'page3-items' });
        }
    }

    renderOwnItems() {
        const container = document.getElementById('own-items-management');
        
        if (Object.keys(this.ownItems).length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Noch keine eigenen Items vorhanden</p>
                    <button class="btn-primary" onclick="document.getElementById('add-item-btn').click()">
                        Erstes Item hinzufügen
                    </button>
                </div>
            `;
            return;
        }

        const itemsHTML = Object.values(this.ownItems).map(item => `
            <div class="own-item" data-id="${item.id}">
                <div class="item-info">
                    <strong>${item.name}</strong>
                    <p>${item.description || 'Keine Beschreibung'}</p>
                    <small>Erstellt: ${helpers.formatDate(item.timestamp)}</small>
                </div>
                <div class="item-actions">
                    <button class="item-action edit-item" title="Bearbeiten">
                        ✏️
                    </button>
                    <button class="item-action delete-item" title="Löschen">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = itemsHTML;

        // Event Listener für Item-Aktionen
        container.querySelectorAll('.edit-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('.own-item').getAttribute('data-id');
                this.editItem(itemId);
            });
        });

        container.querySelectorAll('.delete-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('.own-item').getAttribute('data-id');
                this.deleteItem(itemId);
            });
        });
    }

    async performCalculation() {
        const userSelection = window.dataManager.localData.userSelection;
        const cloudData = window.dataManager.localData.cloudData;
        const comparisonResult = window.dataManager.localData.comparisonResult;

        if (!userSelection) {
            this.showCalculationMessage('Bitte zuerst eine Auswahl auf Seite 1 treffen');
            return;
        }

        try {
            this.showCalculationLoading();

            // Berechnung durchführen (hier kann komplexe Logik stehen)
            this.calculationResult = this.calculateResults(userSelection, cloudData, comparisonResult);
            
            window.dataManager.syncData('calculationResult', this.calculationResult);
            this.renderCalculationResult();

            // Ergebnis zur Cloud senden
            await cloudAPI.saveCalculation(this.calculationResult);

        } catch (error) {
            ErrorHandler.handleCloudError(error, 'calculate', { 
                context: 'calculation',
                selection: userSelection 
            });
            this.showCalculationError(error);
        }
    }

    calculateResults(selection, cloudData, comparison) {
        // Beispielhafte Berechnungen
        const calculations = {
            basisWert: selection.value || 0,
            cloudMultiplikator: cloudData.multiplier || 1,
            abweichungsFaktor: comparison ? comparison.mismatches.length * 0.1 : 1,
            confidenceScore: comparison ? 
                (comparison.matches.length / (comparison.matches.length + comparison.mismatches.length)) * 100 : 0
        };

        // Ergebnisse berechnen
        return {
            grundlage: selection.name,
            berechnungen: {
                endErgebnis: calculations.basisWert * calculations.cloudMultiplikator * calculations.abweichungsFaktor,
                zuverlaessigkeit: calculations.confidenceScore,
                komplexitaetsScore: (selection.complexity || 1) * calculations.abweichungsFaktor,
                risikoFaktor: Math.max(0, 1 - calculations.confidenceScore / 100)
            },
            meta: {
                berechnungsZeit: Date.now(),
                datenQuellen: ['userSelection', 'cloudData', 'comparisonResult'],
                version: '1.0'
            }
        };
    }

    renderCalculationResult() {
        const container = document.getElementById('calculation-result');
        
        if (!this.calculationResult) {
            container.innerHTML = '<div class="no-data">Keine Berechnungsergebnisse</div>';
            return;
        }

        const { berechnungen, meta } = this.calculationResult;
        
        const resultsHTML = `
            <div class="result-item">
                <span>Endergebnis:</span>
                <span class="result-value">${helpers.formatNumber(berechnungen.endErgebnis)}</span>
            </div>
            <div class="result-item">
                <span>Zuverlässigkeit:</span>
                <span class="result-value">${helpers.formatNumber(berechnungen.zuverlaessigkeit)}%</span>
            </div>
            <div class="result-item">
                <span>Komplexitäts-Score:</span>
                <span class="result-value">${helpers.formatNumber(berechnungen.komplexitaetsScore)}</span>
            </div>
            <div class="result-item">
                <span>Risiko-Faktor:</span>
                <span class="result-value">${helpers.formatNumber(berechnungen.risikoFaktor)}</span>
            </div>
            <div class="result-meta">
                <small>Berechnet: ${helpers.formatDate(meta.berechnungsZeit)}</small>
            </div>
        `;

        container.innerHTML = resultsHTML;
    }

    // Item Management
    async handleItemSubmit(itemData) {
        try {
            if (itemData.id) {
                // Bestehendes Item aktualisieren
                this.ownItems[itemData.id] = {
                    ...this.ownItems[itemData.id],
                    ...itemData,
                    updated: Date.now()
                };
            } else {
                // Neues Item erstellen
                const newId = helpers.generateId('item_');
                this.ownItems[newId] = {
                    ...itemData,
                    id: newId,
                    created: Date.now()
                };
            }

            window.dataManager.syncData('page3Items', this.ownItems);
            this.renderOwnItems();

            // Zur Cloud synchronisieren
            await cloudAPI.savePage3Items(this.ownItems);
            
            ErrorHandler.showUserNotification('Item erfolgreich gespeichert', 'success');
            
        } catch (error) {
            ErrorHandler.handleCloudError(error, 'save', { context: 'page3-item', item: itemData });
            throw error;
        }
    }

    editItem(itemId) {
        const item = this.ownItems[itemId];
        if (item) {
            window.app.showModal('Item bearbeiten', item);
        }
    }

    async deleteItem(itemId) {
        if (confirm('Möchten Sie dieses Item wirklich löschen?')) {
            try {
                delete this.ownItems[itemId];
                window.dataManager.syncData('page3Items', this.ownItems);
                this.renderOwnItems();

                // Cloud synchronisieren
                await cloudAPI.savePage3Items(this.ownItems);
                
                ErrorHandler.showUserNotification('Item gelöscht', 'success');
            } catch (error) {
                ErrorHandler.handleCloudError(error, 'delete', { context: 'page3-item', itemId });
            }
        }
    }

    async syncItemsToCloud() {
        try {
            await cloudAPI.savePage3Items(this.ownItems);
            ErrorHandler.showUserNotification('Items zur Cloud synchronisiert', 'success');
        } catch (error) {
            ErrorHandler.handleCloudError(error, 'sync', { context: 'page3-items-sync' });
        }
    }

    // UI States
    showCalculationLoading() {
        const container = document.getElementById('calculation-result');
        container.innerHTML = '<div class="loading-spinner">Berechne...</div>';
    }

    showCalculationMessage(message) {
        const container = document.getElementById('calculation-result');
        container.innerHTML = `
            <div class="info-message">
                <p>${message}</p>
            </div>
        `;
    }

    showCalculationError(error) {
        const container = document.getElementById('calculation-result');
        container.innerHTML = `
            <div class="error-state">
                <p>Berechnung fehlgeschlagen: ${error.message}</p>
                <button class="btn-secondary" onclick="page3Controller.performCalculation()">
                    Erneut versuchen
                </button>
            </div>
        `;
    }

    setupEventListeners() {
        // Auf Datenänderungen reagieren
        window.dataManager.eventBus.addEventListener('dataChanged', (e) => {
            if (e.detail.key === 'userSelection' || e.detail.key === 'comparisonResult') {
                // Bei neuen Daten automatisch Berechnung durchführen
                this.performCalculation();
            }
        });

        // Manuelle Berechnung (falls benötigt)
        const calculateBtn = document.createElement('button');
        calculateBtn.className = 'btn-primary';
        calculateBtn.textContent = 'Berechnung starten';
        calculateBtn.style.marginTop = '1rem';
        calculateBtn.addEventListener('click', () => this.performCalculation());

        document.getElementById('calculation-result')?.parentNode?.appendChild(calculateBtn);
    }

    onEnter() {
        console.log('Page3 betreten');
        // Berechnung aktualisieren falls nötig
        this.performCalculation();
    }

    onLeave() {
        console.log('Page3 verlassen');
    }

    handleGlobalMessage(message) {
        if (message.type === 'itemsUpdated') {
            this.loadOwnItems();
        }
    }

    handleDataChange(detail) {
        if (detail.key === 'page3Items' && detail.source === 'crossPage') {
            this.ownItems = detail.data;
            this.renderOwnItems();
        }
    }
}

// Global verfügbar für manuelle Aufrufe
window.page3Controller = new Page3Controller();
