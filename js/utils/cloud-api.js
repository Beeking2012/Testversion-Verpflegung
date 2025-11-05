/**
 * Cloud API Service
 * Zentrale Schnittstelle für Cloud-Operationen
 */

class CloudAPI {
    constructor() {
        this.baseURL = window.dataManager?.cloudBaseURL || ''; // sicherer Zugriff
        this.cache = new Map();
        this.pendingRequests = new Map();
        this.kvStore = null;
        this.initKV();
    }

    // Redis/KV Store Initialisierung
    async initKV() {
        try {
            // Upstash Redis REST API
            this.kvStore = {
                baseURL: "https://helping-cougar-30935.upstash.io",
                token: "AXjXAAIncDJhNzc0OTViMWEwZGI0MDdlYmRjNWFhOTYxYjRmNjVhYXAyMzA5MzU",
                
                async get(key) {
                    const response = await fetch(`${this.baseURL}/get/${key}`, {
                        headers: {
                            'Authorization': `Bearer ${this.token}`
                        }
                    });
                    if (!response.ok) throw new Error('KV GET failed');
                    const data = await response.json();
                    return data.result;
                },
                
                async set(key, value) {
                    const response = await fetch(`${this.baseURL}/set/${key}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${this.token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(value)
                    });
                    if (!response.ok) throw new Error('KV SET failed');
                    return await response.json();
                },
                
                async delete(key) {
                    const response = await fetch(`${this.baseURL}/del/${key}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${this.token}`
                        }
                    });
                    if (!response.ok) throw new Error('KV DELETE failed');
                    return await response.json();
                },
                
                async keys(pattern = '*') {
                    const response = await fetch(`${this.baseURL}/keys/${pattern}`, {
                        headers: {
                            'Authorization': `Bearer ${this.token}`
                        }
                    });
                    if (!response.ok) throw new Error('KV KEYS failed');
                    const data = await response.json();
                    return data.result || [];
                }
            };
            
            console.log('KV Store initialized successfully');
        } catch (error) {
            console.error('Failed to initialize KV store:', error);
            this.kvStore = null;
        }
    }

    // Caching Strategy mit Redis Fallback
    async getWithCache(endpoint, forceRefresh = false) {
        const cacheKey = `cache_${endpoint}`;
        
        // Memory Cache prüfen (5 Minuten)
        if (!forceRefresh && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
                return cached.data;
            }
        }
        
        // Doppelte Requests vermeiden
        if (this.pendingRequests.has(cacheKey)) {
            return this.pendingRequests.get(cacheKey);
        }
        
        try {
            // Redis Cache prüfen falls verfügbar
            if (this.kvStore && !forceRefresh) {
                try {
                    const redisData = await this.kvStore.get(cacheKey);
                    if (redisData) {
                        const parsedData = JSON.parse(redisData);
                        // Auch in Memory Cache speichern
                        this.cache.set(cacheKey, {
                            data: parsedData,
                            timestamp: Date.now()
                        });
                        return parsedData;
                    }
                } catch (redisError) {
                    console.warn('Redis cache miss, falling back to API:', redisError);
                }
            }
            
            // API Request falls kein Cache
            const request = window.dataManager.cloudRequest(endpoint);
            this.pendingRequests.set(cacheKey, request);
            
            const data = await request;
            
            // In beide Caches speichern
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            
            // In Redis speichern falls verfügbar
            if (this.kvStore) {
                try {
                    await this.kvStore.set(cacheKey, JSON.stringify(data));
                } catch (redisError) {
                    console.error('Failed to save to Redis:', redisError);
                }
            }
            
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

    // Daten speichern mit Redis Backup
    async saveUserSelection(selection) {
        const result = await window.dataManager.cloudRequest('user-selection', {
            selection,
            timestamp: Date.now(),
            sessionId: this.getSessionId()
        }, 'POST');
        
        // In Redis speichern falls verfügbar
        if (this.kvStore) {
            try {
                const backupKey = `backup_selection_${this.getSessionId()}_${Date.now()}`;
                await this.kvStore.set(backupKey, JSON.stringify(selection));
            } catch (error) {
                console.warn('Failed to backup selection to Redis:', error);
            }
        }
        
        // Cache invalidieren
        this.invalidateCache('items');
        this.invalidateCache('initial-data');
        
        return result;
    }

    async saveCalculation(calculation) {
        const result = await window.dataManager.cloudRequest('calculations', calculation, 'POST');
        
        // In Redis speichern
        if (this.kvStore) {
            try {
                const calcKey = `calculation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await this.kvStore.set(calcKey, JSON.stringify(calculation));
            } catch (error) {
                console.warn('Failed to save calculation to Redis:', error);
            }
        }
        
        return result;
    }

    // Items verwalten
    async createItem(itemData) {
        const result = await window.dataManager.cloudRequest('items', itemData, 'POST');
        
        // In Redis speichern
        if (this.kvStore) {
            try {
                const itemKey = `item_${Date.now()}`;
                await this.kvStore.set(itemKey, JSON.stringify(itemData));
            } catch (error) {
                console.warn('Failed to backup item to Redis:', error);
            }
        }
        
        this.invalidateCache('items');
        return result;
    }

    async updateItem(itemId, updates) {
        const result = await window.dataManager.cloudRequest(`items/${itemId}`, updates, 'PUT');
        
        // Redis Cache aktualisieren
        if (this.kvStore) {
            try {
                await this.kvStore.set(`cache_items/${itemId}`, JSON.stringify(updates));
            } catch (error) {
                console.warn('Failed to update Redis cache:', error);
            }
        }
        
        this.invalidateCache('items');
        this.invalidateCache(`items/${itemId}`);
        return result;
    }

    async deleteItem(itemId) {
        const result = await window.dataManager.cloudRequest(`items/${itemId}`, {}, 'DELETE');
        
        // Aus Redis entfernen
        if (this.kvStore) {
            try {
                await this.kvStore.delete(`cache_items/${itemId}`);
                // Lösche alle items-related Cache Einträge
                const keys = await this.kvStore.keys('cache_items*');
                for (const key of keys) {
                    await this.kvStore.delete(key);
                }
            } catch (error) {
                console.warn('Failed to delete from Redis:', error);
            }
        }
        
        this.invalidateCache('items');
        this.invalidateCache(`items/${itemId}`);
        return result;
    }

    // Seite 3 - Eigene Items
    async savePage3Items(items) {
        const result = await window.dataManager.cloudRequest('page3-items', { items }, 'POST');
        
        // In Redis speichern
        if (this.kvStore) {
            try {
                await this.kvStore.set('page3_items', JSON.stringify(items));
            } catch (error) {
                console.warn('Failed to save page3 items to Redis:', error);
            }
        }
        
        return result;
    }

    async loadPage3Items() {
        // Zuerst Redis prüfen
        if (this.kvStore) {
            try {
                const redisData = await this.kvStore.get('page3_items');
                if (redisData) {
                    return JSON.parse(redisData);
                }
            } catch (error) {
                console.warn('Failed to load page3 items from Redis:', error);
            }
        }
        
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
        // Memory Cache
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
        
        // Redis Cache (asynchron im Hintergrund)
        if (this.kvStore) {
            this.kvStore.keys(`cache_${pattern}*`)
                .then(keys => {
                    keys.forEach(key => {
                        this.kvStore.delete(key).catch(console.warn);
                    });
                })
                .catch(console.warn);
        }
    }

    clearCache() {
        this.cache.clear();
        
        // Redis Cache leeren (asynchron)
        if (this.kvStore) {
            this.kvStore.keys('cache_*')
                .then(keys => {
                    keys.forEach(key => {
                        this.kvStore.delete(key).catch(console.warn);
                    });
                })
                .catch(console.warn);
        }
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
        const result = await window.dataManager.cloudRequest('batch', { operations: items }, 'POST');
        
        // In Redis speichern
        if (this.kvStore) {
            try {
                const batchKey = `batch_${Date.now()}`;
                await this.kvStore.set(batchKey, JSON.stringify(items));
            } catch (error) {
                console.warn('Failed to save batch to Redis:', error);
            }
        }
        
        return result;
    }

    // Health Check mit Redis Test
    async healthCheck() {
        try {
            // API Health
            await window.dataManager.cloudRequest('health');
            
            // Redis Health
            if (this.kvStore) {
                await this.kvStore.get('health_check');
            }
            
            return true;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }

    // Statistiken
    async getStatistics() {
        return this.getWithCache('statistics');
    }

    // Redis-spezifische Methoden
    async getRedisKeys(pattern = '*') {
        if (!this.kvStore) throw new Error('KV Store not available');
        return this.kvStore.keys(pattern);
    }
    
    async flushRedis() {
        if (!this.kvStore) throw new Error('KV Store not available');
        const keys = await this.kvStore.keys('*');
        for (const key of keys) {
            await this.kvStore.delete(key);
        }
        return keys.length;
    }
}

// Global verfügbar machen
window.cloudAPI = new CloudAPI();
