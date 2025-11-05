// =============================================
// LAGERVERWALTUNG MIT CLOUD SYNC
// =============================================

const LagerManager = {
    lagerbestand: JSON.parse(localStorage.getItem('feldkueche_lager')) || [],

    fuegeHinzu(lebensmittel) {
        this.lagerbestand.push({
            id: Date.now() + Math.random(),
            name: lebensmittel.name,
            menge: parseFloat(lebensmittel.menge),
            einheit: lebensmittel.einheit,
            kategorie: lebensmittel.kategorie,
            haltbarkeit: lebensmittel.haltbarkeit,
            notizen: lebensmittel.notizen,
            hinzugefuegtAm: new Date().toISOString()
        });
        this.speichere();
        this.aktualisiereAnzeige();
    },

    entferne(id) {
        this.lagerbestand = this.lagerbestand.filter(item => item.id !== id);
        this.speichere();
        this.aktualisiereAnzeige();
    },

    leeren() {
        this.lagerbestand = [];
        this.speichere();
        this.aktualisiereAnzeige();
    },

    speichere() {
        localStorage.setItem('feldkueche_lager', JSON.stringify(this.lagerbestand));
        // Automatische Cloud-Synchronisation
        CloudStorage.saveToCloud('feldkueche_lager', this.lagerbestand).catch(error => {
            console.error('Auto-Sync fehlgeschlagen:', error);
        });
    },

    // Cloud-Synchronisation für Lager
    async syncWithCloud() {
        try {
            const cloudData = await CloudStorage.loadFromCloud('feldkueche_lager');
            if (cloudData && cloudData.length > 0) {
                this.lagerbestand = cloudData;
                this.speichere();
                this.aktualisiereAnzeige();
                alert('✅ Lebensmittel-Lager mit Cloud synchronisiert!');
            } else {
                alert('ℹ️ Keine Lager-Daten in der Cloud gefunden.');
            }
        } catch (error) {
            console.error('Cloud-Sync fehlgeschlagen:', error);
            alert('❌ Synchronisation mit Cloud fehlgeschlagen!');
        }
    },

    pruefeHaltbarkeit(datum) {
        if (!datum) return 'unbekannt';
        const heute = new Date();
        const haltbarkeit = new Date(datum);
        const tage = Math.ceil((haltbarkeit - heute) / (1000 * 60 * 60 * 24));
        
        if (tage < 0) return 'abgelaufen';
        if (tage <= 7) return 'bald_ablaufend';
        return 'ok';
    },

    aktualisiereAnzeige() {
        const container = document.getElementById('lager-bestand');
        if (this.lagerbestand.length === 0) {
            container.innerHTML = '<p>Keine Lebensmittel im Lager.</p>';
            return;
        }

        let html = '<h3>Lagerbestand</h3>';
        
        const kategorien = {};
        this.lagerbestand.forEach(item => {
            if (!kategorien[item.kategorie]) {
                kategorien[item.kategorie] = [];
            }
            kategorien[item.kategorie].push(item);
        });

        Object.keys(kategorien).sort().forEach(kategorie => {
            html += `<h4>${kategorie}</h4>`;
            kategorien[kategorie].forEach(item => {
                const haltbarkeit = this.pruefeHaltbarkeit(item.haltbarkeit);
                const klasse = haltbarkeit === 'abgelaufen' ? 'expired' : 
                              haltbarkeit === 'bald_ablaufend' ? 'expiring-soon' : '';
                
                const haltbarkeitsText = item.haltbarkeit ? 
                    new Date(item.haltbarkeit).toLocaleDateString('de-DE') : 'Kein Datum';
                
                html += `
                    <div class="lager-item ${klasse}">
                        <div style="flex: 1;">
                            <strong>${item.name}</strong><br>
                            <small>${item.menge} ${item.einheit} • Haltbar bis: ${haltbarkeitsText}</small>
                            ${item.notizen ? `<br><small>Notiz: ${item.notizen}</small>` : ''}
                        </div>
                        <button onclick="LagerManager.entferne(${item.id})" class="secondary">Entfernen</button>
                    </div>
                `;
            });
        });

        container.innerHTML = html;
    }
};
