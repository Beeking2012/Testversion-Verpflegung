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
            { menge: 1, einheit: "Bund", name: "Petersilie, gehackt" }
        ],
        zubereitung: [
            "Zwiebel in einem großen Topf anschwitzen",
            "Tomatenmark zugeben und kurz mitrösten",
            "Kartoffeln und Karotten hinzufügen, 5 Minuten mitdünsten",
            "Mit Gemüsebrühe ablöschen und aufkochen lassen",
            "Bei mittlerer Hitze 20 Minuten köcheln lassen",
            "Tofu und Gewürze zugeben, weitere 10 Minuten köcheln",
            "Mit Petersilie bestreuen und servieren"
        ],
        portionierung: "In feste Schüsseln portionieren. Pro Person 1,5 Liter Eintopf berechnen. Mit Brot servieren."
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
            { menge: 400, einheit: "g", name: "Nudeln" },
            { menge: 200, einheit: "g", name: "Gouda, gerieben" },
            { menge: 1, einheit: "", name: "Brokkoli, in Röschen" },
            { menge: 1, einge: "", name: "Paprika, gewürfelt" },
            { menge: 2, einheit: "", name: "Eier" },
            { menge: 200, einheit: "ml", name: "Sahne" },
            { menge: 1, einheit: "TL", name: "Muskatnuss" },
            { menge: 100, einheit: "g", name: "Parmesan, gerieben" }
        ],
        zubereitung: [
            "Nudeln al dente kochen, Brokkoli blanchieren",
            "Ofen auf 200°C vorheizen",
            "Eier mit Sahne und Gewürzen verquirlen",
            "Nudeln, Gemüse und Gouda in eine Auflaufform geben",
            "Eiermischung darüber gießen",
            "Mit Parmesan bestreuen",
            "25 Minuten backen bis goldbraun"
        ],
        portionierung: "In Auflaufformen portionieren. Pro Person 1/8 der Form. Mit Salat servieren."
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
            { menge: 200, einheit: "g", name: "Frischkäse" },
            { menge: 1, einheit: "", name: "Gurke, in Scheiben" },
            { menge: 1, einheit: "", name: "Tomate, in Scheiben" },
            { menge: 4, einheit: "Blätter", name: "Salat" },
            { menge: 1, einheit: "", name: "Avocado" },
            { menge: 2, einheit: "EL", name: "Zitronensaft" }
        ],
        zubereitung: [
            "Brot scheibenweise mit Frischkäse bestreichen",
            "Avocado mit Zitronensaft zerdrücken",
            "Auf 4 Brotscheiben Salatblätter legen",
            "Gurken- und Tomatenscheiben darauf anordnen",
            "Avocadocreme gleichmäßig verteilen",
            "Mit restlichen Brotscheiben bedecken",
            "Sandwiches diagonal durchschneiden"
        ],
        portionierung: "Jedes Sandwich in Frischhaltefolie wickeln. Pro Person 1 Sandwich (2 Dreiecke)."
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
            { menge: 400, einheit: "g", name: "Haferflocken" },
            { menge: 100, einheit: "g", name: "Nüsse, gemischt" },
            { menge: 100, einheit: "g", name: "Trockenfrüchte" },
            { menge: 4, einheit: "EL", name: "Honig" },
            { menge: 2, einheit: "TL", name: "Zimt" },
            { menge: 1, einheit: "l", name: "Milch oder Pflanzenmilch" }
        ],
        zubereitung: [
            "Haferflocken in eine große Schüssel geben",
            "Nüsse hacken und zu den Haferflocken geben",
            "Trockenfrüchte klein schneiden und untermischen",
            "Honig und Zimt unterrühren",
            "Alles gut vermengen"
        ],
        portionierung: "In wiederverschließbare Beutel portionieren. Pro Person 150g Müsli mit 250ml Milch."
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
            { menge: 2, einheit: "EL", name: "Paprikapulver" },
            { menge: 1, einheit: "EL", name: "Majoran" }
        ],
        zubereitung: [
            "Fleisch in einem großen Topf scharf anbraten",
            "Zwiebeln zugeben und mitbraten",
            "Tomatenmark einrühren und kurz rösten",
            "Mit Brühe ablöschen, aufkochen lassen",
            "Bei kleiner Hitze 60 Minuten köcheln",
            "Paprika zugeben, weitere 20 Minuten garen",
            "Mit Gewürzen abschmecken"
        ],
        portionierung: "Mit Kartoffeln oder Nudeln servieren. Pro Person 300g Gulasch mit Beilage."
    }
];
