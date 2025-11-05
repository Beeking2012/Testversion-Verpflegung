/**
 * Safe Cloud API
 * Setzt window.cloudAPI sofort, auch wenn window.dataManager noch nicht geladen ist
 */
class CloudAPI {
    constructor() {
        this.cache = new Map();
        this.pendingRequests = new Map();
        this.kvStore = null;
        this.ready = false;

        // Sofort Proxy bereitstellen, damit window.cloudAPI existiert
        this.init();
    }

    async init() {
        try {
            // Warten bis window.dataManager verfügbar ist
            await this.waitForDataManager();

            this.baseURL = window.dataManager.cloudBaseURL || '';
            await this.initKV();
            this.ready = true;
            console.log("CloudAPI ready");
        } catch (e) {
            console.error("CloudAPI initialization failed:", e);
        }
    }

    waitForDataManager(timeout = 10000) {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const check = () => {
                if (window.dataManager) return resolve();
                if (Date.now() - start > timeout) return reject("dataManager not found in time");
                setTimeout(check, 50);
            };
            check();
        });
    }

    async initKV() {
        try {
            this.kvStore = {
                baseURL: "https://helping-cougar-30935.upstash.io",
                token: "AXjXAAIncDJhNzc0OTViMWEwZGI0MDdlYmRjNWFhOTYxYjRmNjVhYXAyMzA5MzU",

                async get(key) {
                    const response = await fetch(`${this.baseURL}/get/${key}`, {
                        headers: { 'Authorization': `Bearer ${this.token}` }
                    });
                    if (!response.ok) return null;
                    const data = await response.json();
                    return data.result;
                },

                async set(key, value) {
                    const response = await fetch(`${this.baseURL}/set/${key}`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${this.token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify(value)
                    });
                    if (!response.ok) throw new Error('KV SET failed');
                    return await response.json();
                },

                async delete(key) {
                    const response = await fetch(`${this.baseURL}/del/${key}`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${this.token}` }
                    });
                    if (!response.ok) throw new Error('KV DELETE failed');
                    return await response.json();
                },

                async keys(pattern = '*') {
                    const response = await fetch(`${this.baseURL}/keys/${pattern}`, {
                        headers: { 'Authorization': `Bearer ${this.token}` }
                    });
                    if (!response.ok) throw new Error('KV KEYS failed');
                    const data = await response.json();
                    return data.result || [];
                }
            };
            console.log("KV Store initialized");
        } catch (e) {
            console.warn("KV Store initialization failed:", e);
            this.kvStore = null;
        }
    }

    // --- Core Methods ---
    async getWithCache(endpoint, forceRefresh = false) {
        if (!this.ready) await this.waitForDataManager();

        const cacheKey = `cache_${endpoint}`;
        if (!forceRefresh && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 5 * 60 * 1000) return cached.data;
        }

        if (this.pendingRequests.has(cacheKey)) return this.pendingRequests.get(cacheKey);

        try {
            // Redis cache
            if (this.kvStore && !forceRefresh) {
                try {
                    const redisData = await this.kvStore.get(cacheKey);
                    if (redisData) {
                        const parsedData = JSON.parse(redisData);
                        this.cache.set(cacheKey, { data: parsedData, timestamp: Date.now() });
                        return parsedData;
                    }
                } catch {}
            }

            const request = window.dataManager.cloudRequest(endpoint);
            this.pendingRequests.set(cacheKey, request);
            const data = await request;

            this.cache.set(cacheKey, { data, timestamp: Date.now() });
            if (this.kvStore) await this.kvStore.set(cacheKey, JSON.stringify(data));

            return data;
        } finally {
            this.pendingRequests.delete(cacheKey);
        }
    }

    // Beispiel-Methoden
    async getInitialData() { return this.getWithCache('initial-data'); }
    async getCloudItems() { return this.getWithCache('items'); }

    getSessionId() {
        let sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('sessionId', sessionId);
        }
        return sessionId;
    }

    invalidateCache(pattern) {
        for (const key of this.cache.keys()) if (key.includes(pattern)) this.cache.delete(key);
        if (this.kvStore) {
            this.kvStore.keys(`cache_${pattern}*`).then(keys => {
                keys.forEach(key => this.kvStore.delete(key).catch(console.warn));
            });
        }
    }

    clearCache() {
        this.cache.clear();
        if (this.kvStore) {
            this.kvStore.keys('cache_*').then(keys => keys.forEach(key => this.kvStore.delete(key).catch(console.warn)));
        }
    }
}

// Sofort globale Variable setzen
window.cloudAPI = new CloudAPI();
