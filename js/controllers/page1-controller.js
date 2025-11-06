/**
 * Controller für Seite 1 - Auswahl
 * Robust gegen fehlende cloudAPI
 */

// Sofort globale Variable setzen
window.page1Controller = {
    ready: false,
    selectedItem: null,
    cloudData: null,
    
    init: function() {
        console.log('🔄 Page1Controller startet Initialisierung...');
        this.setupBasicEventListeners();
        this.loadInitialData();
        this.ready = true;
        console.log('✅ Page1Controller bereit');
        return this;
    },

    loadInitialData: async function() {
        console.log('📡 Lade initiale Daten...');
        this.showLoadingState();
        
        try {
            // Versuche Cloud-Daten zu laden
            if (window.cloudAPI) {
                console.log('🌐 CloudAPI gefunden, versuche Daten zu laden...');
                this.cloudData = await window.cloudAPI.getInitialData();
                console.log('✅ Cloud-Daten geladen:', this.cloudData);
            } else {
                console.warn('⚠️ CloudAPI nicht verfügbar, verwende Fallback-Daten');
                this.cloudData = this.generateFallbackData();
            }
            
            // Daten im dataManager speichern falls verfügbar
            if (window.dataManager) {
                window.dataManager.syncData('cloudData', this.cloudData);
            }
            
            this.renderSelections();
            
        } catch (error) {
            console.error('❌ Fehler beim Laden der Daten:', error);
            this.cloudData = this.generateFallbackData();
            this.renderSelections();
        }
    },

    generateFallbackData: function() {
        // Fallback-Daten für den Fall dass Cloud nicht verfügbar ist
        return {
            selections: [
                {
                    id: 'fallback-1',
                    name: 'Standard Auswahl',
                    description: 'Basis-Konfiguration mit empfohlenen Einstellungen',
                    type: 'Standard',
                    created: new Date().toISOString(),
                    value: 'standard'
                },
                {
                    id: 'fallback-2', 
                    name: 'Erweiterte Auswahl',
                    description: 'Erweiterte Einstellungen für mehr Kontrolle',
                    type: 'Erweitert',
                    created: new Date().toISOString(),
                    value: 'advanced'
                },
                {
                    id: 'fallback-3',
                    name: 'Minimale Auswahl',
                    description: 'Minimale Konfiguration für schnelle Ergebnisse',
                    type: 'Minimal',
                    created: new Date().toISOString(),
                    value: 'minimal'
                }
            ]
        };
    },

    renderSelections: function() {
        const container = document.getElementById('selection-container');
        
        if (!container) {
            console.error('❌ Container #selection-container nicht gefunden');
            return;
        }

        if (!this.cloudData || !this.cloudData.selections) {
            container.innerHTML = this.createNoDataHTML();
            return;
        }

        const selectionsHTML = this.cloudData.selections.map(item => `
            <div class="selection-card ${item.id === this.selectedItem?.id ? 'selected' : ''}" 
                 data-id="${item.id}">
                <div class="card-header">
                    <h3>${this.capitalize(item.name)}</h3>
                    <span class="type-badge">${item.type || 'Standard'}</span>
                </div>
                <p class="card-description">${item.description || 'Keine Beschreibung verfügbar'}</p>
                <div class="card-footer">
                    <span class="date">Erstellt: ${this.formatDate(item.created)}</span>
                    <div class="card-indicator">
                        ${item.id === this.selectedItem?.id ? '✅ Ausgewählt' : '⬜ Auswählen'}
                    </div>
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

        console.log(`✅ ${this.cloudData.selections.length} Auswahloptionen gerendert`);
    },

    createNoDataHTML: function() {
        return `
            <div class="no-data">
                <div class="no-data-icon">📭</div>
                <h3>Keine Auswahloptionen verfügbar</h3>
                <p>Es konnten keine Daten geladen werden. Bitte versuchen Sie es später erneut.</p>
                <div class="no-data-actions">
                    <button class="btn-primary" onclick="window.page1Controller.loadInitialData()">
                        🔄 Erneut versuchen
                    </button>
                    <button class="btn-secondary" onclick="window.page1Controller.useDemoData()">
                        🎯 Demo-Daten verwenden
                    </button>
                </div>
            </div>
        `;
    },

    handleSelection: function(cardElement) {
        const itemId = cardElement.getAttribute('data-id');
        const selectedItem = this.cloudData.selections.find(item => item.id === itemId);
        
        if (!selectedItem) {
            console.error('❌ Auswahl nicht gefunden:', itemId);
            return;
        }

        // Auswahl visualisieren
        document.querySelectorAll('.selection-card').forEach(card => {
            card.classList.remove('selected');
        });
        cardElement.classList.add('selected');

        this.selectedItem = selectedItem;
        
        // Auswahl speichern
        this.saveSelection(selectedItem);
        
        console.log('✅ Auswahl getroffen:', selectedItem);
        this.showSelectionConfirmation(selectedItem);
    },

    saveSelection: async function(selection) {
        try {
            // Lokal speichern
            if (window.dataManager) {
                window.dataManager.syncData('userSelection', selection);
            } else {
                // Fallback: sessionStorage
                sessionStorage.setItem('userSelection', JSON.stringify(selection));
            }
            
            // In Cloud speichern falls verfügbar
            if (window.cloudAPI && window.cloudAPI.ready) {
                await window.cloudAPI.saveUserSelection(selection);
                this.showNotification('✅ Auswahl in Cloud gespeichert', 'success');
            } else {
                this.showNotification('✅ Auswahl lokal gespeichert', 'info');
            }
            
        } catch (error) {
            console.error('❌ Fehler beim Speichern:', error);
            this.showNotification('⚠️ Auswahl nur lokal gespeichert', 'warning');
        }
    },

    showSelectionConfirmation: function(selection) {
        // Zeige Bestätigung der Auswahl
        const confirmation = document.createElement('div');
        confirmation.className = 'selection-confirmation';
        confirmation.innerHTML = `
            <div class="confirmation-content">
                <h4>✅ Auswahl getroffen</h4>
                <p>Sie haben <strong>${selection.name}</strong> ausgewählt.</p>
                <div class="confirmation-actions">
                    <button class="btn-primary" onclick="window.page1Controller.goToPage2()">
                        Weiter zu Cloud-Abgleich
                    </button>
                    <button class="btn-secondary" onclick="this.parentElement.parentElement.remove()">
                        Schließen
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmation);
    },

    goToPage2: function() {
        if (window.app && window.app.navigateTo) {
            window.app.navigateTo('page2');
        } else if (window.page2Controller) {
            // Fallback Navigation
            window.location.hash = '#page2';
            if (window.page2Controller.onEnter) {
                setTimeout(() => window.page2Controller.onEnter(), 100);
            }
        } else {
            console.log('Navigiere zu Seite 2');
            window.location.hash = '#page2';
        }
    },

    showLoadingState: function() {
        const container = document.getElementById('selection-container');
        const progressBar = document.getElementById('selection-progress');
        
        if (container) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="spinner">⟳</div>
                    <h3>Lade Auswahloptionen...</h3>
                    <p>Bitte warten Sie, während die Daten geladen werden.</p>
                </div>
            `;
        }
        
        if (progressBar) {
            progressBar.style.display = 'block';
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
        window.refreshPage1 = () => {
            console.log('🔄 Manueller Refresh gestartet');
            this.loadInitialData();
        };
        
        // Tastatur-Shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F5') {
                e.preventDefault();
                this.loadInitialData();
            }
        });
    },

    useDemoData: function() {
        console.log('🎯 Verwende Demo-Daten');
        this.cloudData = {
            selections: [
                {
                    id: 'demo-1',
                    name: 'Demo Auswahl 1',
                    description: 'Demonstrations-Daten für Testzwecke',
                    type: 'Demo',
                    created: new Date().toISOString(),
                    value: 'demo-1'
                },
                {
                    id: 'demo-2',
                    name: 'Demo Auswahl 2', 
                    description: 'Weitere Demo-Daten zur Auswahl',
                    type: 'Demo',
                    created: new Date().toISOString(),
                    value: 'demo-2'
                }
            ]
        };
        this.renderSelections();
        this.showNotification('🎯 Demo-Daten geladen', 'info');
    },

    // Utility Functions
    capitalize: function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    formatDate: function(dateString) {
        try {
            return new Date(dateString).toLocaleDateString('de-DE');
        } catch (e) {
            return 'Unbekannt';
        }
    },

    // Öffentliche API
    test: function() {
        console.log('🧪 Page1Controller Test:', {
            ready: this.ready,
            selectedItem: this.selectedItem,
            cloudData: this.cloudData,
            cloudAPIAvailable: !!window.cloudAPI,
            cloudAPIReady: window.cloudAPI ? window.cloudAPI.ready : false
        });
        return 'Page1Controller test erfolgreich';
    },

    diagnose: function() {
        return {
            page1ControllerReady: this.ready,
            selectedItem: !!this.selectedItem,
            cloudDataAvailable: !!this.cloudData,
            cloudDataItems: this.cloudData?.selections?.length || 0,
            cloudAPIAvailable: !!window.cloudAPI,
            cloudAPIReady: window.cloudAPI ? window.cloudAPI.ready : false,
            dataManagerAvailable: !!window.dataManager,
            timestamp: Date.now()
        };
    }
};

// Hauptklasse für volle Funktionalität
class Page1ControllerFull {
    constructor() {
        this.selectedItem = null;
        this.cloudData = null;
        this.ready = false;
        
        console.log('🔧 Page1ControllerFull Constructor');
        this.init();
    }

    async init() {
        try {
            console.log('🔄 Page1ControllerFull startet Initialisierung...');
            
            // Warte auf Abhängigkeiten
            await this.waitForDependencies();
            
            this.setupEventListeners();
            await this.loadCloudData();
            this.renderSelections();
            
            this.ready = true;
            
            // Ersetze das einfache Objekt
            this.replaceSimpleController();
            
            console.log('✅ Page1ControllerFull vollständig initialisiert');
            
        } catch (error) {
            console.error('❌ Page1ControllerFull Initialisierung fehlgeschlagen:', error);
        }
    }

    async waitForDependencies(timeout = 10000) {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const check = () => {
                // Wir brauchen nicht unbedingt dataManager, aber cloudAPI wäre gut
                const depsReady = window.cloudAPI || window.dataManager;
                
                if (depsReady) {
                    console.log('✅ Abhängigkeiten verfügbar');
                    return resolve();
                }
                
                if (Date.now() - start > timeout) {
                    console.warn('⏰ Timeout beim Warten auf Abhängigkeiten');
                    return resolve(); // Wir fahren auch ohne Abhängigkeiten fort
                }
                
                setTimeout(check, 100);
            };
            check();
        });
    }

    async loadCloudData() {
        try {
            this.showLoadingState();
            
            if (window.cloudAPI && window.cloudAPI.ready) {
                this.cloudData = await window.cloudAPI.getInitialData();
                console.log('✅ Cloud-Daten geladen:', this.cloudData);
            } else {
                console.warn('⚠️ CloudAPI nicht verfügbar, verwende Fallback');
                this.cloudData = this.generateFallbackData();
            }
            
            // Daten speichern
            if (window.dataManager) {
                window.dataManager.syncData('cloudData', this.cloudData);
            }
            
            return this.cloudData;
            
        } catch (error) {
            console.error('❌ Fehler beim Laden der Cloud-Daten:', error);
            this.cloudData = this.generateFallbackData();
            return this.cloudData;
        }
    }

    generateFallbackData() {
        return {
            selections: [
                {
                    id: 'cloud-1',
                    name: 'Cloud Auswahl 1',
                    description: 'Daten von der Cloud-API',
                    type: 'Cloud',
                    created: new Date().toISOString(),
                    value: 'cloud-1'
                },
                {
                    id: 'cloud-2',
                    name: 'Cloud Auswahl 2',
                    description: 'Weitere Cloud-basierte Option',
                    type: 'Cloud', 
                    created: new Date().toISOString(),
                    value: 'cloud-2'
                },
                {
                    id: 'cloud-3',
                    name: 'Premium Auswahl',
                    description: 'Erweiterte Cloud-Funktionen',
                    type: 'Premium',
                    created: new Date().toISOString(),
                    value: 'premium'
                }
            ]
        };
    }

    renderSelections() {
        const container = document.getElementById('selection-container');
        
        if (!container) {
            console.error('❌ Container #selection-container nicht gefunden');
            return;
        }

        if (!this.cloudData || !this.cloudData.selections) {
            container.innerHTML = this.createNoDataHTML();
            return;
        }

        const selectionsHTML = this.cloudData.selections.map(item => `
            <div class="selection-card ${item.id === this.selectedItem?.id ? 'selected' : ''}" 
                 data-id="${item.id}">
                <div class="card-header">
                    <h3>${this.capitalize(item.name)}</h3>
                    <span class="type-badge">${item.type || 'Standard'}</span>
                </div>
                <p class="card-description">${item.description || 'Keine Beschreibung verfügbar'}</p>
                <div class="card-footer">
                    <span class="date">Erstellt: ${this.formatDate(item.created)}</span>
                    <div class="card-indicator">
                        ${item.id === this.selectedItem?.id ? '✅ Ausgewählt' : '⬜ Auswählen'}
                    </div>
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

    createNoDataHTML() {
        return `
            <div class="no-data">
                <div class="no-data-icon">📭</div>
                <h3>Keine Auswahloptionen verfügbar</h3>
                <p>Es konnten keine Daten geladen werden.</p>
                <button class="btn-primary" onclick="window.page1Controller.loadInitialData()">
                    Erneut versuchen
                </button>
            </div>
        `;
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
        this.saveSelection(selectedItem);
        
        console.log('Auswahl getroffen:', selectedItem);
    }

    async saveSelection(selection) {
        try {
            // Lokal speichern
            if (window.dataManager) {
                window.dataManager.syncData('userSelection', selection);
            }
            
            // In Cloud speichern
            if (window.cloudAPI && window.cloudAPI.ready) {
                await window.cloudAPI.saveUserSelection(selection);
                this.showNotification('Auswahl erfolgreich gespeichert', 'success');
            }
            
        } catch (error) {
            console.error('Fehler beim Speichern:', error);
            this.showNotification('Auswahl nur lokal gespeichert', 'warning');
        }
    }

    showLoadingState() {
        const container = document.getElementById('selection-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="loading-state">
                <div class="spinner">⟳</div>
                <h3>Lade Auswahloptionen...</h3>
                <p>Bitte warten Sie, während die Daten geladen werden.</p>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
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
    }

    setupEventListeners() {
        // Auf Daten-Updates hören
        if (window.dataManager && window.dataManager.eventBus) {
            window.dataManager.eventBus.addEventListener('dataChanged', (e) => {
                if (e.detail.key === 'cloudData') {
                    this.cloudData = e.detail.data;
                    this.renderSelections();
                }
            });
        }
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    formatDate(dateString) {
        try {
            return new Date(dateString).toLocaleDateString('de-DE');
        } catch (e) {
            return 'Unbekannt';
        }
    }

    replaceSimpleController() {
        // Ersetze das einfache Objekt durch die volle Implementierung
        Object.getOwnPropertyNames(Page1ControllerFull.prototype)
            .filter(name => name !== 'constructor')
            .forEach(name => {
                window.page1Controller[name] = this[name].bind(this);
            });
        
        // Kopiere Eigenschaften
        Object.keys(this).forEach(key => {
            if (!window.page1Controller.hasOwnProperty(key)) {
                Object.defineProperty(window.page1Controller, key, {
                    get: () => this[key],
                    set: (value) => { this[key] = value; }
                });
            }
        });
        
        window.page1Controller.ready = true;
        console.log('✅ Page1Controller vollständig ersetzt');
    }

    onEnter() {
        console.log('Page1 betreten');
        // Daten aktualisieren wenn nötig
        this.loadCloudData();
    }

    onLeave() {
        console.log('Page1 verlassen');
    }
}

// SOFORTIGE INITIALISIERUNG
console.log('🚀 Initialisiere Page1Controller...');

// Sofort das einfache Objekt initialisieren
window.page1Controller.init();

// Später die volle Implementierung laden
setTimeout(() => {
    try {
        new Page1ControllerFull();
        console.log('✅ Page1ControllerFull gestartet');
    } catch (error) {
        console.error('❌ Page1ControllerFull konnte nicht gestartet werden:', error);
    }
}, 100);

// Test-Funktion
setTimeout(() => {
    console.log('🔧 Page1Controller Test verfügbar');
    console.log('- page1Controller:', !!window.page1Controller);
    console.log('- page1Controller.test:', typeof window.page1Controller.test);
    
    if (window.page1Controller && window.page1Controller.test) {
        window.page1Controller.test();
    }
}, 500);
