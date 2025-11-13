// Globale Variablen
let aktuellesRezept = null;
let personenAnzahl = 4;

// Initialisierung
document.addEventListener('DOMContentLoaded', function() {
    // Event Listener für Filter
    document.getElementById('verpflegungsart').addEventListener('change', filterRezepte);
    document.getElementById('verpflegungstyp').addEventListener('change', filterRezepte);
    document.getElementById('vegetarisch').addEventListener('change', filterRezepte);
    document.getElementById('personen').addEventListener('input', function() {
        personenAnzahl = parseInt(this.value) || 1;
        if (aktuellesRezept) {
            zeigeRezeptDetails(aktuellesRezept);
        }
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
    filterRezepte();
    
    // Browser Navigation behandeln
    window.addEventListener('popstate', function() {
        const hash = window.location.hash.replace('#', '') || 'rezepte';
        showPage(hash);
    });

    const initialPage = window.location.hash.replace('#', '') || 'rezepte';
    showPage(initialPage);
});

// Seitenwechsel
function showPage(pageId) {
    // Navigation aktualisieren
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });

    // Seiten anzeigen/verstecken
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    document.getElementById(pageId).classList.add('active');

    // URL aktualisieren
    window.history.pushState(null, null, `#${pageId}`);

    // Einkaufsliste aktualisieren falls nötig
    if (pageId === 'einkaufsliste') {
        aktualisiereEinkaufsliste();
    }
}

// Rezepte filtern und anzeigen
function filterRezepte() {
    const verpflegungsart = document.getElementById('verpflegungsart').value;
    const verpflegungstyp = document.getElementById('verpflegungstyp').value;
    const nurVegetarisch = document.getElementById('vegetarisch').checked;

    const gefilterteRezepte = rezepteDaten.filter(rezept => {
        if (verpflegungsart && rezept.verpflegungsart !== verpflegungsart) return false;
        if (verpflegungstyp && rezept.verpflegungstyp !== verpflegungstyp) return false;
        if (nurVegetarisch && !rezept.vegetarisch) return false;
        return true;
    });

    zeigeRezepte(gefilterteRezepte);
}

// Rezepte in der Grid anzeigen
function zeigeRezepte(rezepte) {
    const container = document.getElementById('rezepte-liste');
    
    if (rezepte.length === 0) {
        container.innerHTML = '<p class="keine-rezepte">Keine Rezepte gefunden, die den Filterkriterien entsprechen.</p>';
        document.getElementById('rezept-details').style.display = 'none';
        return;
    }

    container.innerHTML = rezepte.map(rezept => `
        <div class="rezept-karte" onclick="zeigeRezeptDetails(${rezept.id})">
            <h4>${rezept.titel}</h4>
            <div class="rezept-info">
                <span>${rezept.verpflegungsart === 'warm' ? '🔥 Warm' : '❄️ Kalt'}</span>
                <span>${rezept.verpflegungstyp === 'voll' ? '🍽️ Voll' : '✋ Hand'}</span>
                <span>${rezept.vegetarisch ? '🌱 Vegetarisch' : '🥩 Mit Fleisch'}</span>
            </div>
            <p class="rezept-beschreibung">${rezept.beschreibung}</p>
            <div class="rezept-info">
                <span>${rezept.kalorien} kcal</span>
                <span>${rezept.zubereitungszeit} min</span>
            </div>
        </div>
    `).join('');
}

// Rezept Details anzeigen
function zeigeRezeptDetails(rezeptId) {
    const rezept = rezepteDaten.find(r => r.id === rezeptId);
    aktuellesRezept = rezept;

    // Karten Auswahl aktualisieren
    document.querySelectorAll('.rezept-karte').forEach(karte => {
        karte.classList.remove('ausgewaehlt');
    });
    event.currentTarget.classList.add('ausgewaehlt');

    // Details anzeigen
    document.getElementById('rezept-titel').textContent = rezept.titel;
    document.getElementById('rezept-kalorien').textContent = `${rezept.kalorien * personenAnzahl} kcal gesamt`;
    document.getElementById('rezept-zubereitungszeit').textContent = `${rezept.zubereitungszeit} min Zubereitung`;
    document.getElementById('rezept-art').textContent = `${rezept.verpflegungsart === 'warm' ? 'Warm' : 'Kalt'} • ${rezept.verpflegungstyp === 'voll' ? 'Voll' : 'Hand'} • ${rezept.vegetarisch ? 'Vegetarisch' : 'Mit Fleisch'}`;

    // Zutaten anzeigen (skaliert)
    const zutatenListe = document.getElementById('rezept-zutaten');
    zutatenListe.innerHTML = rezept.zutaten.map(zutat => {
        const skalierteMenge = (zutat.menge / 4) * personenAnzahl;
        return `<li>${skalierteMenge.toFixed(1)} ${zutat.einheit} ${zutat.name}</li>`;
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
    if (!aktuellesRezept) return;

    document.getElementById('einkauf-personen').textContent = personenAnzahl;
    
    const container = document.getElementById('einkaufsliste-content');
    
    const zutatenGruppiert = gruppiereZutaten(aktuellesRezept.zutaten);
    
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

// Zutaten nach Kategorien gruppieren
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
        const zutatMitMenge = {
            ...zutat,
            menge: skalierteMenge.toFixed(1)
        };

        // Einfache Kategorisierung basierend auf Zutatenname
        const name = zutat.name.toLowerCase();
        if (name.includes('kartoffel') || name.includes('karotte') || name.includes('zwiebel') || 
            name.includes('tomate') || name.includes('gurke') || name.includes('brokkoli') ||
            name.includes('paprika') || name.includes('avocado') || name.includes('salat')) {
            gruppiert['Gemüse & Obst'].push(zutatMitMenge);
        } else if (name.includes('tofu') || name.includes('fleisch') || name.includes('rinder') || 
                   name.includes('ei') || name.includes('nuss')) {
            gruppiert['Proteine'].push(zutatMitMenge);
        } else if (name.includes('nudel') || name.includes('brot') || name.includes('hafer')) {
            gruppiert['Getreide & Beilagen'].push(zutatMitMenge);
        } else if (name.includes('käse') || name.includes('sahne') || name.includes('milch') || 
                   name.includes('frischkäse') || name.includes('parmesan') || name.includes('gouda')) {
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

// PDF Export für Rezept
async function exportRezeptPDF() {
    if (!aktuellesRezept) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Titel
    doc.setFontSize(20);
    doc.text(aktuellesRezept.titel, 20, 30);
    
    // Metadaten
    doc.setFontSize(12);
    doc.text(`Für ${personenAnzahl} Personen | ${aktuellesRezept.kalorien * personenAnzahl} kcal gesamt | ${aktuellesRezept.zubereitungszeit} Minuten`, 20, 45);
    doc.text(`${aktuellesRezept.verpflegungsart === 'warm' ? 'Warm' : 'Kalt'} • ${aktuellesRezept.verpflegungstyp === 'voll' ? 'Voll' : 'Hand'} • ${aktuellesRezept.vegetarisch ? 'Vegetarisch' : 'Mit Fleisch'}`, 20, 55);

    // Zutaten
    doc.setFontSize(16);
    doc.text('Zutaten:', 20, 75);
    doc.setFontSize(12);
    let yPosition = 90;
    aktuellesRezept.zutaten.forEach(zutat => {
        const skalierteMenge = (zutat.menge / 4) * personenAnzahl;
        doc.text(`• ${skalierteMenge.toFixed(1)} ${zutat.einheit} ${zutat.name}`, 25, yPosition);
        yPosition += 8;
    });

    // Zubereitung (neue Seite falls nötig)
    if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
    } else {
        yPosition += 15;
    }

    doc.setFontSize(16);
    doc.text('Zubereitung:', 20, yPosition);
    doc.setFontSize(12);
    yPosition += 15;
    
    aktuellesRezept.zubereitung.forEach((schritt, index) => {
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 30;
        }
        doc.text(`${index + 1}. ${schritt}`, 25, yPosition);
        yPosition += 12;
    });

    // Portionierung
    if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
    } else {
        yPosition += 15;
    }

    doc.setFontSize(16);
    doc.text('Portionierung:', 20, yPosition);
    doc.setFontSize(12);
    doc.text(aktuellesRezept.portionierung, 25, yPosition + 10, { maxWidth: 165 });

    doc.save(`Rezept_${aktuellesRezept.titel}_${personenAnzahl}_Personen.pdf`);
}

// PDF Export für Einkaufsliste
async function exportEinkaufslistePDF() {
    if (!aktuellesRezept) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Titel
    doc.setFontSize(20);
    doc.text(`Einkaufsliste: ${aktuellesRezept.titel}`, 20, 30);
    doc.setFontSize(12);
    doc.text(`Für ${personenAnzahl} Personen`, 20, 45);

    const zutatenGruppiert = gruppiereZutaten(aktuellesRezept.zutaten);
    let yPosition = 65;

    Object.keys(zutatenGruppiert).forEach(kategorie => {
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 30;
        }

        doc.setFontSize(14);
        doc.text(kategorie + ':', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(12);
        zutatenGruppiert[kategorie].forEach(zutat => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 30;
            }
            doc.text(`• ${zutat.menge} ${zutat.einheit} ${zutat.name}`, 25, yPosition);
            yPosition += 8;
        });
        
        yPosition += 5;
    });

    doc.save(`Einkaufsliste_${aktuellesRezept.titel}_${personenAnzahl}_Personen.pdf`);
}
