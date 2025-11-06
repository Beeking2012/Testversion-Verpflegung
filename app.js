class App {
    constructor() {
        this.init();
    }

    init() {
        this.setupTabNavigation();
        this.setupPage3();
        this.setupPage4();
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanes = document.querySelectorAll('.tab-pane');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and panes
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));

                // Add active class to clicked button and corresponding pane
                button.classList.add('active');
                const tabId = button.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    setupPage3() {
        const showTableBtn = document.getElementById('showTableBtn3');
        const showTextBtn = document.getElementById('showTextBtn3');
        const contentArea = document.getElementById('contentArea3');

        showTableBtn.addEventListener('click', () => {
            contentArea.innerHTML = this.createTable3();
        });

        showTextBtn.addEventListener('click', () => {
            contentArea.innerHTML = this.createText3();
        });
    }

    setupPage4() {
        const showTableBtn = document.getElementById('showTableBtn4');
        const showTextBtn = document.getElementById('showTextBtn4');
        const contentArea = document.getElementById('contentArea4');

        showTableBtn.addEventListener('click', () => {
            contentArea.innerHTML = this.createTable4();
        });

        showTextBtn.addEventListener('click', () => {
            contentArea.innerHTML = this.createText4();
        });
    }

    createTable3() {
        return `
            <div class="table-content">
                <h3>Produktübersicht</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Produkt</th>
                            <th>Preis</th>
                            <th>Lagerbestand</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Laptop</td>
                            <td>€ 999</td>
                            <td>15</td>
                        </tr>
                        <tr>
                            <td>Maus</td>
                            <td>€ 25</td>
                            <td>50</td>
                        </tr>
                        <tr>
                            <td>Tastatur</td>
                            <td>€ 75</td>
                            <td>30</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    createText3() {
        return `
            <div class="text-content">
                <h3>Informationen zu unseren Produkten</h3>
                <p>Wir bieten eine breite Palette von hochwertigen Elektronikprodukten an. 
                   Alle unsere Produkte werden mit einer 2-jährigen Garantie geliefert 
                   und sind sofort verfügbar.</p>
                <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung!</p>
            </div>
        `;
    }

    createTable4() {
        return `
            <div class="table-content">
                <h3>Projektliste</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Projekt</th>
                            <th>Status</th>
                            <th>Fälligkeitsdatum</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Website Redesign</td>
                            <td>In Bearbeitung</td>
                            <td>15.12.2024</td>
                        </tr>
                        <tr>
                            <td>App Entwicklung</td>
                            <td>Geplant</td>
                            <td>30.01.2025</td>
                        </tr>
                        <tr>
                            <td>Datenbank Migration</td>
                            <td>Abgeschlossen</td>
                            <td>01.11.2024</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    createText4() {
        return `
            <div class="text-content">
                <h3>Projektinformationen</h3>
                <p>Unsere aktuellen Projekte umfassen verschiedene Bereiche der 
                   Softwareentwicklung und Digitalisierung. Wir arbeiten mit modernsten 
                   Technologien und agilen Methoden.</p>
                <p>Der Projektfortschritt wird regelmäßig überprüft und mit unseren 
                   Kunden abgestimmt.</p>
            </div>
        `;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
