// Gemeinsame Daten die zwischen allen Seiten geteilt werden
let sharedData = {
    message: 'Noch keine Daten',
    lastUpdated: null,
    userText: '',
    preferences: {}
};

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
    
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add('active');
    }

    // URL in Browser aktualisieren
    window.history.pushState(null, null, `#${pageId}`);

    // Gemeinsame Daten auf allen Seiten aktualisieren
    updateAllDisplays();
    
    // Benutzereinstellungen laden und anwenden
    loadUserPreferences();
}

// Gemeinsame Daten aktualisieren
function updateSharedData(newData) {
    sharedData.message = newData;
    sharedData.lastUpdated = new Date().toLocaleTimeString();
    updateAllDisplays();
    
    // In localStorage speichern für Persistenz
    localStorage.setItem('sharedAppData', JSON.stringify(sharedData));
}

// Text von Unterseite 1 an andere Seiten senden
function shareTextToOtherPages() {
    const inputText = document.getElementById('input-1').value;
    if (inputText.trim()) {
        sharedData.userText = inputText;
        sharedData.lastUpdated = new Date().toLocaleTimeString();
        updateAllDisplays();
        localStorage.setItem('sharedAppData', JSON.stringify(sharedData));
        
        // Input zurücksetzen
        document.getElementById('input-1').value = '';
        
        alert('Text wurde an alle Seiten gesendet!');
    }
}

// Alle Anzeigen auf allen Seiten aktualisieren
function updateAllDisplays() {
    // Gemeinsame Daten anzeigen
    document.querySelectorAll('[id^="shared-data"]').forEach(element => {
        element.textContent = `${sharedData.message} (${sharedData.lastUpdated || 'Noch nicht aktualisiert'})`;
    });

    // Empfangenen Text anzeigen
    document.getElementById('received-text-2').textContent = sharedData.userText || 'Keine Daten empfangen';
    document.getElementById('received-text-3').textContent = sharedData.userText || 'Keine Daten empfangen';
}

// Benutzereinstellungen speichern
function saveUserPreference(key, value) {
    sharedData.preferences[key] = value;
    localStorage.setItem('sharedAppData', JSON.stringify(sharedData));
    applyUserPreferences();
}

// Benutzereinstellungen laden
function loadUserPreferences() {
    const saved = localStorage.getItem('sharedAppData');
    if (saved) {
        const parsed = JSON.parse(saved);
        sharedData = { ...sharedData, ...parsed };
        
        // UI-Elemente zurücksetzen
        if (sharedData.preferences.theme) {
            document.getElementById('theme-select').value = sharedData.preferences.theme;
        }
        
        applyUserPreferences();
        updateAllDisplays();
    }
}

// Benutzereinstellungen anwenden
function applyUserPreferences() {
    if (sharedData.preferences.theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Gespeicherte Daten laden
    loadUserPreferences();
    
    // Navigation Event Listener
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            showPage(pageId);
        });
    });

    // Browser Zurück/Vorwärts Buttons behandeln
    window.addEventListener('popstate', function() {
        const hash = window.location.hash.replace('#', '') || 'home';
        showPage(hash);
    });

    // Startseite basierend auf URL Hash anzeigen
    const initialPage = window.location.hash.replace('#', '') || 'home';
    showPage(initialPage);
});
