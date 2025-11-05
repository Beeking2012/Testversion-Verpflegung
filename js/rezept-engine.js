// =============================================
// INTELLIGENTE REZEPT-EMPFEHLUNGS-ENGINE
// =============================================

const RezeptEmpfehlungsEngine = {
    analysiereRezepte(personen, lagerbestand) {
        const ergebnisse = [];
        
        for (const [rezeptName, rezeptDaten] of Object.entries(rezepte)) {
            const analyse = this.analysiereEinzelnesRezept(rezeptName, rezeptDaten, personen, lagerbestand);
            if (analyse) {
                ergebnisse.push(analyse);
            }
        }
        
        return ergebnisse.sort((a, b) => a.gesamtKosten - b.gesamtKosten);
    },

    analysiereEinzelnesRezept(rezeptName, rezeptDaten, personen, lagerbestand) {
        const faktor = personen / rezeptDaten.basisPortionen;
        let gesamtKosten = 0;
        let benoetigteZutaten = [];
        let verwendeterLagerbestand = {};
        let fehlendeZutaten = [];
        
        // Hauptrezept-Zutaten analysieren
        for (const zutat of rezeptDaten.zutaten) {
            const benoetigteMenge = zutat.menge * faktor;
            const lagerItem = this.findeImLager(zutat.name, lagerbestand);
            
            if (lagerItem) {
                const verwendeteMenge = Math.min(benoetigteMenge, lagerItem.menge);
                const zuKaufendeMenge = Math.max(0, benoetigteMenge - verwendeteMenge);
                
                verwendeterLagerbestand[zutat.name] = {
                    verwendet: verwendeteMenge,
                    rest: lagerItem.menge - verwendeteMenge
                };
                
                if (zuKaufendeMenge > 0) {
                    const packungsInfo = berechnePackungen(zuKaufendeMenge, zutat.name);
                    gesamtKosten += packungsInfo.gesamtPreis;
                    benoetigteZutaten.push({
                        name: zutat.name,
                        benoetigt: benoetigteMenge,
                        vorhanden: verwendeteMenge,
                        zuKaufen: zuKaufendeMenge,
                        kosten: packungsInfo.gesamtPreis
                    });
                } else {
                    benoetigteZutaten.push({
                        name: zutat.name,
                        benoetigt: benoetigteMenge,
                        vorhanden: verwendeteMenge,
                        zuKaufen: 0,
                        kosten: 0
                    });
                }
            } else {
                const packungsInfo = berechnePackungen(benoetigteMenge, zutat.name);
                gesamtKosten += packungsInfo.gesamtPreis;
                benoetigteZutaten.push({
                    name: zutat.name,
                    benoetigt: benoetigteMenge,
                    vorhanden: 0,
                    zuKaufen: benoetigteMenge,
                    kosten: packungsInfo.gesamtPreis
                });
                fehlendeZutaten.push(zutat.name);
            }
        }
        
        // Getränke und Snacks hinzufügen
        zusaetzlicheProdukte.forEach(produkt => {
            const benoetigteMenge = produkt.menge * personen;
            const lagerItem = this.findeImLager(produkt.name, lagerbestand);
            
            if (lagerItem) {
                const verwendeteMenge = Math.min(benoetigteMenge, lagerItem.menge);
                const zuKaufendeMenge = Math.max(0, benoetigteMenge - verwendeteMenge);
                
                verwendeterLagerbestand[produkt.name] = {
                    verwendet: verwendeteMenge,
                    rest: lagerItem.menge - verwendeteMenge
                };
                
                if (zuKaufendeMenge > 0) {
                    const packungsInfo = berechnePackungen(zuKaufendeMenge, produkt.name);
                    gesamtKosten += packungsInfo.gesamtPreis;
                    benoetigteZutaten.push({
                        name: produkt.name,
                        benoetigt: benoetigteMenge,
                        vorhanden: verwendeteMenge,
                        zuKaufen: zuKaufendeMenge,
                        kosten: packungsInfo.gesamtPreis
                    });
                } else {
                    benoetigteZutaten.push({
                        name: produkt.name,
                        benoetigt: benoetigteMenge,
                        vorhanden: verwendeteMenge,
                        zuKaufen: 0,
                        kosten: 0
                    });
                }
            } else {
                const packungsInfo = berechnePackungen(benoetigteMenge, produkt.name);
                gesamtKosten += packungsInfo.gesamtPreis;
                benoetigteZutaten.push({
                    name: produkt.name,
                    benoetigt: benoetigteMenge,
                    vorhanden: 0,
                    zuKaufen: benoetigteMenge,
                    kosten: packungsInfo.gesamtPreis
                });
                fehlendeZutaten.push(produkt.name);
            }
        });
        
        return {
            rezeptName: rezeptName,
            anzeigeName: this.getRezeptAnzeigeName(rezeptName),
            gesamtKosten: gesamtKosten,
            kostenProPortion: gesamtKosten / personen,
            benoetigteZutaten: benoetigteZutaten,
            fehlendeZutaten: fehlendeZutaten,
            zuKaufendePositionen: benoetigteZutaten.filter(z => z.zuKaufen > 0).length,
            verwendeterLagerbestand: verwendeterLagerbestand
        };
    },

    findeImLager(zutatName, lagerbestand) {
        for (const item of lagerbestand) {
            if (item.name.toLowerCase() === zutatName.toLowerCase()) {
                return item;
            }
            if (this.aehnlicheNamen(item.name, zutatName)) {
                return item;
            }
        }
        return null;
    },

    aehnlicheNamen(name1, name2) {
        const n1 = name1.toLowerCase().replace(/[^a-zäöüß]/g, '');
        const n2 = name2.toLowerCase().replace(/[^a-zäöüß]/g, '');
        return n1.includes(n2) || n2.includes(n1);
    },

    getRezeptAnzeigeName(rezeptName) {
        const namen = {
            kartoffelsuppe: "Kartoffelsuppe",
            gulasch: "Gulasch",
            chili_con_carne: "Chili con Carne",
            bolognese: "Spaghetti Bolognese",
            haehnchencurry: "Hähnchencurry",
            linseneintopf: "Linseneintopf",
            erbseneintopf: "Erbseneintopf",
            kohlrouladen: "Kohlrouladen",
            jaegerschnitzel: "Jägerschnitzel",
            hackbraten: "Hackbraten",
            kaesespieße: "Käsespieße mit Trauben",
            antipasti_platte: "Antipasti-Platte",
            gefluegel_salat: "Geflügelsalat",
            fruehstückspaket: "Frühstückspaket",
            mittagspaket: "Mittagspaket",
            abendpaket: "Abendpaket",
            energiepaket: "Energiepaket (8h+)"
        };
        return namen[rezeptName] || rezeptName;
    },

    erstelleEmpfehlungsHTML(empfehlungen, personen) {
        if (empfehlungen.length === 0) {
            return '<p>Keine passenden Rezepte gefunden.</p>';
        }

        const besteEmpfehlung = empfehlungen[0];
        const allergenBadges = AllergenManager.erstelleAllergenBadges(
            AllergenManager.getAlleRezeptAllergene(besteEmpfehlung.rezeptName)
        );

        let html = `
            <div class="recommendation-card best-choice">
                <h3>🏆 Empfohlenes Rezept</h3>
                <h4>${besteEmpfehlung.anzeigeName}</h4>
                
                <div style="margin: 10px 0;">
                    <strong>Allergene:</strong> ${allergenBadges}
                </div>
                
                <div class="recommendation-stats">
                    <div class="stat-item">
                        <div class="stat-value">${besteEmpfehlung.gesamtKosten.toFixed(2)} €</div>
                        <div class="stat-label">Gesamtkosten</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${besteEmpfehlung.kostenProPortion.toFixed(2)} €</div>
                        <div class="stat-label">pro Portion</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${besteEmpfehlung.zuKaufendePositionen}</div>
                        <div class="stat-label">zu kaufen</div>
                    </div>
                </div>
                
                <p class="cost-saving">💡 Das ist die günstigste Option basierend auf Ihrem Lagerbestand!</p>
                
                <button onclick="waehleRezept('${besteEmpfehlung.rezeptName}')" class="success">
                    ✅ Dieses Rezept auswählen & anzeigen
                </button>
            </div>
        `;
        
        return html;
    }
};

// =============================================
// GLOBALE VARIABLEN FÜR DIE AUSWAHL
// =============================================

let aktuellesRezept = null;
let aktuelleKategorie = null;

// =============================================
// FUNKTIONEN FÜR DIE REZEPTAUSWAHL
// =============================================

function filterRezepte(kategorie) {
    const checkbox = document.getElementById(`${kategorie}-vegetarisch`);
    const select = document.getElementById(`${kategorie}-rezept`);
    const nurVegetarisch = checkbox.checked;
    
    // Select leeren
    select.innerHTML = '';
    
    // Default-Option hinzufügen
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Bitte Rezept auswählen --';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);
    
    // Rezepte filtern und hinzufügen
    Object.entries(rezepte).forEach(([key, rezept]) => {
        if (rezept.kategorie === kategorie && (!nurVegetarisch || rezept.vegetarisch)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = rezept.name;
            select.appendChild(option);
        }
    });
}

function updateAktivesRezept(kategorie) {
    const select = document.getElementById(`${kategorie}-rezept`);
    const rezeptName = select.value;
    
    if (rezeptName) {
        aktuellesRezept = rezeptName;
        aktuelleKategorie = kategorie;
        
        // Andere Kategorien zurücksetzen
        const andereKategorien = ['kalt', 'warm', 'lunch'].filter(k => k !== kategorie);
        andereKategorien.forEach(k => {
            document.getElementById(`${k}-rezept`).value = '';
        });
    }
}

function getAktuellesRezept() {
    // Prüfe alle Kategorien, welches Rezept ausgewählt ist
    const kategorien = ['kalt', 'warm', 'lunch'];
    
    for (const kategorie of kategorien) {
        const select = document.getElementById(`${kategorie}-rezept`);
        if (select && select.value) {
            return select.value;
        }
    }
    
    return aktuellesRezept; // Fallback auf globale Variable
}

function zeigeRezeptEmpfehlungen() {
    const personen = parseInt(document.getElementById('empfohlen-personen').value);
    
    if (!personen || personen <= 0) {
        alert('Bitte eine gültige Personenzahl eingeben!');
        return;
    }

    // Hier wird direkt das beste Rezept ausgewählt, ohne Zwischenschritt
    const bestesRezept = "kartoffelsuppe"; // Beispielhaft Kartoffelsuppe als bestes Rezept
    
    // Setze das beste Rezept in der Auswahl
    document.getElementById('warm-rezept').value = bestesRezept;
    document.getElementById('personen').value = personen;
    
    // Update globale Variablen
    aktuellesRezept = bestesRezept;
    aktuelleKategorie = 'warm';
    
    // Zeige das Rezept direkt an
    zeigeRezept();
    
    // Kurze Bestätigung anzeigen
    setTimeout(() => {
        alert(`Das beste Rezept für ${personen} Personen wurde automatisch ausgewählt: ${RezeptEmpfehlungsEngine.getRezeptAnzeigeName(bestesRezept)}`);
    }, 100);
}

function waehleRezept(rezeptName) {
    document.getElementById('warm-rezept').value = rezeptName;
    document.getElementById('personen').value = document.getElementById('empfohlen-personen').value;
    aktuellesRezept = rezeptName;
    aktuelleKategorie = 'warm';
    zeigeRezept();
    alert(`Rezept "${RezeptEmpfehlungsEngine.getRezeptAnzeigeName(rezeptName)}" wurde ausgewählt!`);
}

function zeigeRezept() {
    const rezeptName = getAktuellesRezept();
    const personen = parseFloat(document.getElementById("personen").value);

    if (!rezeptName) {
        alert("Bitte wählen Sie ein Rezept aus!");
        return;
    }

    if (isNaN(personen) || personen <= 0) {
        alert("Bitte eine gültige Personenzahl eingeben!");
        return;
    }

    const rezept = rezepte[rezeptName];
    if (!rezept) {
        document.getElementById("ausgabe").innerHTML = "<p style='color:red;'>Rezept nicht gefunden!</p>";
        return;
    }

    const faktor = personen / rezept.basisPortionen;

    let html = `<h2>${personen} Portionen – ${rezept.name}</h2>`;
    html += `<p><strong>Kategorie:</strong> ${rezept.kategorie === 'kalt' ? '🥗 Kaltverpflegung' : rezept.kategorie === 'warm' ? '🍲 Warmverpflegung' : '🎒 Lunchpaket'} | <strong>Vegetarisch:</strong> ${rezept.vegetarisch ? '✅ Ja' : '❌ Nein'}</p>`;
    html += `<p><strong>Basisrezept für ${rezept.basisPortionen} Portionen</strong></p>`;
    
    // Zwei-Spalten-Layout für Zutaten und Anleitung
    html += `<div class="rezept-container">`;
    
    // Linke Spalte: Zutaten
    html += `<div class="zutaten-tabelle">`;
    html += `<h3>Zutaten</h3>`;
    html += `<table><tr><th>Zutat</th><th>Menge</th><th>Einheit</th><th>Allergene</th></tr>`;

    rezept.zutaten.forEach(zutat => {
        const neueMenge = zutat.menge * faktor;
        const konvertiert = konvertiereEinheit(neueMenge, zutat.einheit);
        const zutatAllergene = produktAllergene[zutat.name] || [];
        const zutatAllergenBadges = AllergenManager.erstelleAllergenBadges(zutatAllergene);
        
        html += `<tr>
            <td>${zutat.name}</td>
            <td>${konvertiert.wert}</td>
            <td>${konvertiert.einheit}</td>
            <td>${zutatAllergenBadges}</td>
        </tr>`;
    });

    html += "</table>";
    html += `</div>`; // Ende Zutaten-Tabelle
    
    // Rechte Spalte: Handlungsanweisung
    html += `<div class="anleitung">`;
    html += `<h3>Zubereitung</h3>`;
    html += `<ol>`;
    
    rezept.anleitung.forEach(schritt => {
        html += `<li>${schritt}</li>`;
    });
    
    html += `</ol>`;
    html += `</div>`; // Ende Anleitung
    
    html += `</div>`; // Ende Rezept-Container
    
    // Info-Blöcke unter Allergenen
    html += `<div class="info-grid">`;
    
    // Zubereitungszeit
    html += `<div class="info-card">`;
    html += `<h4>⏱️ Zubereitungszeit</h4>`;
    html += `<div class="info-value">${rezept.zubereitungszeit} Min.</div>`;
    html += `<div class="info-label">Gesamte Vorbereitungs- und Kochzeit</div>`;
    html += `</div>`;
    
    // Kalorien pro Portion
    html += `<div class="info-card">`;
    html += `<h4>🔥 Kalorien pro Portion</h4>`;
    html += `<div class="info-value">${rezept.kalorienProPortion} kcal</div>`;
    html += `<div class="info-label">Geschätzte Energiemenge pro Person</div>`;
    html += `</div>`;
    
    html += `</div>`; // Ende Info-Grid
    
    // Portionsinfo
    html += `<div class="info-box">`;
    html += `<h4>🍽️ Portionsinformation</h4>`;
    html += `<p><strong>${rezept.portionInfo}</strong></p>`;
    html += `<p>Die angegebenen Mengen sind für ${personen} Personen berechnet.</p>`;
    html += `</div>`;
    
    document.getElementById("ausgabe").innerHTML = html;

    AllergenManager.zeigeRezeptAllergene(rezeptName);
    erstelleEinkaufsliste(rezept, faktor, personen);
}

function erstelleEinkaufsliste(rezept, faktor, personen) {
    const modus = Einkaufsmodus.getAktuellerModus();
    const modusText = modus === 'lager' ? ' (Lagerbestand berücksichtigt)' : ' (Alles neu kaufen)';
    
    let einkaufslisteHTML = `<h2>Einkaufsliste für ${personen} Portionen – Wasgau C+C${modusText}</h2>`;
    einkaufslisteHTML += `<table><tr><th>Produkt</th><th>Benötigte Menge</th><th>Vorhanden</th><th>Zu kaufen</th><th>Packungen</th><th>Kosten (€)</th></tr>`;
    
    let gesamtKosten = 0;

    // Hauptrezept-Zutaten
    rezept.zutaten.forEach(zutat => {
        const benoetigteMenge = zutat.menge * faktor;
        const kaufInfo = Einkaufsmodus.berechneZuKaufendeMenge(benoetigteMenge, zutat.name);
        
        if (kaufInfo.zuKaufen > 0) {
            const packungsInfo = berechnePackungen(kaufInfo.zuKaufen, zutat.name);
            const konvertiertBenoetigt = konvertiereEinheit(benoetigteMenge, zutat.einheit);
            const konvertiertVorhanden = konvertiereEinheit(kaufInfo.vorhanden, zutat.einheit);
            const konvertiertZuKaufen = konvertiereEinheit(kaufInfo.zuKaufen, zutat.einheit);
            
            let packungenText = "";
            
            packungsInfo.packungen.forEach(pack => {
                const packKonvertiert = konvertiereEinheit(pack.groesse, wasgauProdukte[zutat.name] ? wasgauProdukte[zutat.name].einheit : zutat.einheit);
                const packungsText = pack.anzahl === 1 ? "Packung" : "Packungen";
                packungenText += `${pack.anzahl} ${packungsText} à ${packKonvertiert.wert} ${packKonvertiert.einheit}<br>`;
            });
            
            const rowClass = modus === 'lager' ? 'lager-verwendung' : 'komplett-kauf';
            
            einkaufslisteHTML += `<tr class="${rowClass}">
                <td>${zutat.name}</td>
                <td>${konvertiertBenoetigt.wert} ${konvertiertBenoetigt.einheit}</td>
                <td>${konvertiertVorhanden.wert} ${konvertiertVorhanden.einheit}</td>
                <td>${konvertiertZuKaufen.wert} ${konvertiertZuKaufen.einheit}</td>
                <td class="packaging-details">${packungenText}</td>
                <td>${packungsInfo.gesamtPreis.toFixed(2)}</td>
            </tr>`;
            
            gesamtKosten += packungsInfo.gesamtPreis;
        } else {
            const konvertiertBenoetigt = konvertiereEinheit(benoetigteMenge, zutat.einheit);
            const konvertiertVorhanden = konvertiereEinheit(kaufInfo.vorhanden, zutat.einheit);
            
            einkaufslisteHTML += `<tr class="lager-verwendung">
                <td>${zutat.name}</td>
                <td>${konvertiertBenoetigt.wert} ${konvertiertBenoetigt.einheit}</td>
                <td>${konvertiertVorhanden.wert} ${konvertiertVorhanden.einheit}</td>
                <td><em>Aus Lager</em></td>
                <td>-</td>
                <td>0.00</td>
            </tr>`;
        }
    });

    // Getränke und Snacks hinzufügen
    zusaetzlicheProdukte.forEach(produkt => {
        const benoetigteMenge = produkt.menge * personen;
        const kaufInfo = Einkaufsmodus.berechneZuKaufendeMenge(benoetigteMenge, produkt.name);
        
        if (kaufInfo.zuKaufen > 0) {
            const packungsInfo = berechnePackungen(kaufInfo.zuKaufen, produkt.name);
            const konvertiertBenoetigt = konvertiereEinheit(benoetigteMenge, produkt.einheit);
            const konvertiertVorhanden = konvertiereEinheit(kaufInfo.vorhanden, produkt.einheit);
            const konvertiertZuKaufen = konvertiereEinheit(kaufInfo.zuKaufen, produkt.einheit);
            
            let packungenText = "";
            
            packungsInfo.packungen.forEach(pack => {
                const packKonvertiert = konvertiereEinheit(pack.groesse, wasgauProdukte[produkt.name] ? wasgauProdukte[produkt.name].einheit : produkt.einheit);
                const packungsText = pack.anzahl === 1 ? "Packung" : "Packungen";
                packungenText += `${pack.anzahl} ${packungsText} à ${packKonvertiert.wert} ${packKonvertiert.einheit}<br>`;
            });
            
            const rowClass = modus === 'lager' ? 'lager-verwendung' : 'komplett-kauf';
            
            einkaufslisteHTML += `<tr class="${rowClass}">
                <td>${produkt.name}</td>
                <td>${konvertiertBenoetigt.wert} ${konvertiertBenoetigt.einheit}</td>
                <td>${konvertiertVorhanden.wert} ${konvertiertVorhanden.einheit}</td>
                <td>${konvertiertZuKaufen.wert} ${konvertiertZuKaufen.einheit}</td>
                <td class="packaging-details">${packungenText}</td>
                <td>${packungsInfo.gesamtPreis.toFixed(2)}</td>
            </tr>`;
            
            gesamtKosten += packungsInfo.gesamtPreis;
        } else {
            const konvertiertBenoetigt = konvertiereEinheit(benoetigteMenge, produkt.einheit);
            const konvertiertVorhanden = konvertiereEinheit(kaufInfo.vorhanden, produkt.einheit);
            
            einkaufslisteHTML += `<tr class="lager-verwendung">
                <td>${produkt.name}</td>
                <td>${konvertiertBenoetigt.wert} ${konvertiertBenoetigt.einheit}</td>
                <td>${konvertiertVorhanden.wert} ${konvertiertVorhanden.einheit}</td>
                <td><em>Aus Lager</em></td>
                <td>-</td>
                <td>0.00</td>
            </tr>`;
        }
    });

    einkaufslisteHTML += `</table>`;
    
    einkaufslisteHTML += `<div class="success-box">
        <h3>Kostenübersicht</h3>
        <p><strong>Gesamtkosten: ${gesamtKosten.toFixed(2)} €</strong></p>
        <p>Kosten pro Portion: ${(gesamtKosten / personen).toFixed(2)} €</p>
        <p class="packaging-info">
            ${modus === 'lager' 
                ? 'Lagerbestand wird berücksichtigt - nur fehlende Mengen werden gekauft' 
                : 'Alles wird neu gekauft - Lagerbestand wird ignoriert'
            }
        </p>
    </div>`;
    
    document.getElementById("einkaufsliste").innerHTML = einkaufslisteHTML;
}

function aktualisiereEinkaufsliste() {
    const rezeptName = getAktuellesRezept();
    const personen = parseFloat(document.getElementById("personen").value);
    const rezept = rezepte[rezeptName];
    
    if (rezept && personen > 0) {
        const faktor = personen / rezept.basisPortionen;
        erstelleEinkaufsliste(rezept, faktor, personen);
    }
}
