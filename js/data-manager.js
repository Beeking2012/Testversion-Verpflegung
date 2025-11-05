/**
 * Zentrale Datenverwaltung für die Cloud App
 * Verwaltet lokale Daten, Cloud-Kommunikation und Cross-Page Events
 */

class DataManager {
    constructor() {
        this.cloudBaseURL = 'https://your-cloud-api.vercel.app/api';
        this.localData = this.loadLocalData();
        this.eventBus = new EventTarget();
        this.syncStatus = 'online';
        
        this.initCrossPageCommunication();
        this.setupSyncMonitoring();
    }

    // Cloud-Kommunikation
    async cloudRequest(endpoint, data = null, method = 'GET') {
        try {
            this.setSyncStatus('syncing');
            
            const options = {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            };
            
            if (data) options.body = JSON.stringify(data);
            
            const response = await fetch(`${this.cloudBaseURL}/${endpoint}`, options);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            this.setSyncStatus('online');
            return result;
            
        } catch (error) {
            console.error('Cloud-Fehler:', error);
            this.setSyncStatus('error');
            throw error;
        }
    }

    // Daten zwischen Seiten synchronisieren
    syncData(key, data, notifyOtherPages = true) {
        // Lokal speichern
        this.localData[key] = data;
        this.saveLocalData();
        
        // Andere Seiten benachrichtigen
        if (notifyOtherPages) {
            this.dispatchCrossPageEvent('dataUpdated', { key, data });
        }
        
        // Event für aktuelle Seite
        this.eventBus.dispatchEvent(new CustomEvent('dataChanged', {
            detail: { key, data, timestamp: Date.now() }
        }));
        
        console.log(`Daten synchronisiert: ${key}`, data);
    }

    // Cross-Page Events
    initCrossPageCommunication() {
        // Storage Events für andere Tabs/Fenster
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('crossPage_')) {
                try {
                    const message = JSON.parse(e.newValue);
                    this.handleCrossPageMessage(message);
                } catch (error) {
                    console.error('Fehler beim Verarbeiten der Cross-Page Nachricht:', error);
                }
            }
        });

        // Message Events für aktuelles Fenster
        window.addEventListener('crossPageMessage', (e) => {
            this.handleCrossPageMessage(e.detail);
        });
    }

    dispatchCrossPageEvent(type, detail) {
        const message = { type, detail, timestamp: Date.now() };
        const eventId = `crossPage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Für andere Tabs/Fenster (Storage Event)
        localStorage.setItem(eventId, JSON.stringify(message));
        setTimeout(() => {
            localStorage.removeItem(eventId);
        }, 100);
        
        // Für aktuelles Tab (Custom Event)
        window.dispatchEvent(new CustomEvent('crossPageMessage', { detail: message }));
    }

    handleCrossPageMessage(message) {
        const { type, detail } = message;
        
        switch (type) {
            case 'dataUpdated':
                this.localData[detail.key] = detail.data;
                this.eventBus.dispatchEvent(new CustomEvent('dataChanged', {
                    detail: { key: detail.key, data: detail.data, source: 'crossPage' }
                }));
                break;
                
            case 'pageChanged':
                this.eventBus.dispatchEvent(new CustomEvent('pageNavigation', {
                    detail: { page: detail.page }
                }));
                break;
                
            case 'syncStatusChanged':
                this.setSyncStatus(detail.status, false);
                break;
        }
    }

    // Local Storage Management
    loadLocalData() {
        try {
            const stored = localStorage.getItem('cloudAppData');
            return stored ? JSON.parse(stored) : {
                userSelection: null,
                cloudData: {},
                comparisonResult: null,
                calculationResult: null,
                cloudItems: {},
                page3Items: {},
                userPreferences: {
                    theme: 'light',
                    autoSync: true
                }
            };
        } catch (error) {
            console.error('Fehler beim Laden lokaler Daten:', error);
            return {};
        }
    }

    saveLocalData() {
        try {
            localStorage.setItem('cloudAppData', JSON.stringify(this.localData));
        } catch (error) {
            console.error('Fehler beim Speichern lokaler Daten:', error);
        }
    }

    // Sync Status Management
    setSyncStatus(status, notifyOtherPages = true) {
        this.syncStatus = status;
        
        // UI aktualisieren
        const statusElement = document.getElementById('sync-status');
        if (statusElement) {
            statusElement.textContent = `Sync: ${this.getStatusText(status)}`;
            statusElement.className = `sync-btn sync-${status}`;
        }
        
        if (notifyOtherPages) {
            this.dispatchCrossPageEvent('syncStatusChanged', { status });
        }
        
        this.eventBus.dispatchEvent(new CustomEvent('syncStatusChanged', {
            detail: { status }
        }));
    }

    getStatusText(status) {
        const statusMap = {
            'online': 'Online',
            'syncing': 'Synchronisiere...',
            'error': 'Fehler',
            'offline': 'Offline'
        };
        return statusMap[status] || 'Unbekannt';
    }

    setupSyncMonitoring() {
        // Online/Offline Events
        window.addEventListener('online', () => {
            this.setSyncStatus('online');
            this.tryReconnect();
        });

        window.addEventListener('offline', () => {
            this.setSyncStatus('offline');
        });

        // Periodische Synchronisation
        if (this.localData.userPreferences.autoSync) {
            setInterval(() => {
                if (this.syncStatus === 'online') {
                    this.autoSync();
                }
            }, 30000); // Alle 30 Sekunden
        }
    }

    async tryReconnect() {
        try {
            await this.cloudRequest('health');
            this.setSyncStatus('online');
        } catch (error) {
            this.setSyncStatus('error');
        }
    }

    async autoSync() {
        // Automatische Synchronisation wichtiger Daten
        if (this.localData.userSelection) {
            try {
                await this.cloudRequest('user-selection', {
                    selection: this.localData.userSelection,
                    timestamp: Date.now()
                }, 'POST');
            } catch (error) {
                console.warn('Auto-Sync fehlgeschlagen:', error);
            }
        }
    }

    getAuthToken() {
        return localStorage.getItem('authToken') || '';
    }

    setAuthToken(token) {
        localStorage.setItem('authToken', token);
    }

    // Datenexport
    exportData() {
        const dataStr = JSON.stringify(this.localData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `cloud-app-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(link.href);
    }

    // Datenimport
    async importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    this.localData = { ...this.localData, ...importedData };
                    this.saveLocalData();
                    this.syncData('import', importedData);
                    resolve(importedData);
                } catch (error) {
                    reject(new Error('Ungültige Datei'));
                }
            };
            
            reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
            reader.readAsText(file);
        });
    }
}

// Global verfügbar machen
window.dataManager = new DataManager();
