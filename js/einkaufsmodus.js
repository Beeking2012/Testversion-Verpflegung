// =============================================
// EINKAUFSMODUS MANAGEMENT
// =============================================

const Einkaufsmodus = {
    aktuellerModus: 'lager',

    getAktuellerModus() {
        const selected = document.querySelector('input[name="einkaufsmodus"]:checked');
        return selected ? selected.value : 'lager';
    },

    berechneZuKaufendeMenge(benoetigteMenge, zutatName) {
        const modus = this.getAktuellerModus();
        
        if (modus === 'komplett') {
            return {
                zuKaufen: benoetigteMenge,
                vorhanden: 0,
                verwendeterLagerbestand: 0
            };
        } else {
            const lagerItem = this.findeImLager(zutatName, LagerManager.lagerbestand);
            
            if (lagerItem) {
                const verwendeteMenge = Math.min(benoetigteMenge, lagerItem.menge);
                const zuKaufendeMenge = Math.max(0, benoetigteMenge - verwendeteMenge);
                
                return {
                    zuKaufen: zuKaufendeMenge,
                    vorhanden: verwendeteMenge,
                    verwendeterLagerbestand: verwendeteMenge
                };
            } else {
                return {
                    zuKaufen: benoetigteMenge,
                    vorhanden: 0,
                    verwendeterLagerbestand: 0
                };
            }
        }
    },

    findeImLager(zutatName, lagerbestand) {
        for (const item of lagerbestand) {
            if (item.name.toLowerCase() === zutatName.toLowerCase()) {
                return item;
            }
            const n1 = item.name.toLowerCase().replace(/[^a-zäöüß]/g, '');
            const n2 = zutatName.toLowerCase().replace(/[^a-zäöüß]/g, '');
            if (n1.includes(n2) || n2.includes(n1)) {
                return item;
            }
        }
        return null;
    }
};
