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
            "Mit Parmesan bestreuen und im vorgeheizten Ofen",
            "25-30 Minuten backen bis die Oberfläche goldbraun ist"
        ],
        portionierung: "In Auflaufformen portionieren. Pro Person 1/8 der Form. Mit frischem Feldsalat oder eingelegtem Gemüse servieren. Für Außeneinsätze in Aluschalen abfüllen."
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

    // Zutaten anzeigen (skaliert)
    const zutatenListe = document.getElementById('rezept-zutaten');
    zutatenListe.innerHTML = rezept.zutaten.map(zutat => {
        const skalierteMenge = (zutat.menge / 4) * personenAnzahl;
        
        // Einfache Formatierung ohne Umrechnung
        let angezeigteMenge = skalierteMenge;
        if (skalierteMenge % 1 !== 0) {
            angezeigteMenge = skalierteMenge.toFixed(1);
        }
        
        // Für leere Einheiten "Stück" anzeigen
        const einheit = zutat.einheit === "" ? "Stück" : zutat.einheit;
        
        return `<li>${angezeigteMenge} ${einheit} ${zutat.name}</li>`;
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
    
    // Einfache Liste ohne Gruppierung
    const zutatenListe = aktuellesRezept.zutaten.map(zutat => {
        const skalierteMenge = (zutat.menge / 4) * personenAnzahl;
        
        // Einfache Formatierung ohne Umrechnung
        let angezeigteMenge = skalierteMenge;
        if (skalierteMenge % 1 !== 0) {
            angezeigteMenge = skalierteMenge.toFixed(1);
        }
        
        // Für leere Einheiten "Stück" anzeigen
        const einheit = zutat.einheit === "" ? "Stück" : zutat.einheit;
        
        return {
            name: zutat.name,
            menge: angezeigteMenge,
            einheit: einheit
        };
    });
    
    container.innerHTML = `
        <div class="einkaufsliste-kategorie">
            <h3>Alle Zutaten</h3>
            ${zutatenListe.map(zutat => `
                <div class="einkaufsliste-item">
                    <span>${zutat.name}</span>
                    <span>${zutat.menge} ${zutat.einheit}</span>
                </div>
            `).join('')}
        </div>
    `;
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
