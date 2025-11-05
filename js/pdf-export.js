// =============================================
// PDF EXPORT FUNKTION FÜR REZEPT
// =============================================

function exportRezeptAsPDF() {
    const rezeptName = getAktuellesRezept();
    const personen = parseFloat(document.getElementById("personen").value);
    const rezept = rezepte[rezeptName];
    
    if (!rezept || !personen) {
        alert("Bitte zuerst ein Rezept und eine Personenzahl auswählen!");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const faktor = personen / rezept.basisPortionen;
    const anzeigeName = RezeptEmpfehlungsEngine.getRezeptAnzeigeName(rezeptName);
    const rezeptAllergene = AllergenManager.getAlleRezeptAllergene(rezeptName);
    
    // Titel
    doc.setFontSize(18);
    doc.setTextColor(179, 0, 0);
    doc.text(`Rezept - ${anzeigeName}`, 14, 15);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Für ${personen} Personen • ${new Date().toLocaleDateString('de-DE')}`, 14, 22);
    
    // Allergene
    if (rezeptAllergene.length > 0) {
        const allergenText = rezeptAllergene.map(code => {
            const allergen = allergene[code];
            return `${allergen.icon} ${code}: ${allergen.name}`;
        }).join(', ');
        
        doc.setFontSize(9);
        doc.setTextColor(255, 87, 34);
        doc.text(`Allergene: ${allergenText}`, 14, 30);
    } else {
        doc.setFontSize(9);
        doc.setTextColor(76, 175, 80);
        doc.text(`✅ Allergenfrei - Enthält keine der 14 Hauptallergene`, 14, 30);
    }
    
    // Zutaten-Tabelle
    const kopfZeilen = [['Zutat', 'Menge', 'Einheit', 'Allergene']];
    const tabellenDaten = [];
    
    rezept.zutaten.forEach(zutat => {
        const neueMenge = zutat.menge * faktor;
        const konvertiert = konvertiereEinheit(neueMenge, zutat.einheit);
        const zutatAllergene = produktAllergene[zutat.name] || [];
        const zutatAllergenText = zutatAllergene.map(code => {
            const allergen = allergene[code];
            return `${allergen.icon} ${code}`;
        }).join(', ');
        
        tabellenDaten.push([
            zutat.name,
            konvertiert.wert,
            konvertiert.einheit,
            zutatAllergenText || '-'
        ]);
    });
    
    doc.autoTable({
        head: kopfZeilen,
        body: tabellenDaten,
        startY: 35,
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [179, 0, 0],
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 30 },
            2: { cellWidth: 25 },
            3: { cellWidth: 45 }
        }
    });
    
    const finalY = doc.lastAutoTable.finalY + 10;
    
    // Handlungsanweisungen
    doc.setFontSize(12);
    doc.setTextColor(179, 0, 0);
    doc.text('Zubereitung:', 14, finalY);
    
    let anleitungY = finalY + 8;
    rezept.anleitung.forEach((schritt, index) => {
        if (anleitungY > 270) {
            doc.addPage();
            anleitungY = 20;
        }
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}. ${schritt}`, 20, anleitungY);
        anleitungY += 5;
    });
    
    // Fußzeile
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Erstellt mit Feldküche - Intelligente Rezeptempfehlung', 14, 280);
    doc.text('Deutsches Rotes Kreuz', 14, 285);
    
    const fileName = `Rezept_${anzeigeName}_${personen}Personen.pdf`;
    doc.save(fileName);
}

// =============================================
// PDF EXPORT FUNKTION FÜR EINKAUFSLISTE
// =============================================

function exportAsPDF() {
    const rezeptName = getAktuellesRezept();
    const personen = parseFloat(document.getElementById("personen").value);
    const rezept = rezepte[rezeptName];
    
    if (!rezept || !personen) {
        alert("Bitte zuerst ein Rezept und eine Personenzahl auswählen!");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const faktor = personen / rezept.basisPortionen;
    const modus = Einkaufsmodus.getAktuellerModus();
    
    doc.setFontSize(16);
    doc.setTextColor(179, 0, 0);
    doc.text(`Einkaufsliste - ${RezeptEmpfehlungsEngine.getRezeptAnzeigeName(rezeptName)}`, 14, 15);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Für ${personen} Personen • ${new Date().toLocaleDateString('de-DE')}`, 14, 22);
    doc.text(`Modus: ${modus === 'lager' ? 'Lagerbestand berücksichtigt' : 'Alles neu kaufen'}`, 14, 28);
    
    const kopfZeilen = [
        ['Produkt', 'Benötigt', 'Vorhanden', 'Zu kaufen', 'Packungen', 'Kosten (€)']
    ];
    
    const tabellenDaten = [];
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
                packungenText += `${pack.anzahl} × ${packKonvertiert.wert} ${packKonvertiert.einheit}\n`;
            });
            
            tabellenDaten.push([
                zutat.name,
                `${konvertiertBenoetigt.wert} ${konvertiertBenoetigt.einheit}`,
                `${konvertiertVorhanden.wert} ${konvertiertVorhanden.einheit}`,
                `${konvertiertZuKaufen.wert} ${konvertiertZuKaufen.einheit}`,
                packungenText.trim(),
                `${packungsInfo.gesamtPreis.toFixed(2)}`
            ]);
            
            gesamtKosten += packungsInfo.gesamtPreis;
        } else {
            const konvertiertBenoetigt = konvertiereEinheit(benoetigteMenge, zutat.einheit);
            const konvertiertVorhanden = konvertiereEinheit(kaufInfo.vorhanden, zutat.einheit);
            
            tabellenDaten.push([
                zutat.name,
                `${konvertiertBenoetigt.wert} ${konvertiertBenoetigt.einheit}`,
                `${konvertiertVorhanden.wert} ${konvertiertVorhanden.einheit}`,
                "Aus Lager",
                "-",
                "0.00"
            ]);
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
                packungenText += `${pack.anzahl} × ${packKonvertiert.wert} ${packKonvertiert.einheit}\n`;
            });
            
            tabellenDaten.push([
                produkt.name,
                `${konvertiertBenoetigt.wert} ${konvertiertBenoetigt.einheit}`,
                `${konvertiertVorhanden.wert} ${konvertiertVorhanden.einheit}`,
                `${konvertiertZuKaufen.wert} ${konvertiertZuKaufen.einheit}`,
                packungenText.trim(),
                `${packungsInfo.gesamtPreis.toFixed(2)}`
            ]);
            
            gesamtKosten += packungsInfo.gesamtPreis;
        } else {
            const konvertiertBenoetigt = konvertiereEinheit(benoetigteMenge, produkt.einheit);
            const konvertiertVorhanden = konvertiereEinheit(kaufInfo.vorhanden, produkt.einheit);
            
            tabellenDaten.push([
                produkt.name,
                `${konvertiertBenoetigt.wert} ${konvertiertBenoetigt.einheit}`,
                `${konvertiertVorhanden.wert} ${konvertiertVorhanden.einheit}`,
                "Aus Lager",
                "-",
                "0.00"
            ]);
        }
    });
    
    doc.autoTable({
        head: kopfZeilen,
        body: tabellenDaten,
        startY: 35,
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [179, 0, 0],
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        columnStyles: {
            0: { cellWidth: 45 },
            1: { cellWidth: 25 },
            2: { cellWidth: 25 },
            3: { cellWidth: 25 },
            4: { cellWidth: 40 },
            5: { cellWidth: 20 }
        }
    });
    
    const finalY = doc.lastAutoTable.finalY + 10;
    
    doc.setFillColor(232, 244, 232);
    doc.rect(14, finalY, 182, 25, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Kostenübersicht', 20, finalY + 8);
    
    doc.setFontSize(10);
    doc.text(`Gesamtkosten: ${gesamtKosten.toFixed(2)} €`, 20, finalY + 15);
    doc.text(`Kosten pro Portion: ${(gesamtKosten / personen).toFixed(2)} €`, 20, finalY + 21);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Erstellt mit Feldküche - Intelligente Rezeptempfehlung', 14, 280);
    doc.text(`Wasgau C+C Einkaufsliste`, 14, 285);
    
    const fileName = `Einkaufsliste_${RezeptEmpfehlungsEngine.getRezeptAnzeigeName(rezeptName)}_${personen}Personen.pdf`;
    doc.save(fileName);
}
