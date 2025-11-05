// =============================================
// EQUIPMENT MANAGEMENT SYSTEM MIT CLOUD SYNC
// =============================================

const EquipmentManager = {
    gwBeladung: JSON.parse(localStorage.getItem('equipment_gw')) || [],
    kvLager: JSON.parse(localStorage.getItem('equipment_kv_lager')) || [],

    hikGWDefault: [
        { name: "Kochtopf 100L", menge: 2, kategorie: "Kochausrüstung", notizen: "Hauptkochtopf" },
        { name: "Kochtopf 60L", menge: 1, kategorie: "Kochausrüstung", notizen: "Zwischengröße" },
        { name: "Kochtopf 30L", menge: 1, kategorie: "Kochausrüstung", notizen: "Für Soßen" },
        { name: "Gasbrenner 15kW", menge: 4, kategorie: "Brenner & Energie", notizen: "Hauptbrenner" },
        { name: "Reservegasflasche", menge: 6, kategorie: "Brenner & Energie", notizen: "11kg Propan" },
        { name: "Feldkochgeschirr", menge: 300, kategorie: "Geschirr", notizen: "Für 300 Personen" },
        { name: "Besteck-Sets", menge: 300, kategorie: "Besteck", notizen: "Messer, Gabel, Löffel" },
        { name: "Becher", menge: 300, kategorie: "Geschirr", notizen: "300ml Trinkbecher" },
        { name: "Schneidbretter groß", menge: 4, kategorie: "Küchengeräte", notizen: "Kunststoff" },
        { name: "Kochlöffel", menge: 6, kategorie: "Küchengeräte", notizen: "Verschiedene Größen" },
        { name: "Schöpfkellen", menge: 4, kategorie: "Küchengeräte", notizen: "Ausgabe" },
        { name: "Küchenmesser", menge: 6, kategorie: "Küchengeräte", notizen: "Chefmesser + Gemüsemesser" },
        { name: "Gemüseschäler", menge: 4, kategorie: "Küchengeräte", notizen: "Standard" },
        { name: "Küchenwaage", menge: 2, kategorie: "Küchengeräte", notizen: "Bis 10kg" },
        { name: "Spülmittel", menge: 4, kategorie: "Reinigung", notizen: "Konzentrat" },
        { name: "Schwämme", menge: 12, kategorie: "Reinigung", notizen: "Spülschwämme" },
        { name: "Handtücher", menge: 8, kategorie: "Reinigung", notizen: "Küchenhandtücher" },
        { name: "Arbeitshandschuhe", menge: 12, kategorie: "Schutzausrüstung", notizen: "Hitze beständig" },
        { name: "Schürzen", menge: 6, kategorie: "Schutzausrüstung", notizen: "Küchenschürzen" },
        { name: "Wasserkanister 20L", menge: 4, kategorie: "Wasseraufbereitung", notizen: "Trinkwasser" }
    ],

    hikKVLagerDefault: [
        { name: "Kochtopf 100L", menge: 4, kategorie: "Kochausrüstung", notizen: "Hauptkochtopf - Lagervorrat" },
        { name: "Kochtopf 60L", menge: 2, kategorie: "Kochausrüstung", notizen: "Zwischengröße - Lagervorrat" },
        { name: "Kochtopf 30L", menge: 3, kategorie: "Kochausrüstung", notizen: "Für Soßen - Lagervorrat" },
        { name: "Gasbrenner 15kW", menge: 8, kategorie: "Brenner & Energie", notizen: "Hauptbrenner - Lagervorrat" },
        { name: "Reservegasflasche", menge: 12, kategorie: "Brenner & Energie", notizen: "11kg Propan - Lagervorrat" },
        { name: "Feldkochgeschirr", menge: 600, kategorie: "Geschirr", notizen: "Für 600 Personen - Lagervorrat" },
        { name: "Besteck-Sets", menge: 600, kategorie: "Besteck", notizen: "Messer, Gabel, Löffel - Lagervorrat" },
        { name: "Becher", menge: 600, kategorie: "Geschirr", notizen: "300ml Trinkbecher - Lagervorrat" },
        { name: "Schneidbretter groß", menge: 8, kategorie: "Küchengeräte", notizen: "Kunststoff - Lagervorrat" },
        { name: "Kochlöffel", menge: 12, kategorie: "Küchengeräte", notizen: "Verschiedene Größen - Lagervorrat" },
        { name: "Schöpfkellen", menge: 8, kategorie: "Küchengeräte", notizen: "Ausgabe - Lagervorrat" },
        { name: "Küchenmesser", menge: 12, kategorie: "Küchengeräte", notizen: "Chefmesser + Gemüsemesser - Lagervorrat" },
        { name: "Gemüseschäler", menge: 8, kategorie: "Küchengeräte", notizen: "Standard - Lagervorrat" },
        { name: "Küchenwaage", menge: 4, kategorie: "Küchengeräte", notizen: "Bis 10kg - Lagervorrat" },
        { name: "Spülmittel", menge: 8, kategorie: "Reinigung", notizen: "Konzentrat - Lagervorrat" },
        { name: "Schwämme", menge: 24, kategorie: "Reinigung", notizen: "Spülschwämme - Lagervorrat" },
        { name: "Handtücher", menge: 16, kategorie: "Reinigung", notizen: "Küchenhandtücher - Lagervorrat" },
        { name: "Arbeitshandschuhe", menge: 24, kategorie: "Schutzausrüstung", notizen: "Hitze beständig - Lagervorrat" },
        { name: "Schürzen", menge: 12, kategorie: "Schutzausrüstung", notizen: "Küchenschürzen - Lagervorrat" },
        { name: "Wasserkanister 20L", menge: 8, kategorie: "Wasseraufbereitung", notizen: "Trinkwasser - Lagervorrat" }
    ],

    // GW-Beladung Funktionen
    fuegeGWEquipmentHinzu(equipment) {
        this.gwBeladung.push({
            id: Date.now() + Math.random(),
            name: equipment.name,
            menge: parseInt(equipment.menge),
            kategorie: equipment.kategorie,
            notizen: equipment.notizen,
            hinzugefuegtAm: new Date().toISOString()
        });
        this.speichereGW();
        this.aktualisiereGWAnzeige();
    },

    entferneGW(id) {
        this.gwBeladung = this.gwBeladung.filter(item => item.id !== id);
        this.speichereGW();
        this.aktualisiereGWAnzeige();
    },

    gwLeeren() {
        if (confirm('Möchten Sie wirklich die gesamte GW-Beladung löschen?')) {
            this.gwBeladung = [];
            this.speichereGW();
            this.aktualisiereGWAnzeige();
        }
    },

    speichereGW() {
        localStorage.setItem('equipment_gw', JSON.stringify(this.gwBeladung));
        // Automatische Cloud-Synchronisation
        CloudStorage.saveToCloud('equipment_gw', this.gwBeladung).catch(error => {
            console.error('Auto-Sync fehlgeschlagen:', error);
        });
    },

    // KV-Lager Funktionen
    fuegeKVLagerHinzu(equipment) {
        this.kvLager.push({
            id: Date.now() + Math.random(),
            name: equipment.name,
            menge: parseInt(equipment.menge),
            kategorie: equipment.kategorie,
            notizen: equipment.notizen,
            hinzugefuegtAm: new Date().toISOString()
        });
        this.speichereKVLager();
        this.aktualisiereKVLagerAnzeige();
    },

    entferneKVLager(id) {
        this.kvLager = this.kvLager.filter(item => item.id !== id);
        this.speichereKVLager();
        this.aktualisiereKVLagerAnzeige();
    },

    kvLagerLeeren() {
        if (confirm('Möchten Sie wirklich das gesamte KV-Lager leeren?')) {
            this.kvLager = [];
            this.speichereKVLager();
            this.aktualisiereKVLagerAnzeige();
        }
    },

    speichereKVLager() {
        localStorage.setItem('equipment_kv_lager', JSON.stringify(this.kvLager));
        // Automatische Cloud-Synchronisation
        CloudStorage.saveToCloud('equipment_kv_lager', this.kvLager).catch(error => {
            console.error('Auto-Sync fehlgeschlagen:', error);
        });
    },

    // Cloud-Synchronisation für Equipment
    async syncWithCloud(type) {
        try {
            if (type === 'gw') {
                const cloudData = await CloudStorage.loadFromCloud('equipment_gw');
                if (cloudData && cloudData.length > 0) {
                    this.gwBeladung = cloudData;
                    this.speichereGW();
                    this.aktualisiereGWAnzeige();
                    alert('✅ GW-Beladung mit Cloud synchronisiert!');
                } else {
                    alert('ℹ️ Keine GW-Daten in der Cloud gefunden.');
                }
            } else if (type === 'kv-lager') {
                const cloudData = await CloudStorage.loadFromCloud('equipment_kv_lager');
                if (cloudData && cloudData.length > 0) {
                    this.kvLager = cloudData;
                    this.speichereKVLager();
                    this.aktualisiereKVLagerAnzeige();
                    alert('✅ KV-Lager mit Cloud synchronisiert!');
                } else {
                    alert('ℹ️ Keine KV-Lager-Daten in der Cloud gefunden.');
                }
            }
        } catch (error) {
            console.error('Cloud-Sync fehlgeschlagen:', error);
            alert('❌ Synchronisation mit Cloud fehlgeschlagen!');
        }
    },

    // Transfer-Funktionen
    transferToVehicle(itemId) {
        const item = this.kvLager.find(i => i.id === itemId);
        if (item && item.menge > 0) {
            item.menge -= 1;
            
            const existingInVehicle = this.gwBeladung.find(i => i.name === item.name);
            if (existingInVehicle) {
                existingInVehicle.menge += 1;
            } else {
                this.gwBeladung.push({
                    id: Date.now() + Math.random(),
                    name: item.name,
                    menge: 1,
                    kategorie: item.kategorie,
                    notizen: item.notizen + " (vom KV-Lager)",
                    hinzugefuegtAm: new Date().toISOString()
                });
            }
            
            if (item.menge === 0) {
                this.kvLager = this.kvLager.filter(i => i.id !== itemId);
            }
            
            this.speichereGW();
            this.speichereKVLager();
            this.aktualisiereGWAnzeige();
            this.aktualisiereKVLagerAnzeige();
            
            alert(`1x ${item.name} wurde auf das Fahrzeug geladen.`);
        }
    },

    transferToStorage(itemId) {
        const item = this.gwBeladung.find(i => i.id === itemId);
        if (item && item.menge > 0) {
            item.menge -= 1;
            
            const existingInStorage = this.kvLager.find(i => i.name === item.name);
            if (existingInStorage) {
                existingInStorage.menge += 1;
            } else {
                this.kvLager.push({
                    id: Date.now() + Math.random(),
                    name: item.name,
                    menge: 1,
                    kategorie: item.kategorie,
                    notizen: item.notizen + " (vom Fahrzeug)",
                    hinzugefuegtAm: new Date().toISOString()
                });
            }
            
            if (item.menge === 0) {
                this.gwBeladung = this.gwBeladung.filter(i => i.id !== itemId);
            }
            
            this.speichereGW();
            this.speichereKVLager();
            this.aktualisiereGWAnzeige();
            this.aktualisiereKVLagerAnzeige();
            
            alert(`1x ${item.name} wurde ins KV-Lager geräumt.`);
        }
    },

    transferAllToVehicle() {
        if (this.kvLager.length === 0) {
            alert("KV-Lager ist leer!");
            return;
        }
        
        if (confirm('Möchten Sie ALLE verfügbaren Gegenstände vom KV-Lager auf das Fahrzeug laden?')) {
            this.kvLager.forEach(lagerItem => {
                const existingInVehicle = this.gwBeladung.find(vehicleItem => vehicleItem.name === lagerItem.name);
                if (existingInVehicle) {
                    existingInVehicle.menge += lagerItem.menge;
                } else {
                    this.gwBeladung.push({
                        ...lagerItem,
                        id: Date.now() + Math.random(),
                        notizen: lagerItem.notizen + " (vom KV-Lager transferiert)"
                    });
                }
            });
            
            this.kvLager = [];
            this.speichereGW();
            this.speichereKVLager();
            this.aktualisiereGWAnzeige();
            this.aktualisiereKVLagerAnzeige();
            
            alert("Komplettes KV-Lager wurde auf das Fahrzeug geladen!");
        }
    },

    transferAllToStorage() {
        if (this.gwBeladung.length === 0) {
            alert("Fahrzeug ist leer!");
            return;
        }
        
        if (confirm('Möchten Sie ALLE Gegenstände vom Fahrzeug ins KV-Lager räumen?')) {
            this.gwBeladung.forEach(vehicleItem => {
                const existingInStorage = this.kvLager.find(lagerItem => lagerItem.name === vehicleItem.name);
                if (existingInStorage) {
                    existingInStorage.menge += vehicleItem.menge;
                } else {
                    this.kvLager.push({
                        ...vehicleItem,
                        id: Date.now() + Math.random(),
                        notizen: vehicleItem.notizen + " (vom Fahrzeug transferiert)"
                    });
                }
            });
            
            this.gwBeladung = [];
            this.speichereGW();
            this.speichereKVLager();
            this.aktualisiereGWAnzeige();
            this.aktualisiereKVLagerAnzeige();
            
            alert("Komplette Fahrzeugbeladung wurde ins KV-Lager geräumt!");
        }
    },

    syncInventory() {
        let synced = false;
        
        const allItems = {};
        
        [...this.gwBeladung, ...this.kvLager].forEach(item => {
            if (!allItems[item.name]) {
                allItems[item.name] = { ...item, gesamtMenge: 0, quellen: [] };
            }
            allItems[item.name].gesamtMenge += item.menge;
            allItems[item.name].quellen.push({
                typ: this.gwBeladung.includes(item) ? 'Fahrzeug' : 'Lager',
                menge: item.menge
            });
        });
        
        Object.values(allItems).forEach(item => {
            const targetVehicle = Math.ceil(item.gesamtMenge * 0.5);
            const targetStorage = item.gesamtMenge - targetVehicle;
            
            const currentVehicle = this.gwBeladung.find(i => i.name === item.name)?.menge || 0;
            const currentStorage = this.kvLager.find(i => i.name === item.name)?.menge || 0;
            
            if (currentVehicle !== targetVehicle || currentStorage !== targetStorage) {
                synced = true;
                
                const vehicleItem = this.gwBeladung.find(i => i.name === item.name);
                if (vehicleItem) {
                    vehicleItem.menge = targetVehicle;
                } else if (targetVehicle > 0) {
                    this.gwBeladung.push({
                        id: Date.now() + Math.random(),
                        name: item.name,
                        menge: targetVehicle,
                        kategorie: item.kategorie,
                        notizen: item.notizen + " (synchronisiert)",
                        hinzugefuegtAm: new Date().toISOString()
                    });
                }
                
                const storageItem = this.kvLager.find(i => i.name === item.name);
                if (storageItem) {
                    storageItem.menge = targetStorage;
                } else if (targetStorage > 0) {
                    this.kvLager.push({
                        id: Date.now() + Math.random(),
                        name: item.name,
                        menge: targetStorage,
                        kategorie: item.kategorie,
                        notizen: item.notizen + " (synchronisiert)",
                        hinzugefuegtAm: new Date().toISOString()
                    });
                }
            }
        });
        
        this.gwBeladung = this.gwBeladung.filter(item => item.menge > 0);
        this.kvLager = this.kvLager.filter(item => item.menge > 0);
        
        this.speichereGW();
        this.speichereKVLager();
        this.aktualisiereGWAnzeige();
        this.aktualisiereKVLagerAnzeige();
        
        if (synced) {
            alert("Bestände wurden erfolgreich synchronisiert (50% Fahrzeug / 50% Lager)!");
        } else {
            alert("Bestände sind bereits optimal verteilt!");
        }
    },

    ladeHIKDefault(typ) {
        if (typ === 'gw') {
            this.gwBeladung = [...this.hikGWDefault.map(item => ({
                ...item,
                id: Date.now() + Math.random(),
                hinzugefuegtAm: new Date().toISOString()
            }))];
            this.speichereGW();
            this.aktualisiereGWAnzeige();
            alert('HIK 3.0 Default Beladung für GW-Verpflegung geladen!');
        } else if (typ === 'kv-lager') {
            this.kvLager = [...this.hikKVLagerDefault.map(item => ({
                ...item,
                id: Date.now() + Math.random(),
                hinzugefuegtAm: new Date().toISOString()
            }))];
            this.speichereKVLager();
            this.aktualisiereKVLagerAnzeige();
            alert('HIK 3.0 Default für KV-Lager geladen!');
        }
    },

    aktualisiereGWAnzeige() {
        const container = document.getElementById('gw-beladung');
        if (this.gwBeladung.length === 0) {
            container.innerHTML = '<p>Keine Equipment im GW-Verpflegung.</p>';
            return;
        }

        let html = '<h4>Aktuelle GW-Beladung</h4>';
        
        const kategorien = {};
        this.gwBeladung.forEach(item => {
            if (!kategorien[item.kategorie]) {
                kategorien[item.kategorie] = [];
            }
            kategorien[item.kategorie].push(item);
        });

        Object.keys(kategorien).sort().forEach(kategorie => {
            html += `<h5>${kategorie}</h5>`;
            kategorien[kategorie].forEach(item => {
                html += `
                    <div class="lager-item">
                        <div style="flex: 1;">
                            <strong>${item.name}</strong><br>
                            <small>Menge: ${item.menge} • Kategorie: ${item.kategorie}</small>
                            ${item.notizen ? `<br><small>Notiz: ${item.notizen}</small>` : ''}
                        </div>
                        <div>
                            <button onclick="EquipmentManager.transferToStorage(${item.id})" class="secondary" title="Ins Lager räumen">🏢</button>
                            <button onclick="EquipmentManager.entferneGW(${item.id})" class="secondary">Entfernen</button>
                        </div>
                    </div>
                `;
            });
        });

        container.innerHTML = html;
    },

    aktualisiereKVLagerAnzeige() {
        const container = document.getElementById('kv-lager');
        if (this.kvLager.length === 0) {
            container.innerHTML = '<p>Keine Equipment im KV-Lager.</p>';
            return;
        }

        let html = '<h4>Aktueller KV-Lagerbestand</h4>';
        
        const kategorien = {};
        this.kvLager.forEach(item => {
            if (!kategorien[item.kategorie]) {
                kategorien[item.kategorie] = [];
            }
            kategorien[item.kategorie].push(item);
        });

        Object.keys(kategorien).sort().forEach(kategorie => {
            html += `<h5>${kategorie}</h5>`;
            kategorien[kategorie].forEach(item => {
                html += `
                    <div class="lager-item">
                        <div style="flex: 1;">
                            <strong>${item.name}</strong><br>
                            <small>Menge: ${item.menge} • Kategorie: ${item.kategorie}</small>
                            ${item.notizen ? `<br><small>Notiz: ${item.notizen}</small>` : ''}
                        </div>
                        <div>
                            <button onclick="EquipmentManager.transferToVehicle(${item.id})" class="equipment" title="Auf Fahrzeug laden">🚚</button>
                            <button onclick="EquipmentManager.entferneKVLager(${item.id})" class="secondary" title="Aus Lager entfernen">Entfernen</button>
                        </div>
                    </div>
                `;
            });
        });

        container.innerHTML = html;
    },

    berechneEinsatzMaterial() {
        const personen = parseInt(document.getElementById('einsatz-personen').value) || 50;
        const dauer = parseInt(document.getElementById('einsatz-dauer').value) || 1;
        const quelle = document.querySelector('input[name="material-quelle"]:checked').value;
        
        let ergebnisHTML = `<div class="einsatz-ergebnis">
            <h4>Einsatzmaterial für ${personen} Personen (${dauer} Tag${dauer > 1 ? 'e' : ''})</h4>
            <p><strong>Material-Quelle:</strong> ${quelle === 'auto' ? 'Zuerst Fahrzeug, dann Lager' : 'Zuerst Lager, dann Fahrzeug'}</p>
        `;
        
        ergebnisHTML += `
            <h5>Benötigtes Material:</h5>
            <ul>
                <li>Geschirr: ${personen} Sets</li>
                <li>Besteck: ${personen} Sets</li>
                <li>Kochtöpfe: ${Math.ceil(personen / 100)} große Töpfe</li>
                <li>Gasflaschen: ${Math.ceil(personen / 50)} Stück</li>
                <li>Verbandmaterial: Basis-Set + ${Math.ceil(personen / 10)} Erweiterungen</li>
            </ul>
            
            <h5>Quellen-Zuordnung:</h5>
            <p>Die Materialien werden entsprechend der gewählten Quelle (${quelle === 'auto' ? 'Fahrzeug zuerst' : 'Lager zuerst'}) zugeordnet.</p>
            
            <div class="cloud-actions">
                <button onclick="druckeEinsatzliste()" class="equipment">🖨️ Einsatzliste drucken</button>
                <button onclick="exportEinsatzPDF()" class="pdf">📥 Einsatz als PDF</button>
            </div>
        </div>`;
        
        document.getElementById('einsatz-ergebnis').innerHTML = ergebnisHTML;
    }
};
