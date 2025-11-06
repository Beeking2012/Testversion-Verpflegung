/**
 * Controller für Seite 3 - Berechnung & Eigene Items
 * Robust gegen fehlende cloudAPI
 */

// Sofort globale Variable setzen
window.page3Controller = {
    ready: false,
    ownItems: {},
    calculationResult: null,
    
    init: function() {
        console.log('🔄 Page3Controller startet Initialisierung...');
        this.setupBasicEventListeners();
        this.loadOwnItems();
        this.renderOwnItems();
        this.ready = true;
        console.log('✅ Page3Controller bereit');
        return this;
    },

    loadOwnItems: async function() {
        console.log('📡 Lade eigene Items...');
        
        try {
            // Versuche Cloud-Daten zu laden
            if (window.cloudAPI && window.cloudAPI.ready) {
                const items = await window.cloudAPI.loadPage3Items();
                this.ownItems = items || {};
                console.log('✅ Cloud-Items geladen:', Object.keys(this.ownItems).length);
            } else {
                console.warn('⚠️ CloudAPI nicht verfügbar, verwende lokale Daten');
                this.ownItems = this.loadLocalItems();
            }
            
            // Daten im dataManager speichern falls verfügbar
            if (window.dataManager) {
                window.dataManager.syncData('page3Items', this.ownItems);
            }
            
        } catch (error) {
            console.error('❌ Fehler beim Laden der Items:', error);
            this.ownItems = this.loadLocalItems();
        }
    },

    loadLocalItems: function() {
        // Versuche Items aus localStorage zu laden
        try {
            const stored = localStorage.getItem('page3_ownItems');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.warn('❌ Konnte lokale Items nicht laden:', e);
        }
        
        // Fallback: Leere Daten
        return {};
    },

    saveLocalItems: function() {
        try {
            localStorage.setItem('page3_ownItems', JSON.stringify(this.ownItems));
            console.log('💾 Lokale Items gespeichert');
        } catch (e) {
            console.error('❌ Konnte lokale Items nicht speichern:', e);
        }
    },

    renderOwnItems: function() {
        const container = document.getElementById('own-items-management');
        
        if (!container) {
            console.error('❌ Container #own-items-management nicht gefunden');
            return;
        }

        if (Object.keys(this.ownItems).length === 0) {
            container.innerHTML = this.createEmptyStateHTML();
            return;
        }

        const itemsHTML = Object.values(this.ownItems).map(item => `
            <div class="own-item" data-id="${item.id}">
                <div class="item-info">
                    <strong>${item.name || 'Unbenannt'}</strong>
                    <p>${item.description || 'Keine Beschreibung'}</p>
                    <small>Erstellt: ${this.formatDate(item.timestamp || item.created)}</small>
                    ${item.value ? `<div class="item-value">Wert: ${item.value}</div>` : ''}
                </div>
                <div class="item-actions">
                    <button class="item-action edit-item" title="Bearbeiten" data-id="${item.id}">
                        ✏️
                    </button>
                    <button class="item-action delete-item" title="Löschen" data-id="${item.id}">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = itemsHTML;

        // Event Listener für Item-Aktionen
        container.querySelectorAll('.edit-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.getAttribute('data-id');
                this.editItem(itemId);
            });
        });

        container.querySelectorAll('.delete-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.getAttribute('data-id');
                this.deleteItem(itemId);
            });
        });

        console.log(`✅ ${Object.keys(this.ownItems).length} eigene Items gerendert`);
    },

    createEmptyStateHTML: function() {
        return `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h3>Noch keine eigenen Items</h3>
                <p>Fügen Sie Ihr erstes Item hinzu um zu beginnen.</p>
                <button class="btn-primary" onclick="window.page3Controller.showAddItemForm()">
                    ➕ Erstes Item hinzufügen
                </button>
            </div>
        `;
    },

    showAddItemForm: function() {
        // Einfaches Formular zum Hinzufügen von Items
        const formHTML = `
            <div class="modal-overlay" id="item-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Neues Item hinzufügen</h3>
                        <button class="modal-close" onclick="window.page3Controller.hideAddItemForm()">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="add-item-form">
                            <div class="form-group">
                                <label for="item-name">Name:</label>
                                <input type="text" id="item-name" required placeholder="Item Name">
                            </div>
                            <div class="form-group">
                                <label for="item-description">Beschreibung:</label>
                                <textarea id="item-description" placeholder="Item Beschreibung"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="item-value">Wert (optional):</label>
                                <input type="number" id="item-value" placeholder="123">
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" onclick="window.page3Controller.hideAddItemForm()">
                                    Abbrechen
                                </button>
                                <button type="submit" class="btn-primary">
                                    Item speichern
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', formHTML);
        
        // Formular Event Listener
        document.getElementById('add-item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleItemSubmit();
        });
    },

    hideAddItemForm: function() {
        const modal = document.getElementById('item-modal');
        if (modal) {
            modal.remove();
        }
    },

    handleItemSubmit: async function() {
        const name = document.getElementById('item-name').value;
        const description = document.getElementById('item-description').value;
        const value = document.getElementById('item-value').value;
        
        if (!name.trim()) {
            this.showNotification('❌ Bitte geben Sie einen Namen ein', 'error');
            return;
        }

        const itemData = {
            name: name.trim(),
            description: description.trim(),
            value: value ? parseFloat(value) : null,
            timestamp: Date.now()
        };

        try {
            // Neues Item erstellen
            const newId = this.generateId('item_');
            this.ownItems[newId] = {
                ...itemData,
                id: newId
            };

            // Lokal speichern
            this.saveLocalItems();
            
            // In Cloud speichern falls verfügbar
            if (window.cloudAPI && window.cloudAPI.ready) {
                await window.cloudAPI.savePage3Items(this.ownItems);
                this.showNotification('✅ Item in Cloud gespeichert', 'success');
            } else {
                this.showNotification('✅ Item lokal gespeichert', 'info');
            }

            // Daten im dataManager speichern
            if (window.dataManager) {
                window.dataManager.syncData('page3Items', this.ownItems);
            }

            this.renderOwnItems();
            this.hideAddItemForm();
            
        } catch (error) {
            console.error('❌ Fehler beim Speichern:', error);
            this.showNotification('❌ Item konnte nicht gespeichert werden', 'error');
        }
    },

    editItem: function(itemId) {
        const item = this.ownItems[itemId];
        if (item) {
            // Einfache Bearbeitung über Prompt
            const newName = prompt('Neuer Name:', item.name);
            if (newName && newName.trim()) {
                this.ownItems[itemId].name = newName.trim();
                this.ownItems[itemId].timestamp = Date.now();
                
                this.saveLocalItems();
                this.renderOwnItems();
                this.showNotification('✅ Item aktualisiert', 'success');
                
                // Cloud synchronisieren
                this.syncItemsToCloud();
            }
        }
    },

    deleteItem: function(itemId) {
        if (confirm('Möchten Sie dieses Item wirklich löschen?')) {
            try {
                delete this.ownItems[itemId];
                this.saveLocalItems();
                this.renderOwnItems();
                
                // Cloud synchronisieren
                this.syncItemsToCloud();
                
                this.showNotification('✅ Item gelöscht', 'success');
            } catch (error) {
                console.error('❌ Fehler beim Löschen:', error);
                this.showNotification('❌ Item konnte nicht gelöscht werden', 'error');
            }
        }
    },

    performCalculation: async function() {
        console.log('🧮 Starte Berechnung...');
        
        // Daten sammeln
        const userSelection = this.getUserSelection();
        const cloudData = this.getCloudData();
        const comparisonResult = this.getComparisonResult();

        if (!userSelection) {
            this.showCalculationMessage('⏳ Bitte zuerst eine Auswahl auf Seite 1 treffen');
            return;
        }

        try {
            this.showCalculationLoading();

            // Berechnung durchführen
            this.calculationResult = this.calculateResults(userSelection, cloudData, comparisonResult);
            
            // Ergebnis speichern
            if (window.dataManager) {
                window.dataManager.syncData('calculationResult', this.calculationResult);
            }

            this.renderCalculationResult();

            // Ergebnis zur Cloud senden falls verfügbar
            if (window.cloudAPI && window.cloudAPI.ready) {
                await window.cloudAPI.saveCalculation(this.calculationResult);
                this.showNotification('✅ Berechnung in Cloud gespeichert', 'success');
            }

        } catch (error) {
            console.error('❌ Berechnung fehlgeschlagen:', error);
            this.showCalculationError(error);
        }
    },

    getUserSelection: function() {
        if (window.dataManager && window.dataManager.localData) {
            return window.dataManager.localData.userSelection;
        }
        // Fallback: sessionStorage
        const stored = sessionStorage.getItem('userSelection');
        return stored ? JSON.parse(stored) : null;
    },

    getCloudData: function() {
        if (window.dataManager && window.dataManager.localData) {
            return window.dataManager.localData.cloudData;
        }
        return null;
    },

    getComparisonResult: function() {
        if (window.dataManager && window.dataManager.localData) {
            return window.dataManager.localData.comparisonResult;
        }
        return null;
    },

    calculateResults: function(selection, cloudData, comparison) {
        console.log('📊 Berechne Ergebnisse...', { selection, cloudData, comparison });

        // Beispielhafte Berechnungen
        const baseValue = selection.value || selection.id?.length || 1;
        const cloudMultiplier = cloudData?.multiplier || 1;
        const mismatchCount = comparison?.mismatches?.length || 0;
        const matchCount = comparison?.matches?.length || 0;
        
        const calculations = {
            basisWert: baseValue,
            cloudMultiplikator: cloudMultiplier,
            abweichungsFaktor: Math.max(0.5, 1 - (mismatchCount * 0.1)),
            confidenceScore: matchCount > 0 ? (matchCount / (matchCount + mismatchCount)) * 100 : 50
        };

        // Ergebnisse berechnen
        return {
            grundlage: selection.name || 'Unbekannte Auswahl',
            berechnungen: {
                endErgebnis: calculations.basisWert * calculations.cloudMultiplikator * calculations.abweichungsFaktor,
                zuverlaessigkeit: Math.round(calculations.confidenceScore),
                komplexitaetsScore: ((selection.complexity || 1) * calculations.abweichungsFactor * 10).toFixed(1),
                risikoFaktor: Math.max(0, (100 - calculations.confidenceScore) / 100).toFixed(2),
                itemsEinfluss: Object.keys(this.ownItems).length * 0.1
            },
            meta: {
                berechnungsZeit: Date.now(),
                datenQuellen: ['userSelection', 'cloudData', 'comparisonResult', 'ownItems'],
                version: '1.0',
                itemsAnzahl: Object.keys(this.ownItems).length
            }
        };
    },

    renderCalculationResult: function() {
        const container = document.getElementById('calculation-result');
        
        if (!container) {
            console.error('❌ Container #calculation-result nicht gefunden');
            return;
        }

        if (!this.calculationResult) {
            container.innerHTML = '<div class="no-data">Keine Berechnungsergebnisse</div>';
            return;
        }

        const { berechnungen, meta } = this.calculationResult;
        
        container.innerHTML = `
            <div class="calculation-header">
                <h3>📊 Berechnungsergebnisse</h3>
                <small>${this.formatTime(meta.berechnungsZeit)}</small>
            </div>
            <div class="results-grid">
                <div class="result-card">
                    <div class="result-label">Endergebnis</div>
                    <div class="result-value">${this.formatNumber(berechnungen.endErgebnis)}</div>
                </div>
                <div class="result-card">
                    <div class="result-label">Zuverlässigkeit</div>
                    <div class="result-value">${berechnungen.zuverlaessigkeit}%</div>
                </div>
                <div class="result-card">
                    <div class="result-label">Komplexität</div>
                    <div class="result-value">${berechnungen.komplexitaetsScore}</div>
                </div>
                <div class="result-card">
                    <div class="result-label">Risiko-Faktor</div>
                    <div class="result-value">${berechnungen.risikoFaktor}</div>
                </div>
            </div>
            <div class="calculation-meta">
                <p>Basierend auf ${meta.itemsAnzahl} eigenen Items und Cloud-Daten</p>
                <button class="btn-secondary" onclick="window.page3Controller.performCalculation()">
                    🔄 Neu berechnen
                </button>
            </div>
        `;
    },

    showCalculationLoading: function() {
        const container = document.getElementById('calculation-result');
        if (!container) return;
        
        container.innerHTML = `
            <div class="loading-state">
                <div class="spinner">⟳</div>
                <h3>Berechne Ergebnisse...</h3>
                <p>Bitte warten Sie, während die Berechnung durchgeführt wird.</p>
            </div>
        `;
    },

    showCalculationMessage: function(message) {
        const container = document.getElementById('calculation-result');
        if (!container) return;
        
        container.innerHTML = `
            <div class="info-message">
                <div class="info-icon">ℹ️</div>
                <p>${message}</p>
                <button class="btn-primary" onclick="window.page1Controller.goToPage1()">
                    Zur Auswahl gehen
                </button>
            </div>
        `;
    },

    showCalculationError: function(error) {
        const container = document.getElementById('calculation-result');
        if (!container) return;
        
        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <h3>Berechnung fehlgeschlagen</h3>
                <p>${error.message || 'Unbekannter Fehler'}</p>
                <div class="error-actions">
                    <button class="btn-primary" onclick="window.page3Controller.performCalculation()">
                        Erneut versuchen
                    </button>
                    <button class="btn-secondary" onclick="window.page1Controller.goToPage1()">
                        Zurück zur Auswahl
                    </button>
                </div>
            </div>
        `;
    },

    syncItemsToCloud: async function() {
        try {
            if (window.cloudAPI && window.cloudAPI.ready) {
                await window.cloudAPI.savePage3Items(this.ownItems);
                this.showNotification('✅ Items zur Cloud synchronisiert', 'success');
            } else {
                this.showNotification('ℹ️ Cloud nicht verfügbar - Items nur lokal gespeichert', 'info');
            }
        } catch (error) {
            console.error('❌ Sync fehlgeschlagen:', error);
            this.showNotification('❌ Synchronisation fehlgeschlagen', 'error');
        }
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
        window.refreshPage3 = () => {
            console.log('🔄 Page3 Refresh');
            this.loadOwnItems();
            this.performCalculation();
        };
        
        // Automatische Berechnung bei Datenänderungen
        if (window.dataManager && window.dataManager.eventBus) {
            window.dataManager.eventBus.addEventListener('dataChanged', (e) => {
                if (e.detail.key === 'userSelection' || e.detail.key === 'comparisonResult') {
                    console.log('🔄 Automatische Berechnung ausgelöst');
                    setTimeout(() => this.performCalculation(), 500);
                }
            });
        }
    },

    // Utility Functions
    generateId: function(prefix = '') {
        return prefix + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    formatDate: function(timestamp) {
        try {
            return new Date(timestamp).toLocaleDateString('de-DE');
        } catch (e) {
            return 'Unbekannt';
        }
    },

    formatTime: function(timestamp) {
        try {
            return new Date(timestamp).toLocaleTimeString('de-DE');
        } catch (e) {
            return 'Unbekannt';
        }
    },

    formatNumber: function(num) {
        return typeof num === 'number' ? num.toFixed(2) : '0.00';
    },

    // Öffentliche API
    test: function() {
        console.log('🧪 Page3Controller Test:', {
            ready: this.ready,
            ownItems: Object.keys(this.ownItems).length,
            calculationResult: !!this.calculationResult,
            cloudAPIAvailable: !!window.cloudAPI,
            cloudAPIReady: window.cloudAPI ? window.cloudAPI.ready : false
        });
        return 'Page3Controller test erfolgreich';
    },

    diagnose: function() {
        return {
            page3ControllerReady: this.ready,
            ownItemsCount: Object.keys(this.ownItems).length,
            calculationResult: !!this.calculationResult,
            cloudAPIAvailable: !!window.cloudAPI,
            cloudAPIReady: window.cloudAPI ? window.cloudAPI.ready : false,
            dataManagerAvailable: !!window.dataManager,
            timestamp: Date.now()
        };
    }
};

// Hauptklasse für volle Funktionalität
class Page3ControllerFull {
    constructor() {
        this.ownItems = {};
        this.calculationResult = null;
        this.ready = false;
        
        console.log('🔧 Page3ControllerFull Constructor');
        this.init();
    }

    async init() {
        try {
            console.log('🔄 Page3ControllerFull startet Initialisierung...');
            
            await this.waitForDependencies();
            
            this.setupEventListeners();
            await this.loadOwnItems();
            this.renderOwnItems();
            
            this.ready = true;
            this.replaceSimpleController();
            
            console.log('✅ Page3ControllerFull vollständig initialisiert');
            
        } catch (error) {
            console.error('❌ Page3ControllerFull Initialisierung fehlgeschlagen:', error);
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

    async loadOwnItems() {
        try {
            if (window.cloudAPI && window.cloudAPI.ready) {
                this.ownItems = await window.cloudAPI.loadPage3Items() || {};
            } else {
                this.ownItems = this.loadLocalItems();
            }
            
            if (window.dataManager) {
                window.dataManager.syncData('page3Items', this.ownItems);
            }
            
        } catch (error) {
            console.error('Fehler beim Laden:', error);
            this.ownItems = this.loadLocalItems();
        }
    }

    loadLocalItems() {
        try {
            const stored = localStorage.getItem('page3_ownItems');
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            return {};
        }
    }

    // ... (weitere Methoden ähnlich wie oben)

    replaceSimpleController() {
        // Ersetze das einfache Objekt durch die volle Implementierung
        Object.getOwnPropertyNames(Page3ControllerFull.prototype)
            .filter(name => name !== 'constructor')
            .forEach(name => {
                window.page3Controller[name] = this[name].bind(this);
            });
        
        Object.keys(this).forEach(key => {
            if (!window.page3Controller.hasOwnProperty(key)) {
                Object.defineProperty(window.page3Controller, key, {
                    get: () => this[key],
                    set: (value) => { this[key] = value; }
                });
            }
        });
        
        window.page3Controller.ready = true;
        console.log('✅ Page3Controller vollständig ersetzt');
    }

    onEnter() {
        console.log('Page3 betreten');
        this.performCalculation();
    }

    onLeave() {
        console.log('Page3 verlassen');
    }
}

// SOFORTIGE INITIALISIERUNG
console.log('🚀 Initialisiere Page3Controller...');

// Sofort das einfache Objekt initialisieren
window.page3Controller.init();

// Später die volle Implementierung laden
setTimeout(() => {
    try {
        new Page3ControllerFull();
        console.log('✅ Page3ControllerFull gestartet');
    } catch (error) {
        console.error('❌ Page3ControllerFull konnte nicht gestartet werden:', error);
    }
}, 100);

// Test-Funktion
setTimeout(() => {
    console.log('🔧 Page3Controller Test verfügbar');
    console.log('- page3Controller:', !!window.page3Controller);
    console.log('- page3Controller.test:', typeof window.page3Controller.test);
    
    if (window.page3Controller && window.page3Controller.test) {
        window.page3Controller.test();
    }
}, 500);
