// =============================================
// HILFSFUNKTIONEN
// =============================================

function konvertiereEinheit(menge, einheit) {
    if (einheit === "kg") {
        if (menge >= 1000) {
            return { wert: (menge / 1000).toFixed(2), einheit: "t" };
        } else if (menge < 1) {
            return { wert: (menge * 1000).toFixed(0), einheit: "g" };
        }
    } else if (einheit === "L") {
        if (menge >= 1000) {
            return { wert: (menge / 1000).toFixed(2), einheit: "m³" };
        } else if (menge < 1) {
            return { wert: (menge * 1000).toFixed(0), einheit: "ml" };
        }
    }
    return { wert: menge.toFixed(2), einheit: einheit };
}

function berechnePackungen(menge, produkt) {
    if (!wasgauProdukte[produkt]) {
        return { anzahl: 1, groesse: menge, preis: 0, einheit: "kg" };
    }
    
    const packungsgroessen = [...wasgauProdukte[produkt].packungsgroessen].sort((a, b) => b - a);
    const preise = wasgauProdukte[produkt].preise;
    
    let restMenge = menge;
    let packungen = [];
    let gesamtPreis = 0;
    
    for (let i = 0; i < packungsgroessen.length && restMenge > 0; i++) {
        const groesse = packungsgroessen[i];
        const preis = preise[i];
        const anzahl = Math.floor(restMenge / groesse);
        
        if (anzahl > 0) {
            packungen.push({ groesse, anzahl, preis });
            gesamtPreis += anzahl * preis;
            restMenge -= anzahl * groesse;
        }
    }
    
    if (restMenge > 0) {
        const kleinsteGroesse = packungsgroessen[packungsgroessen.length - 1];
        const preis = preise[preise.length - 1];
        packungen.push({ groesse: kleinsteGroesse, anzahl: 1, preis });
        gesamtPreis += preis;
    }
    
    return { packungen, gesamtPreis, restMenge: Math.max(0, restMenge) };
}

// =============================================
// EQUIPMENT UI FUNKTIONEN
// =============================================

function switchSubTab(subTabName) {
    document.querySelectorAll('.sub-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.sub-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(subTabName + '-subtab').classList.add('active');
    document.querySelector(`.sub-tab[onclick="switchSubTab('${subTabName}')"]`).classList.add('active');
    
    if (subTabName === 'gw-beladung') {
        EquipmentManager.aktualisiereGWAnzeige();
    } else if (subTabName === 'kv-lager') {
        EquipmentManager.aktualisiereKVLagerAnzeige();
    }
}

function fuegeGWEquipmentHinzu() {
    const name = document.getElementById('gw-name').value.trim();
    const menge = document.getElementById('gw-menge').value;
    const kategorie = document.getElementById('gw-kategorie').value;
    const notizen = document.getElementById('gw-notizen').value.trim();

    if (!name || !menge) {
        alert('Bitte Bezeichnung und Menge eingeben!');
        return;
    }

    EquipmentManager.fuegeGWEquipmentHinzu({
        name,
        menge: parseInt(menge),
        kategorie,
        notizen
    });

    document.getElementById('gw-name').value = '';
    document.getElementById('gw-menge').value = '1';
    document.getElementById('gw-notizen').value = '';
}

function fuegeKVLagerHinzu() {
    const name = document.getElementById('kv-lager-name').value.trim();
    const menge = document.getElementById('kv-lager-menge').value;
    const kategorie = document.getElementById('kv-lager-kategorie').value;
    const notizen = document.getElementById('kv-lager-notizen').value.trim();

    if (!name || !menge) {
        alert('Bitte Bezeichnung und Menge eingeben!');
        return;
    }

    EquipmentManager.fuegeKVLagerHinzu({
        name,
        menge: parseInt(menge),
        kategorie,
        notizen
    });

    document.getElementById('kv-lager-name').value = '';
    document.getElementById('kv-lager-menge').value = '1';
    document.getElementById('kv-lager-notizen').value = '';
}

function berechneEinsatzMaterial() {
    EquipmentManager.berechneEinsatzMaterial();
}

function druckeEinsatzliste() {
    window.print();
}

function exportEinsatzPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.setTextColor(179, 0, 0);
    doc.text('Einsatzmaterial-Liste', 14, 15);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 14, 22);
    
    doc.text('Einsatzmaterial-Liste wird generiert...', 14, 40);
    
    const fileName = `Einsatzmaterial_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
}

// =============================================
// UI-FUNKTIONEN
// =============================================

function switchMainTab(tabName) {
    // Alle Tabs ausblenden
    document.querySelectorAll('.main-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.main-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Gewählten Tab anzeigen
    document.getElementById(tabName + '-tab').classList.add('active');
    document.querySelector(`.main-tab[onclick="switchMainTab('${tabName}')"]`).classList.add('active');
    
    if (tabName === 'lebensmittellager') {
        LagerManager.aktualisiereAnzeige();
    } else if (tabName === 'materiallager') {
        EquipmentManager.aktualisiereGWAnzeige();
    }
}

function fuegeLebensmittelHinzu() {
    const name = document.getElementById('lager-name').value.trim();
    const menge = document.getElementById('lager-menge').value;
    const einheit = document.getElementById('lager-einheit').value;
    const kategorie = document.getElementById('lager-kategorie').value;
    const haltbarkeit = document.getElementById('lager-haltbarkeit').value;
    const notizen = document.getElementById('lager-notizen').value.trim();

    if (!name || !menge) {
        alert('Bitte Name und Menge eingeben!');
        return;
    }

    LagerManager.fuegeHinzu({
        name,
        menge: parseFloat(menge),
        einheit,
        kategorie,
        haltbarkeit: haltbarkeit || null,
        notizen
    });

    document.getElementById('lager-name').value = '';
    document.getElementById('lager-menge').value = '';
    document.getElementById('lager-notizen').value = '';
}

function lagerLeeren() {
    if (confirm('Möchten Sie wirklich den gesamten Lagerbestand löschen?')) {
        LagerManager.leeren();
    }
}

function zeigeAbgelaufene() {
    const abgelaufene = LagerManager.lagerbestand.filter(item => 
        LagerManager.pruefeHaltbarkeit(item.haltbarkeit) === 'abgelaufen'
    );
    
    if (abgelaufene.length === 0) {
        alert('Keine abgelaufenen Lebensmittel gefunden.');
    } else {
        alert(`Abgelaufene Lebensmittel: ${abgelaufene.map(item => item.name).join(', ')}`);
    }
}

// =============================================
// INITIALISIERUNG BEIM START
// =============================================

async function initializeApp() {
    await CloudStorage.checkCloudStatus();
    
    try {
        const [cloudGW, cloudKVLager, cloudLager] = await Promise.allSettled([
            CloudStorage.loadFromCloud('equipment_gw'),
            CloudStorage.loadFromCloud('equipment_kv_lager'),
            CloudStorage.loadFromCloud('feldkueche_lager')
        ]);

        EquipmentManager.gwBeladung = cloudGW.status === 'fulfilled' && cloudGW.value 
            ? cloudGW.value 
            : JSON.parse(localStorage.getItem('equipment_gw') || '[]');
            
        EquipmentManager.kvLager = cloudKVLager.status === 'fulfilled' && cloudKVLager.value 
            ? cloudKVLager.value 
            : JSON.parse(localStorage.getItem('equipment_kv_lager') || '[]');
            
        LagerManager.lagerbestand = cloudLager.status === 'fulfilled' && cloudLager.value 
            ? cloudLager.value 
            : JSON.parse(localStorage.getItem('feldkueche_lager') || '[]');

    } catch (error) {
        console.log('Cloud-Daten konnten nicht geladen werden, verwende lokale Daten');
        EquipmentManager.gwBeladung = JSON.parse(localStorage.getItem('equipment_gw') || '[]');
        EquipmentManager.kvLager = JSON.parse(localStorage.getItem('equipment_kv_lager') || '[]');
        LagerManager.lagerbestand = JSON.parse(localStorage.getItem('feldkueche_lager') || '[]');
    }

    EquipmentManager.aktualisiereGWAnzeige();
    EquipmentManager.aktualisiereKVLagerAnzeige();
    LagerManager.aktualisiereAnzeige();
    
    // Dropdown-Menüs initialisieren
    filterRezepte('kalt');
    filterRezepte('warm');
    filterRezepte('lunch');
    
    // Standard-Rezept auswählen
    document.getElementById('warm-rezept').value = 'kartoffelsuppe';
    aktuellesRezept = 'kartoffelsuppe';
    aktuelleKategorie = 'warm';
    
    setTimeout(() => {
        CloudStorage.autoSync();
    }, 2000);
}

// Event-Listener
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    
    document.getElementById('personen').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') zeigeRezept();
    });
    
    document.getElementById('empfohlen-personen').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') zeigeRezeptEmpfehlungen();
    });
    
    // Erstes Rezept anzeigen
    setTimeout(() => zeigeRezept(), 100);
});
