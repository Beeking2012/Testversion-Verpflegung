// =============================================
// CLOUD STORAGE MANAGEMENT - ECHTES BACKEND
// =============================================

const CloudStorage = {
    // Upstash Redis REST API Konfiguration
    apiBase: "https://helping-cougar-30935.upstash.io",
    apiToken: "AXjXAAIncDJhNzc0OTViMWEwZGI0MDdlYmRjNWFhOTYxYjRmNjVhYXAyMzA5MzU",
    
    async saveToCloud(key, data) {
        try {
            if (!navigator.onLine) {
                this.updateCloudStatus('❌ Offline - Keine Internetverbindung', 'error');
                return this.saveToLocalStorage(key, data);
            }
            
            const response = await fetch(`${this.apiBase}/set/${key}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                this.updateCloudStatus(`✅ ${key} in Cloud gespeichert`, 'success');
                // Auch lokal speichern als Backup
                this.saveToLocalStorage(key, data);
                return true;
            } else {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Cloud-Speicherung fehlgeschlagen:', error);
            this.updateCloudStatus(`❌ Cloud-Fehler: ${error.message}`, 'error');
            
            // Fallback auf localStorage
            this.updateCloudStatus('💾 Verwende lokalen Speicher als Fallback', 'info');
            return this.saveToLocalStorage(key, data);
        }
    },

    async loadFromCloud(key) {
        try {
            if (!navigator.onLine) {
                this.updateCloudStatus('❌ Offline - Lade lokale Daten', 'error');
                return this.loadFromLocalStorage(key);
            }
            
            const response = await fetch(`${this.apiBase}/get/${key}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result && result.result) {
                    const data = JSON.parse(result.result);
                    this.updateCloudStatus(`✅ ${key} von Cloud geladen`, 'success');
                    // Lokal synchronisieren
                    this.saveToLocalStorage(key, data);
                    return data;
                } else {
                    this.updateCloudStatus(`ℹ️ Keine Daten für ${key} in Cloud`, 'info');
                    // Versuche lokale Daten
                    return this.loadFromLocalStorage(key);
                }
            } else {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Cloud-Ladung fehlgeschlagen:', error);
            this.updateCloudStatus(`❌ Cloud-Fehler: ${error.message}`, 'error');
            
            // Fallback auf localStorage
            this.updateCloudStatus('💾 Lade lokale Daten', 'info');
            return this.loadFromLocalStorage(key);
        }
    },

    // Lokale Speicherung als Fallback
    saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(`cloud_backup_${key}`, JSON.stringify({
                data: data,
                lastSync: new Date().toISOString(),
                source: 'local_fallback'
            }));
            return true;
        } catch (error) {
            console.error('Lokale Speicherung fehlgeschlagen:', error);
            return false;
        }
    },

    loadFromLocalStorage(key) {
        try {
            const stored = localStorage.getItem(`cloud_backup_${key}`);
            if (stored) {
                const parsed = JSON.parse(stored);
                return parsed.data;
            }
            return null;
        } catch (error) {
            console.error('Lokale Ladung fehlgeschlagen:', error);
            return null;
        }
    },

    updateCloudStatus(message, type = 'info') {
        const statusElement = document.getElementById('cloud-status');
        if (statusElement) {
            const typeClass = type === 'success' ? 'status-success' : 
                            type === 'error' ? 'status-error' : 'status-info';
            statusElement.innerHTML = `<p class="${typeClass}">${message}</p>`;
        }
    },

    async autoSync() {
        const keys = [
            { key: 'equipment_gw', name: 'GW-Beladung' },
            { key: 'equipment_kv_lager', name: 'KV-Lager' },
            { key: 'feldkueche_lager', name: 'Lebensmittel-Lager' }
        ];
        
        let syncedCount = 0;
        let errorCount = 0;
        
        this.updateCloudStatus('🔄 Starte Synchronisation mit Cloud...', 'info');

        for (const item of keys) {
            try {
                const localData = localStorage.getItem(item.key);
                
                if (localData) {
                    const parsedData = JSON.parse(localData);
                    const success = await this.saveToCloud(item.key, parsedData);
                    
                    if (success) {
                        syncedCount++;
                        this.updateCloudStatus(
                            `✅ ${item.name} synchronisiert (${syncedCount}/${keys.length})`, 
                            'success'
                        );
                    } else {
                        errorCount++;
                    }
                    
                    // Kurze Pause zwischen den Requests
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            } catch (error) {
                console.error(`Fehler beim Sync von ${item.key}:`, error);
                errorCount++;
            }
        }

        if (errorCount === 0) {
            this.updateCloudStatus(`✅ ${syncedCount}/${keys.length} Datensätze erfolgreich synchronisiert`, 'success');
        } else {
            this.updateCloudStatus(
                `⚠️ ${syncedCount}/${keys.length} synchronisiert, ${errorCount} Fehler`, 
                'error'
            );
        }
        
        return { syncedCount, errorCount };
    },

    async createFullBackup() {
        const backupData = {
            equipment_gw: JSON.parse(localStorage.getItem('equipment_gw') || '[]'),
            equipment_kv_lager: JSON.parse(localStorage.getItem('equipment_kv_lager') || '[]'),
            feldkueche_lager: JSON.parse(localStorage.getItem('feldkueche_lager') || '[]'),
            backupCreated: new Date().toISOString(),
            version: '1.0',
            device: navigator.userAgent,
            timestamp: Date.now()
        };

        this.updateCloudStatus('💾 Erstelle Cloud-Backup...', 'info');
        const success = await this.saveToCloud('full_backup', backupData);
        
        if (success) {
            this.updateCloudStatus('✅ Vollständiges Backup in Cloud gespeichert!', 'success');
            alert('✅ Vollständiges Backup in Cloud gespeichert!');
        } else {
            this.updateCloudStatus('❌ Backup fehlgeschlagen!', 'error');
            alert('❌ Backup fehlgeschlagen! Daten wurden nur lokal gespeichert.');
        }
        
        return success;
    },

    async restoreFullBackup() {
        if (!confirm('Cloud-Backup wiederherstellen? Lokale Daten werden überschrieben!')) {
            return false;
        }

        this.updateCloudStatus('🔄 Lade Backup von Cloud...', 'info');
        const backupData = await this.loadFromCloud('full_backup');
        
        if (backupData) {
            // Daten wiederherstellen
            localStorage.setItem('equipment_gw', JSON.stringify(backupData.equipment_gw || []));
            localStorage.setItem('equipment_kv_lager', JSON.stringify(backupData.equipment_kv_lager || []));
            localStorage.setItem('feldkueche_lager', JSON.stringify(backupData.feldkueche_lager || []));
            
            // UI aktualisieren
            EquipmentManager.gwBeladung = backupData.equipment_gw || [];
            EquipmentManager.kvLager = backupData.equipment_kv_lager || [];
            LagerManager.lagerbestand = backupData.feldkueche_lager || [];
            
            EquipmentManager.aktualisiereGWAnzeige();
            EquipmentManager.aktualisiereKVLagerAnzeige();
            LagerManager.aktualisiereAnzeige();
            
            const backupDate = new Date(backupData.backupCreated).toLocaleDateString('de-DE');
            this.updateCloudStatus(`✅ Backup vom ${backupDate} wiederhergestellt!`, 'success');
            alert(`✅ Backup vom ${backupDate} wiederhergestellt!`);
            return true;
        } else {
            this.updateCloudStatus('❌ Kein Backup in Cloud gefunden!', 'error');
            alert('❌ Kein Backup in Cloud gefunden!');
            return false;
        }
    },

    // Prüfe Cloud-Status beim Start
    async checkCloudStatus() {
        this.updateCloudStatus('📡 Prüfe Cloud-Verbindung...', 'info');
        
        try {
            const response = await fetch(`${this.apiBase}/ping`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`
                }
            });
            
            if (response.ok) {
                this.updateCloudStatus('✅ Mit Cloud verbunden', 'success');
                return true;
            } else {
                this.updateCloudStatus('❌ Cloud-Verbindung fehlgeschlagen', 'error');
                return false;
            }
        } catch (error) {
            this.updateCloudStatus('❌ Cloud-Verbindung fehlgeschlagen', 'error');
            return false;
        }
    }
};
