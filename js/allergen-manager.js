// =============================================
// ALLERGEN-MANAGEMENT FUNKTIONEN
// =============================================

const AllergenManager = {
    getRezeptAllergene(rezeptName) {
        const rezept = rezepte[rezeptName];
        if (!rezept) return [];
        
        const rezeptAllergene = new Set();
        
        rezept.zutaten.forEach(zutat => {
            const zutatAllergene = produktAllergene[zutat.name] || [];
            zutatAllergene.forEach(allergen => rezeptAllergene.add(allergen));
        });
        
        return Array.from(rezeptAllergene);
    },

    getAlleRezeptAllergene(rezeptName) {
        return this.getRezeptAllergene(rezeptName);
    },

    erstelleAllergenBadges(allergenCodes) {
        if (!allergenCodes || allergenCodes.length === 0) {
            return '<span class="allergen-badge allergen-mild">Allergenfrei</span>';
        }
        
        return allergenCodes.map(code => {
            const allergen = allergene[code];
            const kritikalitaetClass = `allergen-${allergen.kritikalitaet === 'hoch' ? 'critical' : 
                                      allergen.kritikalitaet === 'mittel' ? 'moderate' : 'mild'}`;
            return `<span class="allergen-badge ${kritikalitaetClass}" title="${allergen.name}">${allergen.icon} ${code}</span>`;
        }).join(' ');
    },

    zeigeRezeptAllergene(rezeptName) {
        const rezeptAllergene = this.getAlleRezeptAllergene(rezeptName);
        const container = document.getElementById('allergen-anzeige');
        const infoBox = document.getElementById('allergene-info-box');
        
        if (rezeptAllergene.length === 0) {
            container.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="color: #4CAF50; font-size: 1.2em;">✅</span>
                    <div>
                        <strong>Dieses Rezept ist allergenfrei</strong>
                        <p style="margin: 5px 0 0 0; color: #666; font-size: 0.9em;">
                            Enthält keine der 14 Hauptallergene gemäß LMIV
                        </p>
                    </div>
                </div>
            `;
        } else {
            const allergenListe = rezeptAllergene.map(code => {
                const allergen = allergene[code];
                return `<div class="allergen-item-compact">
                    <span class="allergen-badge allergen-${allergen.kritikalitaet === 'hoch' ? 'critical' : 'moderate'}" 
                          style="margin-right: 8px;">${allergen.icon} ${code}</span>
                    ${allergen.name}
                </div>`;
            }).join('');
            
            container.innerHTML = `
                <div style="margin-bottom: 10px;">
                    <strong>Enthaltene Allergene:</strong>
                </div>
                <div class="allergen-grid-compact">
                    ${allergenListe}
                </div>
            `;
        }
        
        infoBox.style.display = 'block';
    }
};

function getRezeptAllergene(rezeptName) {
    return AllergenManager.getRezeptAllergene(rezeptName);
}
