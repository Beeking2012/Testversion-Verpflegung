/**
 * Controller für Seite 2 - Cloud-Abgleich
 * Überarbeitete Version für sinnvolle Cloud-Inhalte
 */

class Page2Controller {
    constructor() {
        this.comparisonResult = null;
        this.userSelection = null;
        this.cloudData = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadCloudData();
        await this.checkForExistingSelection();
        
        console.log('Page2Controller initialisiert mit Cloud-Daten');
    }

    async loadCloudData() {
        try {
            console.log('📡 Lade Cloud-Daten...');
            
            // Versuche Cloud-Daten zu laden
            if (window.cloudAPI && window.cloudAPI.ready) {
                this.cloudData = await window.cloudAPI.getCloudItems();
                console.log('✅ Cloud-Daten geladen:', this.cloudData);
            } else {
                console.warn('⚠️ CloudAPI nicht verfügbar, verwende Fallback');
                this.cloudData = this.generateSampleCloudData();
            }
            
            // Cloud-Daten im dataManager speichern
            if (window.dataManager) {
                window.dataManager.syncData('cloudData', this.cloudData);
            }
            
        } catch (error) {
            console.error('❌ Fehler beim Laden der Cloud-Daten:', error);
            this.cloudData = this.generateSampleCloudData();
        }
    }

    async checkForExistingSelection() {
        // Prüfe auf vorhandene Auswahl
        if (window.dataManager && window.dataManager.localData) {
            this.userSelection = window.dataManager.localData.userSelection;
        } else {
            // Fallback: Prüfe sessionStorage
            const stored = sessionStorage.getItem('userSelection');
            this.userSelection = stored ? JSON.parse(stored) : null;
        }
        
        if (this.userSelection) {
            console.log('✅ Vorhandene Auswahl gefunden:', this.userSelection);
            await this.performComparison(this.userSelection);
        } else {
            console.log('⏳ Warte auf Benutzerauswahl...');
            this.showWaitingMessage();
        }
    }

    async performComparison(selection) {
        try {
            this.showLoadingState();
            
            console.log('🔍 Starte Vergleich...', {
                selection: selection,
                cloudData: this.cloudData
            });
            
            // Führe den Vergleich durch
            this.comparisonResult = await this.compareData(selection, this.cloudData);
            
            console.log('✅ Vergleich abgeschlossen:', this.comparisonResult);
            
            // Ergebnis speichern
            if (window.dataManager) {
                window.dataManager.syncData('comparisonResult', this.comparisonResult);
            }
            
            this.renderComparisonResult();
            
        } catch (error) {
            console.error('❌ Vergleich fehlgeschlagen:', error);
            this.showErrorState(error);
        }
    }

    async compareData(localData, cloudData) {
        // Vereinfachter Vergleich - kann an deine Datenstruktur angepasst werden
        const result = {
            matches: [],
            mismatches: [],
            suggestions: [],
            summary: {
                totalLocalItems: 0,
                totalCloudItems: 0,
                matchedItems: 0,
                syncStatus: 'unknown'
            }
        };

        // Beispiel-Vergleichslogik - passe dies an deine Datenstruktur an
        if (localData && cloudData) {
            // Annahme: localData und cloudData sind Arrays von Items
            const localItems = Array.isArray(localData) ? localData : [localData];
            const cloudItems = Array.isArray(cloudData) ? cloudData : [cloudData];

            result.summary.totalLocalItems = localItems.length;
            result.summary.totalCloudItems = cloudItems.length;

            // Einfacher Vergleich basierend auf IDs oder Namen
            localItems.forEach(localItem => {
                const cloudMatch = cloudItems.find(cloudItem => 
                    cloudItem.id === localItem.id || 
                    cloudItem.name === localItem.name
                );

                if (cloudMatch) {
                    result.matches.push({
                        field: localItem.name || localItem.id,
                        value: localItem.value || 'Vorhanden',
                        localValue: localItem.value,
                        cloudValue: cloudMatch.value,
                        status: 'match'
                    });
                    result.summary.matchedItems++;
                } else {
                    result.mismatches.push({
                        field: localItem.name || localItem.id,
                        localValue: localItem.value || 'Vorhanden',
                        cloudValue: 'Nicht in Cloud',
                        status: 'local-only'
                    });
                }
            });

            // Finde Cloud-Items die lokal fehlen
            cloudItems.forEach(cloudItem => {
                const localMatch = localItems.find(localItem => 
                    localItem.id === cloudItem.id || 
                    localItem.name === cloudItem.name
                );

                if (!localMatch) {
                    result.mismatches.push({
                        field: cloudItem.name || cloudItem.id,
                        localValue: 'Nicht lokal',
                        cloudValue: cloudItem.value || 'Vorhanden',
                        status: 'cloud-only'
                    });
                }
            });

            // Generiere Vorschläge basierend auf den Ergebnissen
            if (result.mismatches.length > 0) {
                result.suggestions.push({
                    message: `${result.mismatches.length} Unterschiede gefunden. Synchronisieren?`,
                    action: 'syncWithCloud',
                    buttonText: 'Jetzt synchronisieren'
                });
            }

            if (result.matches.length === 0 && result.mismatches.length > 0) {
                result.suggestions.push({
                    message: 'Keine Übereinstimmungen gefunden. Lokale Daten zur Cloud hinzufügen?',
                    action: 'uploadToCloud',
                    buttonText: 'Zu Cloud hochladen'
                });
            }

            // Setze Sync-Status
            if (result.mismatches.length === 0) {
                result.summary.syncStatus = 'synced';
            } else if (result.matches.length > 0) {
                result.summary.syncStatus = 'partial';
            } else {
                result.summary.syncStatus = 'conflict';
            }
        }

        return result;
    }

    renderComparisonResult() {
        const container = document.getElementById('comparison-result');
        
        if (!container) {
            console.error('❌ Container #comparison-result nicht gefunden');
            return;
        }

        if (!this.comparisonResult) {
            container.innerHTML = this.createNoDataHTML();
            return;
        }

        const { matches, mismatches, suggestions, summary } = this.comparisonResult;
        
        container.innerHTML = this.createComparisonHTML(summary, matches, mismatches, suggestions);
        this.setupComparisonEventListeners();
    }

    createNoDataHTML() {
        return `
            <div class="no-data">
                <h3>Keine Vergleichsdaten verfügbar</h3>
                <p>Es wurden noch keine Daten zum Vergleich geladen.</p>
                <button class="btn-primary" onclick="page2Controller.loadCloudData()">
                    Cloud-Daten neu laden
                </button>
            </div>
        `;
    }

    createComparisonHTML(summary, matches, mismatches, suggestions) {
        return `
            <div class="comparison-header">
                <h3>📊 Cloud-Abgleich</h3>
                <div class="sync-status ${summary.syncStatus}">
                    <span class="status-indicator"></span>
                    <span>${this.getStatusText(summary.syncStatus)}</span>
                </div>
                <span class="last-sync">Aktualisiert: ${this.formatTime(Date.now())}</span>
            </div>

            <div class="summary-cards">
                <div class="summary-card">
                    <div class="card-value">${summary.totalLocalItems}</div>
                    <div class="card-label">Lokale Items</div>
                </div>
                <div class="summary-card">
                    <div class="card-value">${summary.totalCloudItems}</div>
                    <div class="card-label">Cloud Items</div>
                </div>
                <div class="summary-card">
                    <div class="card-value">${summary.matchedItems}</div>
                    <div class="card-label">Übereinstimmungen</div>
                </div>
                <div class="summary-card">
                    <div class="card-value">${mismatches.length}</div>
                    <div class="card-label">Unterschiede</div>
                </div>
            </div>

            <div class="comparison-content">
                ${mismatches.length > 0 ? this.createMismatchesHTML(mismatches) : ''}
                ${matches.length > 0 ? this.createMatchesHTML(matches) : ''}
                ${suggestions.length > 0 ? this.createSuggestionsHTML(suggestions) : ''}
                
                ${matches.length === 0 && mismatches.length === 0 ? 
                    '<div class="no-differences">✅ Alle Daten sind synchron</div>' : ''}
            </div>

            <div class="comparison-actions">
                <button class="btn-secondary" onclick="page2Controller.loadCloudData()">
                    🔄 Cloud-Daten aktualisieren
                </button>
                <button class="btn-secondary" onclick="page2Controller.clearCache()">
                    🗑️ Cache leeren
                </button>
                ${mismatches.length > 0 ? `
                    <button class="btn-primary" onclick="page2Controller.syncWithCloud()">
                        ⚡ Jetzt synchronisieren
                    </button>
                ` : ''}
            </div>
        `;
    }

    createMatchesHTML(matches) {
        return `
            <div class="section">
                <h4>✅ Übereinstimmungen (${matches.length})</h4>
                <div class="items-list">
                    ${matches.map(item => `
                        <div class="comparison-item match">
                            <div class="item-icon">✓</div>
                            <div class="item-content">
                                <strong>${item.field}</strong>
                                <span>${item.value}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    createMismatchesHTML(mismatches) {
        return `
            <div class="section">
                <h4>⚠️ Unterschiede (${mismatches.length})</h4>
                <div class="items-list">
                    ${mismatches.map(item => `
                        <div class="comparison-item mismatch ${item.status}">
                            <div class="item-icon">${this.getStatusIcon(item.status)}</div>
                            <div class="item-content">
                                <strong>${item.field}</strong>
                                <div class="value-comparison">
                                    <span class="local-value">Lokal: ${item.localValue}</span>
                                    <span class="cloud-value">Cloud: ${item.cloudValue}</span>
                                </div>
                            </div>
                            <div class="item-actions">
                                <button class="btn-small" data-action="useLocal" data-field="${item.field}">
                                    Lokal
                                </button>
                                <button class="btn-small" data-action="useCloud" data-field="${item.field}">
                                    Cloud
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    createSuggestionsHTML(suggestions) {
        return `
            <div class="section">
                <h4>💡 Empfehlungen (${suggestions.length})</h4>
                <div class="suggestions-list">
                    ${suggestions.map(item => `
                        <div class="suggestion-item">
                            <div class="suggestion-content">
                                <p>${item.message}</p>
                            </div>
                            <div class="suggestion-actions">
                                <button class="btn-primary" data-action="${item.action}">
                                    ${item.buttonText}
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getStatusText(status) {
        const statusMap = {
            'synced': 'Vollständig synchron',
            'partial': 'Teilweise synchron',
            'conflict': 'Konflikte vorhanden',
            'unknown': 'Status unbekannt'
        };
        return statusMap[status] || 'Unbekannt';
    }

    getStatusIcon(status) {
        const iconMap = {
            'local-only': '📱',
            'cloud-only': '☁️',
            'match': '✓',
            'mismatch': '⚠️'
        };
        return iconMap[status] || '❓';
    }

    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString('de-DE');
    }

    setupComparisonEventListeners() {
        // Event Listener für Empfehlungs-Buttons
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                const field = e.target.getAttribute('data-field');
                this.handleSuggestionAction(action, field);
            });
        });
    }

    handleSuggestionAction(action, field = null) {
        console.log('🎯 Handle action:', action, field);
        
        switch (action) {
            case 'syncWithCloud':
                this.syncWithCloud();
                break;
            case 'uploadToCloud':
                this.uploadToCloud();
                break;
            case 'useLocal':
                this.resolveConflict(field, 'local');
                break;
            case 'useCloud':
                this.resolveConflict(field, 'cloud');
                break;
            default:
                console.warn('Unbekannte Aktion:', action);
        }
    }

    async syncWithCloud() {
        try {
            this.showNotification('Synchronisiere mit Cloud...', 'info');
            
            // Cloud-Daten neu laden
            await this.loadCloudData();
            
            // Vergleich neu durchführen
            if (this.userSelection) {
                await this.performComparison(this.userSelection);
            }
            
            this.showNotification('Synchronisation erfolgreich', 'success');
        } catch (error) {
            console.error('❌ Sync fehlgeschlagen:', error);
            this.showNotification('Synchronisation fehlgeschlagen', 'error');
        }
    }

    async uploadToCloud() {
        try {
            this.showNotification('Lade Daten zur Cloud hoch...', 'info');
            
            if (this.userSelection && window.cloudAPI) {
                await window.cloudAPI.saveUserSelection(this.userSelection);
                await this.loadCloudData(); // Cloud-Daten neu laden
                
                this.showNotification('Daten erfolgreich hochgeladen', 'success');
            }
        } catch (error) {
            console.error('❌ Upload fehlgeschlagen:', error);
            this.showNotification('Upload fehlgeschlagen', 'error');
        }
    }

    resolveConflict(field, resolution) {
        if (!field || !this.userSelection) return;
        
        const mismatch = this.comparisonResult.mismatches.find(m => m.field === field);
        if (mismatch) {
            if (resolution === 'local') {
                // Behalte lokalen Wert bei
                console.log(`Behalte lokalen Wert für ${field}:`, mismatch.localValue);
            } else {
                // Übernehme Cloud-Wert
                this.userSelection[field] = mismatch.cloudValue;
                console.log(`Übernehme Cloud-Wert für ${field}:`, mismatch.cloudValue);
            }
            
            // Daten speichern
            if (window.dataManager) {
                window.dataManager.syncData('userSelection', this.userSelection);
            }
            
            // Vergleich neu durchführen
            this.performComparison(this.userSelection);
        }
    }

    showLoadingState() {
        const container = document.getElementById('comparison-result');
        if (!container) return;
        
        container.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <h3>Lade Cloud-Daten...</h3>
                <p>Bitte warten Sie, während die Daten mit der Cloud abgeglichen werden.</p>
            </div>
        `;
    }

    showWaitingMessage() {
        const container = document.getElementById('comparison-result');
        if (!container) return;
        
        container.innerHTML = `
            <div class="waiting-message">
                <div class="waiting-icon">⏳</div>
                <h3>Warte auf Auswahl</h3>
                <p>Bitte treffen Sie zuerst eine Auswahl auf Seite 1.</p>
                <button class="btn-primary" onclick="app.navigateTo('page1')">
                    Zur Auswahl gehen
                </button>
            </div>
        `;
    }

    showErrorState(error) {
        const container = document.getElementById('comparison-result');
        if (!container) return;
        
        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <h3>Abgleich fehlgeschlagen</h3>
                <p>${error.message || 'Unbekannter Fehler'}</p>
                <div class="error-actions">
                    <button class="btn-primary" onclick="page2Controller.loadCloudData()">
                        Erneut versuchen
                    </button>
                    <button class="btn-secondary" onclick="app.navigateTo('page1')">
                        Zurück zur Auswahl
                    </button>
                </div>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        // Einfache Notification-Implementierung
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
        }, 5000);
    }

    setupEventListeners() {
        // Auf Auswahl-Änderungen reagieren
        if (window.dataManager && window.dataManager.eventBus) {
            window.dataManager.eventBus.addEventListener('dataChanged', (e) => {
                if (e.detail.key === 'userSelection') {
                    this.userSelection = e.detail.data;
                    this.performComparison(this.userSelection);
                }
            });
        }
        
        // Manuelles Refresh über globale Funktion
        window.refreshPage2 = () => {
            this.loadCloudData();
            if (this.userSelection) {
                this.performComparison(this.userSelection);
            }
        };
    }

    generateSampleCloudData() {
        // Fallback-Daten für Testzwecke
        return [
            { id: 1, name: 'Cloud Item 1', value: 'Wert aus Cloud', category: 'Beispiel' },
            { id: 2, name: 'Cloud Item 2', value: 'Cloud Daten', category: 'Beispiel' },
            { id: 3, name: 'Geteiltes Item', value: 'Gemeinsamer Wert', category: 'Gemeinsam' }
        ];
    }

    async clearCache() {
        if (window.cloudAPI) {
            window.cloudAPI.clearCache();
            this.showNotification('Cache geleert', 'info');
            await this.loadCloudData();
        }
    }

    onEnter() {
        console.log('Page2 betreten - aktualisiere Daten');
        this.loadCloudData();
        if (this.userSelection) {
            this.performComparison(this.userSelection);
        }
    }

    onLeave() {
        console.log('Page2 verlassen');
    }
}

// Globale Instanz verfügbar machen
window.page2Controller = new Page2Controller();
