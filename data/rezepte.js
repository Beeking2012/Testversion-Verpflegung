// =============================================
// REZEPTE DATENBANK MIT KATEGORIEN
// =============================================

const rezepte = {
    // KALTVERPFLEGUNG
    "kaesespieße": {
        name: "Käsespieße mit Trauben",
        kategorie: "kalt",
        vegetarisch: true,
        basisPortionen: 50,
        zubereitungszeit: 45,
        kalorienProPortion: 320,
        portionInfo: "2 Spieße pro Person",
        zutaten: [
            { name: "Gouda (in Würfeln)", menge: 8, einheit: "kg" },
            { name: "Trauben", menge: 6, einheit: "kg" },
            { name: "Oliven", menge: 2, einheit: "kg" },
            { name: "Spieße", menge: 100, einheit: "Stück" }
        ],
        anleitung: [
            "Käse in mundgerechte Würfel schneiden",
            "Trauben waschen und von den Rispen lösen",
            "Käsewürfel, Trauben und Oliven abwechselnd auf Spieße stecken",
            "Kühl lagern bis zum Servieren",
            "Portionierung: 2 Spieße pro Person servieren"
        ]
    },
    "antipasti_platte": {
        name: "Antipasti-Platte",
        kategorie: "kalt",
        vegetarisch: true,
        basisPortionen: 50,
        zubereitungszeit: 60,
        kalorienProPortion: 280,
        portionInfo: "ca. 200g pro Person",
        zutaten: [
            { name: "Mozzarella", menge: 5, einheit: "kg" },
            { name: "Tomaten", menge: 10, einheit: "kg" },
            { name: "Olivenöl", menge: 1, einheit: "L" },
            { name: "Basilikum", menge: 0.1, einheit: "kg" },
            { name: "Baguette", menge: 8, einheit: "Stück" }
        ],
        anleitung: [
            "Tomaten waschen und in Scheiben schneiden",
            "Mozzarella abtropfen lassen und in Scheiben schneiden",
            "Tomaten und Mozzarella abwechselnd auf Platten anrichten",
            "Mit Olivenöl beträufeln und Basilikum darüber streuen",
            "Mit Baguette-Scheiben servieren",
            "Portionierung: ca. 200g Gemüse/Käse + 2 Brotscheiben pro Person"
        ]
    },
    "gefluegel_salat": {
        name: "Geflügelsalat",
        kategorie: "kalt",
        vegetarisch: false,
        basisPortionen: 50,
        zubereitungszeit: 75,
        kalorienProPortion: 380,
        portionInfo: "ca. 250g pro Person",
        zutaten: [
            { name: "Hähnchenbrust (gekocht)", menge: 12, einheit: "kg" },
            { name: "Joghurt", menge: 4, einheit: "kg" },
            { name: "Mayonnaise", menge: 2, einheit: "kg" },
            { name: "Sellerie", menge: 3, einheit: "kg" },
            { name: "Äpfel", menge: 5, einheit: "kg" },
            { name: "Zitronensaft", menge: 0.2, einheit: "L" }
        ],
        anleitung: [
            "Hähnchenbrust in kleine Stücke schneiden",
            "Sellerie und Äpfel würfeln",
            "Joghurt, Mayonnaise und Zitronensaft verrühren",
            "Alle Zutaten vermengen und abschmecken",
            "Mindestens 1 Stunde durchziehen lassen",
            "Portionierung: ca. 250g pro Person in Schälchen servieren"
        ]
    },
    "naehrriegel": {
        name: "Energie-Nuss-Riegel",
        kategorie: "kalt",
        vegetarisch: true,
        basisPortionen: 50,
        zubereitungszeit: 90,
        kalorienProPortion: 420,
        portionInfo: "2 Riegel pro Person",
        zutaten: [
            { name: "Haferflocken", menge: 6, einheit: "kg" },
            { name: "Nussmischung", menge: 4, einheit: "kg" },
            { name: "Honig", menge: 2, einheit: "kg" },
            { name: "Trockenfrüchte", menge: 3, einheit: "kg" },
            { name: "Pflanzenöl", menge: 0.5, einheit: "L" }
        ],
        anleitung: [
            "Alle Zutaten gut vermischen",
            "Auf Backblech gleichmäßig verteilen",
            "Bei 180°C 25 Minuten backen",
            "Abkühlen lassen und in Riegel schneiden",
            "Luftdicht verpacken"
        ]
    },
    "gemuesesticks": {
        name: "Gemüsesticks mit Dip",
        kategorie: "kalt",
        vegetarisch: true,
        basisPortionen: 50,
        zubereitungszeit: 40,
        kalorienProPortion: 180,
        portionInfo: "ca. 150g Gemüse + Dip pro Person",
        zutaten: [
            { name: "Karotten", menge: 8, einheit: "kg" },
            { name: "Gurken", menge: 6, einheit: "kg" },
            { name: "Paprika", menge: 5, einheit: "kg" },
            { name: "Joghurt-Dip", menge: 4, einheit: "kg" },
            { name: "Zitronensaft", menge: 0.3, einheit: "L" }
        ],
        anleitung: [
            "Gemüse waschen und in Stifte schneiden",
            "In Boxen portionieren",
            "Dip separat dazu servieren",
            "Gekühlt lagern"
        ]
    },
    "eiersalat": {
        name: "Eiersalat",
        kategorie: "kalt",
        vegetarisch: true,
        basisPortionen: 50,
        zubereitungszeit: 60,
        kalorienProPortion: 320,
        portionInfo: "ca. 200g pro Person",
        zutaten: [
            { name: "Eier", menge: 120, einheit: "Stück" },
            { name: "Mayonnaise", menge: 3, einheit: "kg" },
            { name: "Senf", menge: 0.5, einheit: "kg" },
            { name: "Gewürzgurken", menge: 2, einheit: "kg" },
            { name: "Zwiebeln", menge: 1, einheit: "kg" }
        ],
        anleitung: [
            "Eier hart kochen, schälen und würfeln",
            "Gurken und Zwiebeln fein hacken",
            "Alles mit Mayonnaise und Senf vermengen",
            "Mit Salz und Pfeffer abschmecken"
        ]
    },

    // WARMVERPFLEGUNG
    "kartoffelsuppe": {
        name: "Kartoffelsuppe",
        kategorie: "warm",
        vegetarisch: true,
        basisPortionen: 250,
        zubereitungszeit: 90,
        kalorienProPortion: 320,
        portionInfo: "ca. 400ml pro Person",
        zutaten: [
            { name: "Kartoffelwürfel", menge: 30, einheit: "kg" },
            { name: "Rapsöl", menge: 0.8, einheit: "L" },
            { name: "Zwiebeln (TK oder frisch)", menge: 4, einheit: "kg" },
            { name: "Gemüsebrühe", menge: 30, einheit: "L" },
            { name: "Majoran", menge: 0.05, einheit: "kg" },
            { name: "Salz", menge: 0.1, einheit: "kg" },
            { name: "Pfeffer", menge: 0.025, einheit: "kg" }
        ],
        anleitung: [
            "Zwiebeln in Rapsöl glasig dünsten",
            "Kartoffelwürfel hinzufügen und kurz mitdünsten",
            "Mit Gemüsebrühe ablöschen und 20 Minuten köcheln lassen",
            "Majoran, Salz und Pfeffer hinzufügen",
            "Nochmals 10 Minuten köcheln lassen",
            "Abschmecken und heiß servieren",
            "Portionierung: ca. 400ml pro Person in Schüsseln servieren"
        ]
    },
    "gulasch": {
        name: "Gulasch",
        kategorie: "warm",
        vegetarisch: false,
        basisPortionen: 250,
        zubereitungszeit: 210,
        kalorienProPortion: 480,
        portionInfo: "ca. 350g pro Person",
        zutaten: [
            { name: "Rindergulasch", menge: 30, einheit: "kg" },
            { name: "Zwiebeln (TK oder frisch)", menge: 10, einheit: "kg" },
            { name: "Tomatenmark", menge: 1.5, einheit: "kg" },
            { name: "Rinderfond", menge: 25, einheit: "L" },
            { name: "Paprikapulver", menge: 0.2, einheit: "kg" },
            { name: "Salz", menge: 0.08, einheit: "kg" },
            { name: "Pfeffer", menge: 0.02, einheit: "kg" }
        ],
        anleitung: [
            "Zwiebeln in Öl goldbraun anbraten",
            "Rindergulasch portionsweise scharf anbraten",
            "Tomatenmark zugeben und mitbraten",
            "Mit Rinderfond ablöschen",
            "Paprikapulver, Salz und Pfeffer hinzufügen",
            "2-3 Stunden bei niedriger Hitze schmoren lassen",
            "Vor dem Servieren abschmecken",
            "Portionierung: ca. 350g pro Person mit Beilage servieren"
        ]
    },
    "gemueseeintopf": {
        name: "Gemüseeintopf",
        kategorie: "warm",
        vegetarisch: true,
        basisPortionen: 250,
        zubereitungszeit: 120,
        kalorienProPortion: 290,
        portionInfo: "ca. 450ml pro Person",
        zutaten: [
            { name: "Kartoffelwürfel", menge: 15, einheit: "kg" },
            { name: "Möhren", menge: 10, einheit: "kg" },
            { name: "Lauch", menge: 8, einheit: "kg" },
            { name: "Zwiebeln (TK oder frisch)", menge: 4, einheit: "kg" },
            { name: "Weißkohl", menge: 12, einheit: "kg" },
            { name: "Gemüsebrühe", menge: 35, einheit: "L" },
            { name: "Majoran", menge: 0.04, einheit: "kg" }
        ],
        anleitung: [
            "Gemüse waschen und in Stücke schneiden",
            "Zwiebeln in Butter andünsten",
            "Gemüse zugeben und kurz mitdünsten",
            "Mit Gemüsebrühe ablöschen",
            "30-40 Minuten köcheln lassen",
            "Mit Kräutern, Salz und Pfeffer abschmecken",
            "Heiß mit Brot servieren",
            "Portionierung: ca. 450ml pro Person in Schüsseln servieren"
        ]
    },
    "nudelauflauf": {
        name: "Nudelauflauf mit Käse",
        kategorie: "warm",
        vegetarisch: true,
        basisPortionen: 50,
        zubereitungszeit: 75,
        kalorienProPortion: 450,
        portionInfo: "ca. 300g pro Person",
        zutaten: [
            { name: "Nudeln", menge: 15, einheit: "kg" },
            { name: "Käse (gerieben)", menge: 6, einheit: "kg" },
            { name: "Sahne", menge: 5, einheit: "L" },
            { name: "Eier", menge: 60, einheit: "Stück" },
            { name: "Butter", menge: 1, einheit: "kg" }
        ],
        anleitung: [
            "Nudeln al dente kochen",
            "Mit Sahne, Eiern und Käse vermengen",
            "In Auflaufformen geben",
            "Bei 200°C 30 Minuten backen",
            "Goldbraun servieren"
        ]
    },
    "chili_con_carne": {
        name: "Chili con Carne",
        kategorie: "warm",
        vegetarisch: false,
        basisPortionen: 50,
        zubereitungszeit: 120,
        kalorienProPortion: 520,
        portionInfo: "ca. 350g pro Person",
        zutaten: [
            { name: "Hackfleisch", menge: 12, einheit: "kg" },
            { name: "Kidneybohnen", menge: 8, einheit: "kg" },
            { name: "Mais", menge: 4, einheit: "kg" },
            { name: "Tomaten (Dose)", menge: 10, einheit: "kg" },
            { name: "Zwiebeln", menge: 3, einheit: "kg" },
            { name: "Chilipulver", menge: 0.1, einheit: "kg" }
        ],
        anleitung: [
            "Zwiebeln und Hackfleisch anbraten",
            "Tomaten, Bohnen und Mais zugeben",
            "Mit Gewürzen abschmecken",
            "45 Minuten köcheln lassen",
            "Mit Reis servieren"
        ]
    },
    "linseneintopf": {
        name: "Linseneintopf",
        kategorie: "warm",
        vegetarisch: true,
        basisPortionen: 50,
        zubereitungszeit: 90,
        kalorienProPortion: 380,
        portionInfo: "ca. 400g pro Person",
        zutaten: [
            { name: "Linsen", menge: 10, einheit: "kg" },
            { name: "Kartoffeln", menge: 8, einheit: "kg" },
            { name: "Möhren", menge: 5, einheit: "kg" },
            { name: "Zwiebeln", menge: 2, einheit: "kg" },
            { name: "Gemüsebrühe", menge: 20, einheit: "L" }
        ],
        anleitung: [
            "Linsen waschen",
            "Gemüse schneiden und anbraten",
            "Mit Brühe ablöschen",
            "45 Minuten köcheln lassen",
            "Mit Würstchen servieren"
        ]
    },

    // LUNCHPAKETE
    "fruehstückspaket": {
        name: "Frühstückspaket",
        kategorie: "lunch",
        vegetarisch: true,
        basisPortionen: 50,
        zubereitungszeit: 30,
        kalorienProPortion: 450,
        portionInfo: "1 komplettes Paket pro Person",
        zutaten: [
            { name: "Müsliriegel", menge: 50, einheit: "Stück" },
            { name: "Apfel", menge: 50, einheit: "Stück" },
            { name: "Joghurt", menge: 50, einheit: "Becher" },
            { name: "Getränk (0.5L Flasche)", menge: 50, einheit: "Stück" }
        ],
        anleitung: [
            "Alle Komponenten einzeln verpacken",
            "In wiederverschließbaren Beuteln portionieren",
            "Kühl lagern bis zur Ausgabe",
            "Vor Verteilung kontrollieren",
            "Portionierung: 1 komplettes Paket pro Person ausgeben"
        ]
    },
    "mittagspaket": {
        name: "Mittagspaket",
        kategorie: "lunch",
        vegetarisch: true,
        basisPortionen: 50,
        zubereitungszeit: 45,
        kalorienProPortion: 520,
        portionInfo: "1 komplettes Paket pro Person",
        zutaten: [
            { name: "Vollkornbrot", menge: 25, einheit: "Laib" },
            { name: "Käse", menge: 5, einheit: "kg" },
            { name: "Tomate", menge: 50, einheit: "Stück" },
            { name: "Müsliriegel", menge: 50, einheit: "Stück" },
            { name: "Getränk (0.5L Flasche)", menge: 100, einheit: "Stück" }
        ],
        anleitung: [
            "Brote mit Käse belegen",
            "Tomaten waschen und separat verpacken",
            "Alle Komponenten in Lunchboxen portionieren",
            "Bei Bedarf kühlen",
            "Portionierung: 1 komplettes Paket pro Person ausgeben"
        ]
    },
    "abendpaket": {
        name: "Abendpaket",
        kategorie: "lunch",
        vegetarisch: false,
        basisPortionen: 50,
        zubereitungszeit: 50,
        kalorienProPortion: 580,
        portionInfo: "1 komplettes Paket pro Person",
        zutaten: [
            { name: "Geflügelwurst", menge: 5, einheit: "kg" },
            { name: "Käse", menge: 4, einheit: "kg" },
            { name: "Vollkornbrot", menge: 25, einheit: "Laib" },
            { name: "Gurke", menge: 25, einheit: "Stück" },
            { name: "Müsliriegel", menge: 50, einheit: "Stück" },
            { name: "Getränk (0.5L Flasche)", menge: 100, einheit: "Stück" }
        ],
        anleitung: [
            "Brote mit Aufschnitt und Käse belegen",
            "Gurken waschen und in Scheiben schneiden",
            "Alle Komponenten getrennt verpacken",
            "In stabilen Tüten portionieren",
            "Portionierung: 1 komplettes Paket pro Person ausgeben"
        ]
    },
    "energiepaket": {
        name: "Energiepaket (8h+)",
        kategorie: "lunch",
        vegetarisch: true,
        basisPortionen: 50,
        zubereitungszeit: 40,
        kalorienProPortion: 650,
        portionInfo: "1 komplettes Paket pro Person",
        zutaten: [
            { name: "Müsliriegel", menge: 100, einheit: "Stück" },
            { name: "Nussmischung", menge: 10, einheit: "kg" },
            { name: "Trockenobst", menge: 8, einheit: "kg" },
            { name: "Energieriegel", menge: 50, einheit: "Stück" },
            { name: "Getränk (0.5L Flasche)", menge: 150, einheit: "Stück" }
        ],
        anleitung: [
            "Alle Trockenkomponenten mischen",
            "In wiederverschließbare Beutel portionieren",
            "Getränke separat verpacken",
            "Vor extremen Temperaturen schützen",
            "Portionierung: 1 komplettes Paket pro Person ausgeben"
        ]
    },
    "basis_paket": {
        name: "Basis-Lunchpaket",
        kategorie: "lunch",
        vegetarisch: true,
        basisPortionen: 50,
        zubereitungszeit: 35,
        kalorienProPortion: 480,
        portionInfo: "1 komplettes Paket pro Person",
        zutaten: [
            { name: "Knäckebrot", menge: 200, einheit: "Stück" },
            { name: "Käseaufschnitt", menge: 4, einheit: "kg" },
            { name: "Apfel", menge: 50, einheit: "Stück" },
            { name: "Nussmischung", menge: 5, einheit: "kg" },
            { name: "Wasser (0.5L)", menge: 50, einheit: "Flaschen" }
        ],
        anleitung: [
            "Alle Komponenten einzeln verpacken",
            "In stabilen Tüten zusammenstellen",
            "Bei Bedarf kühlen",
            "Portionierung: 1 Paket pro Person"
        ]
    },
    "notfall_paket": {
        name: "Notfall-Paket (24h)",
        kategorie: "lunch",
        vegetarisch: true,
        basisPortionen: 50,
        zubereitungszeit: 60,
        kalorienProPortion: 2200,
        portionInfo: "1 Paket für 24h pro Person",
        zutaten: [
            { name: "Notfallkekse", menge: 150, einheit: "Stück" },
            { name: "Energieriegel", menge: 100, einheit: "Stück" },
            { name: "Trockenfrüchte", menge: 10, einheit: "kg" },
            { name: "Nüsse", menge: 8, einheit: "kg" },
            { name: "Wasser (1.5L)", menge: 75, einheit: "Flaschen" }
        ],
        anleitung: [
            "Alle Lebensmittel in wiederverschließbare Beutel portionieren",
            "Wasser separat verpacken",
            "In stabilen Transportboxen lagern",
            "Vor Feuchtigkeit schützen"
        ]
    }
};
