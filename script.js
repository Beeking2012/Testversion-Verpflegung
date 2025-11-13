// Rezepte Daten
const rezepteDaten = [
    {
        id: 1,
        titel: "Feldküchen-Eintopf",
        beschreibung: "Herzhafter Eintopf mit Gemüse und Tofu",
        verpflegungsart: "warm",
        verpflegungstyp: "voll",
        vegetarisch: true,
        kalorien: 450,
        zubereitungszeit: 45,
        zutaten: [
            { menge: 500, einheit: "g", name: "Tofu, gewürfelt" },
            { menge: 4, einheit: "", name: "Kartoffeln, gewürfelt" },
            { menge: 2, einheit: "", name: "Karotten, in Scheiben" },
            { menge: 1, einheit: "", name: "Zwiebel, gewürfelt" },
            { menge: 2, einheit: "EL", name: "Tomatenmark" },
            { menge: 1.5, einheit: "l", name: "Gemüsebrühe" },
            { menge: 2, einheit: "TL", name: "Paprikapulver" },
            { menge: 1, einheit: "Bund", name: "Petersilie, gehackt" },
            { menge: 3, einheit: "EL", name: "Öl" },
            { menge: 1, einheit: "TL", name: "Salz" },
            { menge: 0.5, einheit: "TL", name: "Pfeffer" }
        ],
        zubereitung: [
            "Zwiebel in einem großen Topf mit Öl glasig anschwitzen",
            "Tomatenmark zugeben und kurz mitrösten bis es duftet",
            "Kartoffeln und Karotten hinzufügen, 5 Minuten unter Rühren mitdünsten",
            "Mit Gemüsebrühe ablöschen und kräftig aufkochen lassen",
            "Hitze reduzieren und bei mittlerer Hitze 20 Minuten köcheln lassen",
            "Tofu in Würfeln schneiden und zusammen mit den Gewürzen zugeben",
            "Weitere 10 Minuten köcheln lassen bis die Kartoffeln weich sind",
            "Mit frisch gehackter Petersilie bestreuen und heiß servieren"
        ],
        portionierung: "In feste Feldküchen-Schüsseln portionieren. Pro Person ca. 1,5 Liter Eintopf berechnen. Mit frischem Brot oder Knäckebrot servieren. Für Feldverhältnisse in Thermosbehälter abfüllen."
    },
    {
        id: 2,
        titel: "Militärischer Nudelauflauf",
        beschreibung: "Nährhafter Auflauf mit Käse und Gemüse",
        verpflegungsart: "warm",
        verpflegungstyp: "voll",
        vegetarisch: true,
        kalorien: 520,
        zubereitungszeit: 35,
        zutaten: [
            { menge: 400, einheit: "g", name: "Nudeln (Fusilli oder Penne)" },
            { menge: 200, einheit: "g", name: "Gouda, gerieben" },
            { menge: 1, einheit: "", name: "Brokkoli, in kleinen Röschen" },
            { menge: 1, einheit: "", name: "Paprika, gewürfelt" },
            { menge: 2, einheit: "", name: "Eier" },
            { menge: 200, einheit: "ml", name: "Sahne" },
            { menge: 100, einheit: "ml", name: "Milch" },
            { menge: 1, einheit: "TL", name: "Muskatnuss, frisch gerieben" },
            { menge: 100, einheit: "g", name: "Parmesan, gerieben" },
            { menge: 2, einheit: "EL", name: "Butter" },
            { menge: 1, einheit: "TL", name: "Salz" },
            { menge: 0.5, einheit: "TL", name: "Pfeffer" }
        ],
        zubereitung: [
            "Nudeln in reichlich Salzwasser bissfest kochen, abgießen und abtropfen lassen",
            "Brokkoli waschen, in Röschen teilen und 3 Minuten blanchieren",
            "Ofen auf 200°C Umluft vorheizen",
            "Eier mit Sahne, Milch und Gewürzen verquirlen",
            "Butter in einer Auflaufform schmelzen, Nudeln und Gemüse einfüllen",
            "Geriebenen Gouda unterheben und gleichmäßig verteilen",
            "Eiermischung darüber gießen, alles gut durchmischen",
            "Mit Parmesan bestreuen und im vorgeheizten Ofen 25-30 Minuten backen bis die Oberfläche goldbraun ist"
        ],
        portionierung: "In Auflaufformen portionieren. Pro Person 1/8 der Form. Mit frischem Feldsalat oder eingelegtem Gemüse servieren. Für Außeneinsätze in Aluschalen abfüllen."
    },
    {
        id: 3,
        titel: "Feld-Sandwiches",
        beschreibung: "Praktische Handverpflegung mit Gemüse",
        verpflegungsart: "kalt",
        verpflegungstyp: "hand",
        vegetarisch: true,
        kalorien: 380,
        zubereitungszeit: 15,
        zutaten: [
            { menge: 8, einheit: "Scheiben", name: "Vollkornbrot" },
            { menge: 200, einheit: "g", name: "Frischkäse, natur" },
            { menge: 1, einheit: "", name: "Gurke, in dünnen Scheiben" },
            { menge: 1, einheit: "", name: "Tomate, in dünnen Scheiben" },
            { menge: 4, einheit: "Blätter", name: "Eisbergsalat" },
            { menge: 1, einheit: "", name: "Avocado, reif" },
            { menge: 2, einheit: "EL", name: "Zitronensaft" },
            { menge: 1, einheit: "", name: "Rote Zwiebel, in dünnen Ringen" },
            { menge: 1, einheit: "Prise", name: "Salz" },
            { menge: 1, einheit: "Prise", name: "Pfeffer" },
            { menge: 1, einheit: "TL", name: "getrockneter Dill" }
        ],
        zubereitung: [
            "Brot scheibenweise mit Frischkäse bestreichen",
            "Avocado halbieren, Stein entfernen, Fruchtfleisch herauslöffeln",
            "Avocado mit Zitronensaft, Salz und Pfeffer zerdrücken",
            "Auf 4 Brotscheiben Salatblätter legen",
            "Gurken- und Tomatenscheiben gleichmäßig darauf anordnen",
            "Rote Zwiebelringe darüber verteilen",
            "Avocadocreme gleichmäßig auf den belegten Scheiben verteilen",
            "Mit getrocknetem Dill bestreuen",
            "Mit restlichen Brotscheiben bedecken und leicht andrücken",
            "Sandwiches diagonal durchschneiden für bessere Handhabung"
        ],
        portionierung: "Jedes Sandwich einzeln in Frischhaltefolie oder Butterbrotpapier wickeln. Pro Person 1 Sandwich (2 Dreiecke). Für längere Touren kühl transportieren. Mit Apfel oder Müsliriegel ergänzen."
    },
    {
        id: 4,
        titel: "Energie-Müsli",
        beschreibung: "Kaltes Müsli mit Nüssen und Trockenfrüchten",
        verpflegungsart: "kalt",
        verpflegungstyp: "hand",
        vegetarisch: true,
        kalorien: 420,
        zubereitungszeit: 10,
        zutaten: [
            { menge: 400, einheit: "g", name: "Haferflocken, zart" },
            { menge: 100, einheit: "g", name: "Nüsse, gemischt (Walnüsse, Haselnüsse)" },
            { menge: 100, einheit: "g", name: "Trockenfrüchte (Rosinen, Aprikosen)" },
            { menge: 50, einheit: "g", name: "Sonnenblumenkerne" },
            { menge: 50, einheit: "g", name: "Kürbiskerne" },
            { menge: 4, einheit: "EL", name: "Honig" },
            { menge: 2, einheit: "TL", name: "Zimt" },
            { menge: 1, einheit: "Prise", name: "Salz" },
            { menge: 1, einheit: "l", name: "Milch oder Pflanzenmilch" }
        ],
        zubereitung: [
            "Haferflocken in eine große Schüssel geben",
            "Nüsse grob hacken und zu den Haferflocken geben",
            "Trockenfrüchte klein schneiden und untermischen",
            "Sonnenblumenkerne und Kürbiskerne hinzufügen",
            "Honig, Zimt und eine Prise Salz unterrühren",
            "Alles gut vermengen bis eine gleichmäßige Mischung entsteht",
            "In verschließbare Behälter oder Beutel abfüllen"
        ],
        portionierung: "In wiederverschließbare Beutel oder Dosen portionieren. Pro Person 150g Müsli mit 250ml Milch. Trocken portioniert für Feldverpflegung geeignet. Mit frischen Beeren oder Bananen ergänzbar."
    },
    {
        id: 5,
        titel: "Gulasch mit Fleisch",
        beschreibung: "Klassisches Gulasch nach Feldküchenart",
        verpflegungsart: "warm",
        verpflegungstyp: "voll",
        vegetarisch: false,
        kalorien: 580,
        zubereitungszeit: 90,
        zutaten: [
            { menge: 800, einheit: "g", name: "Rindergulasch" },
            { menge: 3, einheit: "", name: "Zwiebeln, gewürfelt" },
            { menge: 2, einheit: "", name: "Paprika, in Streifen" },
            { menge: 3, einheit: "EL", name: "Tomatenmark" },
            { menge: 2, einheit: "l", name: "Rinderbrühe" },
            { menge: 2, einheit: "EL", name: "Paprikapulver, edelsüß" },
            { menge: 1, einheit: "EL", name: "Majoran" },
            { menge: 2, einheit: "EL", name: "Öl" },
            { menge: 1, einheit: "EL", name: "Mehl" },
            { menge: 2, einheit: "", name: "Lorbeerblätter" },
            { menge: 1, einheit: "TL", name: "Kümmel" },
            { menge: 1, einheit: "TL", name: "Salz" },
            { menge: 0.5, einheit: "TL", name: "Pfeffer" }
        ],
        zubereitung: [
            "Fleisch trocken tupfen und in einem großen Gusseisentopf portionsweise scharf anbraten",
            "Fleisch herausnehmen, Zwiebeln im Bratfond glasig dünsten",
            "Tomatenmark einrühren und kurz mitrösten bis es dunkler wird",
            "Paprikapulver zugeben und kurz mitdünsten (nicht verbrennen lassen!)",
            "Fleisch zurück in den Topf geben, mit Mehl bestäuben und kurz mitrösten",
            "Mit Rinderbrühe ablöschen, kräftig aufkochen lassen",
            "Majoran, Lorbeerblätter und Kümmel zugeben",
            "Bei kleiner Hitze 60 Minuten köcheln lassen, gelegentlich umrühren",
            "Paprika in Streifen schneiden und zugeben, weitere 20 Minuten garen",
            "Mit Salz und Pfeffer abschmecken, Lorbeerblätter entfernen"
        ],
        portionierung: "Mit Salzkartoffeln oder frischem Brot servieren. Pro Person 300g Gulasch mit Beilage. In Feldküchen-Töpfen warm halten. Für mobile Einsätze in Thermosbehältern transportieren."
    }
];

// Globale Variablen
let aktuellesRezept = null;
let personenAnzahl = 4;

// Initialisierung
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM geladen - starte Initialisierung');
    
    // Event Listener für Filter
    document.getElementById('verpflegungsart').addEventListener('change', filterRezepte);
    document.getElementById('verpflegungstyp').addEventListener('change', filterRezepte);
    document.getElementById('vegetarisch').addEventListener('change', filterRezepte);
    
    // Personenanzahl Event-Listener
    document.getElementById('personen').addEventListener('input', function() {
        personenAnzahl = parseInt(this.value) || 1;
        console.log('Personenanzahl geändert:', personenAnzahl);
        
        // Personenanzahl in der Rezept-Anzeige aktualisieren
        document.getElementById('zutaten-personen').textContent = personenAnzahl;
        
        // Rezept neu anzeigen mit neuer Personenanzahl
        if (aktuellesRezept) {
            zeigeAusgewaehltesRezept();
        }
        
        // Einkaufsliste auch aktualisieren
        aktualisiereEinkaufsliste();
    });

    // Rezept-Auswahl Event-Listener
    document.getElementById('rezept-auswahl').addEventListener('change', zeigeAusgewaehltesRezept);

    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            showPage(pageId);
        });
    });

    // Startseite anzeigen
    showPage('rezepte');
    
    // Browser Navigation behandeln
    window.addEventListener('popstate', function() {
        const hash = window.location.hash.replace('#', '') || 'rezepte';
        showPage(hash);
    });

    const initialPage = window.location.hash.replace('#', '') || 'rezepte';
    showPage(initialPage);
    
    // Rezepte initial laden
    filterRezepte();
});

// Seitenwechsel
function showPage(pageId) {
    console.log('Wechsle zu Seite:', pageId);
    
    // Navigation aktualisieren
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });

    // Alle Seiten ausblenden
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });
    
    // Nur die gewünschte Seite anzeigen
    const aktiveSeite = document.getElementById(pageId);
    if (aktiveSeite) {
        aktiveSeite.classList.add('active');
        aktiveSeite.style.display = 'block';
    }

    // URL aktualisieren
    window.history.pushState(null, null, `#${pageId}`);

    // Spezielle Aktionen pro Seite
    if (pageId === 'rezepte') {
        filterRezepte();
    } else if (pageId === 'einkaufsliste') {
        aktualisiereEinkaufsliste();
    }
}

// Rezepte filtern und Dropdown füllen
function filterRezepte() {
    console.log('Filtere Rezepte...');
    const verpflegungsart = document.getElementById('verpflegungsart').value;
    const verpflegungstyp = document.getElementById('verpflegungstyp').value;
    const nurVegetarisch = document.getElementById('vegetarisch').checked;

    const gefilterteRezepte = rezepteDaten.filter(rezept => {
        if (verpflegungsart && rezept.verpflegungsart !== verpflegungsart) return false;
        if (verpflegungstyp && rezept.verpflegungstyp !== verpflegungstyp) return false;
        if (nurVegetarisch && !rezept.vegetarisch) return false;
        return true;
    });

    // Dropdown füllen
    const dropdown = document.getElementById('rezept-auswahl');
    dropdown.innerHTML = '<option value="">-- Bitte Rezept auswählen --</option>';
    
    gefilterteRezepte.forEach(rezept => {
        const option = document.createElement('option');
        option.value = rezept.id;
        option.textContent = rezept.titel;
        dropdown.appendChild(option);
    });

    // Rezept Details ausblenden
    document.getElementById('rezept-details').style.display = 'none';
    aktuellesRezept = null;
}

// Ausgewähltes Rezept anzeigen
function zeigeAusgewaehltesRezept() {
    const dropdown = document.getElementById('rezept-auswahl');
    const rezeptId = parseInt(dropdown.value);
    
    if (!rezeptId) {
        document.getElementById('rezept-details').style.display = 'none';
        aktuellesRezept = null;
        return;
    }

    const rezept = rezepteDaten.find(r => r.id === rezeptId);
    aktuellesRezept = rezept;

    if (!rezept) {
        console.error('Rezept nicht gefunden:', rezeptId);
        return;
    }

    // Personenanzahl anzeigen
    document.getElementById('zutaten-personen').textContent = personenAnzahl;

    // Details anzeigen
    document.getElementById('rezept-titel').textContent = rezept.titel;
    document.getElementById('rezept-kalorien').textContent = `${rezept.kalorien * personenAnzahl} kcal gesamt`;
    document.getElementById('rezept-zubereitungszeit').textContent = `${rezept.zubereitungszeit} min Zubereitung`;
    document.getElementById('rezept-art').textContent = `${rezept.verpflegungsart === 'warm' ? 'Warm' : 'Kalt'} • ${rezept.verpflegungstyp === 'voll' ? 'Voll' : 'Hand'} • ${rezept.vegetarisch ? 'Vegetarisch' : 'Mit Fleisch'}`;

    // Zutaten anzeigen (skaliert mit Feldküchen-Umrechnung)
    const zutatenListe = document.getElementById('rezept-zutaten');
    zutatenListe.innerHTML = rezept.zutaten.map(zutat => {
        const skalierteMenge = (zutat.menge / 4) * personenAnzahl;
        const { menge, einheit } = konvertiereZuFeldkueche(skalierteMenge, zutat.einheit, zutat.name);
        
        return `<li>${menge} ${einheit} ${zutat.name}</li>`;
    }).join('');

    // Zubereitung anzeigen
    const zubereitungListe = document.getElementById('rezept-zubereitung');
    zubereitungListe.innerHTML = rezept.zubereitung.map(schritt => 
        `<li>${schritt}</li>`
    ).join('');

    // Portionierung anzeigen
    document.getElementById('rezept-portionierung').textContent = rezept.portionierung;

    // Details einblenden
    document.getElementById('rezept-details').style.display = 'block';
}

// Zur Einkaufsliste navigieren
function zurEinkaufsliste() {
    if (aktuellesRezept) {
        showPage('einkaufsliste');
    } else {
        alert('Bitte wähle zuerst ein Rezept aus!');
    }
}

// Einkaufsliste aktualisieren
function aktualisiereEinkaufsliste() {
    console.log('Aktualisiere Einkaufsliste für', personenAnzahl, 'Personen');
    
    // Personenanzahl in Einkaufsliste anzeigen
    document.getElementById('einkauf-personen').textContent = personenAnzahl;
    
    if (!aktuellesRezept) {
        document.getElementById('einkauf-rezept-titel').textContent = 'Kein Rezept ausgewählt';
        document.getElementById('einkaufsliste-content').innerHTML = '<p>Bitte wähle zuerst ein Rezept auf der Rezept-Seite aus.</p>';
        return;
    }

    document.getElementById('einkauf-rezept-titel').textContent = aktuellesRezept.titel;
    
    const container = document.getElementById('einkaufsliste-content');
    
    // Zutaten für Einkaufsliste mit Feldküchen-Umrechnung
    const zutatenGruppiert = gruppiereZutaten(aktuellesRezept.zutaten);
    
    if (Object.keys(zutatenGruppiert).length === 0) {
        container.innerHTML = '<p>Keine Zutaten gefunden.</p>';
        return;
    }
    
    container.innerHTML = Object.keys(zutatenGruppiert).map(kategorie => `
        <div class="einkaufsliste-kategorie">
            <h3>${kategorie}</h3>
            ${zutatenGruppiert[kategorie].map(zutat => `
                <div class="einkaufsliste-item">
                    <span>${zutat.name}</span>
                    <span>${zutat.menge} ${zutat.einheit}</span>
                </div>
            `).join('')}
        </div>
    `).join('');
}

// Zutaten nach Kategorien gruppieren mit Feldküchen-Umrechnung
function gruppiereZutaten(zutaten) {
    const gruppiert = {
        'Gemüse & Obst': [],
        'Proteine': [],
        'Getreide & Beilagen': [],
        'Milchprodukte': [],
        'Gewürze & Öle': []
    };

    zutaten.forEach(zutat => {
        const skalierteMenge = (zutat.menge / 4) * personenAnzahl;
        const { menge, einheit } = konvertiereZuFeldkueche(skalierteMenge, zutat.einheit, zutat.name);

        const zutatMitMenge = {
            ...zutat,
            menge: menge,
            einheit: einheit
        };

        // Kategorisierung basierend auf Zutatenname
        const name = zutat.name.toLowerCase();
        if (name.includes('kartoffel') || name.includes('karotte') || name.includes('zwiebel') || 
            name.includes('tomate') || name.includes('gurke') || name.includes('brokkoli') ||
            name.includes('paprika') || name.includes('avocado') || name.includes('salat') ||
            name.includes('obst') || name.includes('frucht')) {
            gruppiert['Gemüse & Obst'].push(zutatMitMenge);
        } else if (name.includes('tofu') || name.includes('fleisch') || name.includes('rinder') || 
                   name.includes('ei') || name.includes('nuss') || name.includes('protein')) {
            gruppiert['Proteine'].push(zutatMitMenge);
        } else if (name.includes('nudel') || name.includes('brot') || name.includes('hafer') ||
                   name.includes('reis') || name.includes('getreide') || name.includes('müsli')) {
            gruppiert['Getreide & Beilagen'].push(zutatMitMenge);
        } else if (name.includes('käse') || name.includes('sahne') || name.includes('milch') || 
                   name.includes('frischkäse') || name.includes('parmesan') || name.includes('gouda') ||
                   name.includes('butter')) {
            gruppiert['Milchprodukte'].push(zutatMitMenge);
        } else {
            gruppiert['Gewürze & Öle'].push(zutatMitMenge);
        }
    });

    // Leere Kategorien entfernen
    Object.keys(gruppiert).forEach(kategorie => {
        if (gruppiert[kategorie].length === 0) {
            delete gruppiert[kategorie];
        }
    });

    return gruppiert;
}

// Automatische Umrechnung für Feldküchen-Mengen
function konvertiereZuFeldkueche(menge, einheit, zutatName) {
    const name = zutatName.toLowerCase();
    
    // Für große Mengen (ab 1000) in kg/l umrechnen
    if (einheit === "g" && menge >= 1000) {
        return { menge: (menge / 1000).toFixed(1), einheit: "kg" };
    }
    if (einheit === "ml" && menge >= 1000) {
        return { menge: (menge / 1000).toFixed(1), einheit: "l" };
    }
    
    // Für spezifische Zutaten automatisch passende Einheiten
    if (einheit === "" || einheit === "Stück") {
        if (name.includes('kartoffel') || name.includes('karotte') || name.includes('zwiebel') || 
            name.includes('tomate') || name.includes('gurke') || name.includes('brokkoli') ||
            name.includes('paprika') || name.includes('avocado')) {
            if (menge >= 10) {
                return { menge: Math.round(menge), einheit: "kg" };
            }
        }
    }
    
    // Für Öl, Tomatenmark etc. bei großen Mengen
    if ((einheit === "EL" || einheit === "TL") && menge >= 50) {
        if (name.includes('öl') || name.includes('tomatenmark')) {
            const literMenge = einheit === "EL" ? menge * 0.015 : menge * 0.005;
            if (literMenge >= 1) {
                return { menge: literMenge.toFixed(1), einheit: "l" };
            }
        } else {
            const kgMenge = einheit === "EL" ? menge * 0.015 : menge * 0.005;
            if (kgMenge >= 1) {
                return { menge: kgMenge.toFixed(1), einheit: "kg" };
            }
        }
    }
    
    // Standard: Einheit beibehalten, aber runden
    let angezeigteMenge = menge;
    if (menge % 1 !== 0) {
        angezeigteMenge = menge.toFixed(1);
    }
    
    // Für leere Einheiten "Stück" anzeigen
    const finaleEinheit = einheit === "" ? "Stück" : einheit;
    
    return { menge: angezeigteMenge, einheit: finaleEinheit };
}

// PDF Export für Rezept
function exportRezeptPDF() {
    if (!aktuellesRezept) {
        alert('Bitte wähle zuerst ein Rezept aus!');
        return;
    }
    window.print();
}

// PDF Export für Einkaufsliste
function exportEinkaufslistePDF() {
    if (!aktuellesRezept) {
        alert('Bitte wähle zuerst ein Rezept aus!');
        return;
    }
    window.print();
}
