/**
 * Cloud API Service
 * Zentrale Schnittstelle für Cloud-Operationen
 */

class CloudAPI {
    constructor() {
        this.baseURL = window.dataManager.cloudBaseURL;
        this.cache = new Map();
        this.pendingRequests = new Map();
    }

    // Caching Strategy
    async getWithCache(endpoint, forceRefresh = false) {
        const cacheKey = `cache_${endpoint}`;
        
        // Cache prüfen
        if (!forceRefresh && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 Minuten Cache
                return cached.data;
            }
        }
        
        // Doppelte Requests vermeiden
        if (this.pendingRequests.has(cacheKey)) {
            return this.pendingRequests.get(cacheKey);
        }
        
        try {
            const request = window.dataManager.cloudRequest(endpoint);
            this.pendingRequests.set(cacheKey, request);
            
            const data = await request;
            
            // In Cache speichern
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            
            return data;
        } finally {
            this.pendingRequests.delete(cacheKey);
        }
    }

    // Daten abrufen
    async getInitialData() {
        return this.getWithCache('initial-data');
    }

    async getCloudItems() {
        return this.getWithCache('items');
    }

    async getItemDetails(itemId) {
        return this.getWithCache(`items/${itemId}`);
    }

    // Daten speichern
    async saveUserSelection(selection) {
        const result = await window.dataManager.cloudRequest('user-selection', {
            selection,
            timestamp: Date.now(),
            sessionId: this.getSessionId()
        }, 'POST');
        
        // Cache invalidieren
        this.invalidateCache('items');
        this.invalidateCache('initial-data');
        
        return result;
    }

    async saveCalculation(calculation) {
        return window.dataManager.cloudRequest('calculations', calculation, 'POST');
    }

    // Items verwalten
    async createItem(itemData) {
        const result = await window.dataManager.cloudRequest('items', itemData, 'POST');
        this.invalidateCache('items');
        return result;
    }

    async updateItem(itemId, updates) {
        const result = await window.dataManager.cloudRequest(`items/${itemId}`, updates, 'PUT');
        this.invalidateCache('items');
        this.invalidateCache(`items/${itemId}`);
        return result;
    }

    async deleteItem(itemId) {
        const result = await window.dataManager.cloudRequest(`items/${itemId}`, {}, 'DELETE');
        this.invalidateCache('items');
        this.invalidateCache(`items/${itemId}`);
        return result;
    }

    // Seite 3 - Eigene Items
    async savePage3Items(items) {
        return window.dataManager.cloudRequest('page3-items', { items }, 'POST');
    }

    async loadPage3Items() {
        return this.getWithCache('page3-items');
    }

    // Vergleichsoperationen
    async compareWithCloud(selection, existingData) {
        return window.dataManager.cloudRequest('compare', {
            selection,
            existingData,
            timestamp: Date.now()
        }, 'POST');
    }

    // Utility Methods
    invalidateCache(pattern) {
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }

    clearCache() {
        this.cache.clear();
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('sessionId', sessionId);
        }
        return sessionId;
    }

    // Batch Operations
    async batchUpdate(items) {
        return window.dataManager.cloudRequest('batch', { operations: items }, 'POST');
    }

    // Health Check
    async healthCheck() {
        try {
            await window.dataManager.cloudRequest('health');
            return true;
        } catch (error) {
            return false;
        }
    }

    // Statistiken
    async getStatistics() {
        return this.getWithCache('statistics');
    }
}

// Global verfügbar machen
window.cloudAPI = new CloudAPI();
