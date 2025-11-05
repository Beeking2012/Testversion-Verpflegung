/**
 * Controller für Seite 2 - Cloud-Abgleich
 */

class Page2Controller {
    constructor() {
        this.comparisonResult = null;
        this.userSelection = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.checkForExistingSelection();
        
        console.log('Page2Controller initialisiert');
    }

    async checkForExistingSelection() {
        this.userSelection = window.dataManager.localData.userSelection;
        
        if (this.userSelection) {
            await this.performComparison(this.userSelection);
        } else {
            this.showWaitingMessage();
        }
    }

    async performComparison(selection) {
        try {
            this.showLoadingState();
            
            const cloudData = window.dataManager.localData.cloudData || {};
            this.comparisonResult = await cloudAPI.compareWithCloud(selection, cloudData);
            
            window.dataManager.syncData('comparisonResult', this.comparisonResult);
            this.renderComparisonResult();
            
        } catch (error) {
            ErrorHandler.handleCloudError(error, 'compare', { 
                context: 'cloud-comparison',
                selection: selection 
            });
            this.showErrorState(error);
        }
    }

    renderComparisonResult() {
        const container = document.getElementById('comparison-result');
        
        if (!this.comparisonResult) {
            container.innerHTML = '<div class="no-data">Keine Vergleichsdaten verfügbar</div>';
            return;
        }

        const { matches, mismatches, suggestions } = this.comparisonResult;
        
        const matchesHTML = matches.map(item => `
            <div class="comparison-item">
                <div class="comparison-info">
                    <strong>${item.field}</strong>
                    <span>${item.value}</span>
                </div>
                <div class="comparison-status">
                    <span class="status-indicator status-match"></span>
                    <span>Übereinstimmung</span>
                </div>
            </div>
        `).join('');

        const mismatchesHTML = mismatches.map(item => `
            <div class="comparison-item">
                <div class="comparison-info">
                    <strong>${item.field}</strong>
                    <span>Lokal: ${item.localValue} | Cloud: ${item.cloudValue}</span>
                </div>
                <div class="comparison-status">
                    <span class="status-indicator status-mismatch"></span>
                    <span>Abweichung</span>
                </div>
            </div>
        `).join('');

        const suggestionsHTML = suggestions.map(item => `
            <div class="comparison-item">
                <div class="comparison-info">
                    <strong>Empfehlung</strong>
                    <span>${item.message}</span>
                </div>
                <div class="comparison-actions">
                    <button class="btn-secondary" data-action="${item.action}">
                        ${item.buttonText || 'Anwenden'}
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="comparison-header">
                <h3>Cloud-Abgleich Ergebnisse</h3>
                <span class="last-sync">Aktualisiert: ${helpers.formatDate(Date.now())}</span>
            </div>
            <div class="comparison-content">
                ${matches.length > 0 ? `
                    <h4>Übereinstimmungen (${matches.length})</h4>
                    ${matchesHTML}
                ` : ''}
                
                ${mismatches.length > 0 ? `
                    <h4>Abweichungen (${mismatches.length})</h4>
                    ${mismatchesHTML}
                ` : ''}
                
                ${suggestions.length > 0 ? `
                    <h4>Empfehlungen (${suggestions.length})</h4>
                    ${suggestionsHTML}
                ` : ''}
                
                ${matches.length === 0 && mismatches.length === 0 && suggestions.length === 0 ? 
                    '<div class="no-differences">Keine Unterschiede gefunden</div>' : ''}
            </div>
        `;

        // Event Listener für Empfehlungs-Buttons
        container.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleSuggestionAction(e.target.getAttribute('data-action'));
            });
        });
    }

    handleSuggestionAction(action) {
        switch (action) {
            case 'syncWithCloud':
                this.syncWithCloud();
                break;
            case 'updateLocal':
                this.updateLocalData();
                break;
            case 'resolveConflict':
                this.showConflictResolver();
                break;
            default:
                console.warn('Unbekannte Aktion:', action);
        }
    }

    async syncWithCloud() {
        try {
            ErrorHandler.showUserNotification('Synchronisiere mit Cloud...', 'info');
            
            // Cloud-Daten neu laden
            const cloudData = await cloudAPI.getInitialData();
            window.dataManager.syncData('cloudData', cloudData);
            
            // Vergleich neu durchführen
            await this.performComparison(this.userSelection);
            
            ErrorHandler.showUserNotification('Synchronisation erfolgreich', 'success');
        } catch (error) {
            ErrorHandler.handleCloudError(error, 'sync', { context: 'cloud-sync' });
        }
    }

    updateLocalData() {
        if (this.comparisonResult?.suggestions) {
            // Lokale Daten basierend auf Vorschlägen aktualisieren
            const updates = this.comparisonResult.suggestions
                .filter(s => s.action === 'updateLocal')
                .reduce((acc, suggestion) => {
                    acc[suggestion.field] = suggestion.recommendedValue;
                    return acc;
                }, {});

            // Lokale Daten aktualisieren
            const updatedSelection = { ...this.userSelection, ...updates };
            window.dataManager.syncData('userSelection', updatedSelection);
            
            this.userSelection = updatedSelection;
            this.renderComparisonResult();
            
            ErrorHandler.showUserNotification('Lokale Daten aktualisiert', 'success');
        }
    }

    showConflictResolver() {
        // Einfacher Conflict Resolver
        const conflict = this.comparisonResult.mismatches[0]; // Ersten Konflikt anzeigen
        
        if (conflict && confirm(
            `Konflikt bei ${conflict.field}:\n` +
            `Lokal: ${conflict.localValue}\n` +
            `Cloud: ${conflict.cloudValue}\n\n` +
            `Lokale Version behalten? (Abbrechen für Cloud-Version)`
        )) {
            // Lokale Version behalten
            this.userSelection[conflict.field] = conflict.localValue;
        } else {
            // Cloud Version übernehmen
            this.userSelection[conflict.field] = conflict.cloudValue;
        }
        
        window.dataManager.syncData('userSelection', this.userSelection);
        this.performComparison(this.userSelection);
    }

    showLoadingState() {
        const container = document.getElementById('comparison-result');
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <span>Vergleiche mit Cloud-Daten...</span>
            </div>
        `;
    }

    showWaitingMessage() {
        const container = document.getElementById('comparison-result');
        container.innerHTML = `
            <div class="waiting-message">
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
        container.innerHTML = `
            <div class="error-state">
                <h3>Abgleich fehlgeschlagen</h3>
                <p>${error.message}</p>
                <button class="btn-primary" onclick="location.reload()">
                    Erneut versuchen
                </button>
            </div>
        `;
    }

    setupEventListeners() {
        // Auf Auswahl-Änderungen reagieren
        window.dataManager.eventBus.addEventListener('dataChanged', (e) => {
            if (e.detail.key === 'userSelection') {
                this.userSelection = e.detail.data;
                this.performComparison(this.userSelection);
            }
        });

        // Auf Cloud-Daten-Änderungen reagieren
        window.dataManager.eventBus.addEventListener('dataChanged', (e) => {
            if (e.detail.key === 'cloudData' && this.userSelection) {
                // Cloud-Daten haben sich geändert, Vergleich neu durchführen
                this.performComparison(this.userSelection);
            }
        });
    }

    onEnter() {
        console.log('Page2 betreten');
        // Beim Betreten der Seite prüfen ob sich was geändert hat
        if (this.userSelection) {
            this.performComparison(this.userSelection);
        }
    }

    onLeave() {
        console.log('Page2 verlassen');
    }

    handleGlobalMessage(message) {
        if (message.type === 'forceRefresh') {
            this.performComparison(this.userSelection);
        }
    }
}
