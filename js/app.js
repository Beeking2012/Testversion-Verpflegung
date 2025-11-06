/**
 * Haupt-App Initialisierung und Routing
 */

class App {
    constructor() {
        this.currentPage = 'page1';
        this.controllers = {};
        
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.setupModal();
        this.loadCurrentPage();
        
        console.log('App initialisiert');
    }

    setupNavigation() {
        // Navigation Event Listener
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const page = e.target.getAttribute('data-page');
                this.navigateTo(page);
            });
        });

        // Browser Navigation (Hash-based)
        window.addEventListener('hashchange', () => {
            this.handleHashNavigation();
        });

        this.handleHashNavigation();
    }

    setupEventListeners() {
        // Global Event Listener für Cross-Page Communication
        window.addEventListener('crossPageMessage', (e) => {
            this.handleGlobalMessage(e.detail);
        });

        // Sync Status Updates
        dataManager.eventBus.addEventListener('syncStatusChanged', (e) => {
            this.updateSyncUI(e.detail.status);
        });

        // Datenänderungen
        dataManager.eventBus.addEventListener('dataChanged', (e) => {
            this.handleDataChange(e.detail);
        });
    }

    setupModal() {
        const modal = document.getElementById('item-modal');
        const cancelBtn = document.getElementById('cancel-modal');
        const form = document.getElementById('item-form');

        // Modal schließen
        cancelBtn.addEventListener('click', () => this.hideModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideModal();
        });

        // Formular Submit
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Add Item Button
        document.getElementById('add-item-btn')?.addEventListener('click', () => {
            this.showModal('Eigenes Item hinzufügen');
        });

        // Add Cloud Item Button
        document.getElementById('add-cloud-item')?.addEventListener('click', () => {
            this.showModal('Cloud Item hinzufügen');
        });
    }

    navigateTo(page) {
        if (this.currentPage === page) return;

        // Alte Seite verlassen
        this.leavePage(this.currentPage);

        // Navigation UI aktualisieren
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Seiteninhalt wechseln
        document.querySelectorAll('.page').forEach(pageEl => {
            pageEl.classList.remove('active');
        });
        document.getElementById(page).classList.add('active');

        // Hash setzen für Browser-Navigation
        window.location.hash = page;

        // Controller initialisieren
        this.loadPageController(page);

        this.currentPage = page;

        // Cross-Page Event senden
        dataManager.dispatchCrossPageEvent('pageChanged', { page });
        
        console.log(`Navigiert zu: ${page}`);
    }

    handleHashNavigation() {
        const hash = window.location.hash.slice(1) || 'page1';
        if (hash !== this.currentPage) {
            this.navigateTo(hash);
        }
    }

    loadPageController(page) {
        const controllerMap = {
            'page1': 'Page1Controller',
            'page2': 'Page2Controller',
            'page3': 'Page3Controller',
            'page4': 'Page4Controller'
        };

        const controllerName = controllerMap[page];
        
        if (controllerName && window[controllerName]) {
            if (!this.controllers[page]) {
                this.controllers[page] = new window[controllerName]();
            } else {
                // Controller reaktivieren
                if (typeof this.controllers[page].onEnter === 'function') {
                    this.controllers[page].onEnter();
                }
            }
        }
    }

    leavePage(page) {
        const controller = this.controllers[page];
        if (controller && typeof controller.onLeave === 'function') {
            controller.onLeave();
        }
    }

    handleGlobalMessage(message) {
        console.log('Globale Nachricht empfangen:', message);
        
        // Nachricht an aktuellen Controller weiterleiten
        const currentController = this.controllers[this.currentPage];
        if (currentController && typeof currentController.handleGlobalMessage === 'function') {
            currentController.handleGlobalMessage(message);
        }
    }

    handleDataChange(detail) {
        // Datenänderung an aktuellen Controller weiterleiten
        const currentController = this.controllers[this.currentPage];
        if (currentController && typeof currentController.handleDataChange === 'function') {
            currentController.handleDataChange(detail);
        }
    }

    updateSyncUI(status) {
        const statusElement = document.getElementById('sync-status');
        if (statusElement) {
            statusElement.textContent = `Sync: ${this.getStatusText(status)}`;
            statusElement.className = `sync-btn sync-${status}`;
        }
    }

    getStatusText(status) {
        const statusMap = {
            'online': 'Online',
            'syncing': 'Synchronisiere...',
            'error': 'Fehler',
            'offline': 'Offline'
        };
        return statusMap[status] || 'Unbekannt';
    }

    showModal(title, data = null) {
        const modal = document.getElementById('item-modal');
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('item-form');
        
        modalTitle.textContent = title;
        modal.classList.remove('hidden');
        
        // Formular mit Daten vorausfüllen falls vorhanden
        if (data) {
            document.getElementById('item-id').value = data.id || '';
            document.getElementById('item-name').value = data.name || '';
            document.getElementById('item-description').value = data.description || '';
        } else {
            form.reset();
        }
        
        document.getElementById('item-name').focus();
    }

    hideModal() {
        const modal = document.getElementById('item-modal');
        modal.classList.add('hidden');
    }

    async handleFormSubmit() {
        const form = document.getElementById('item-form');
        const formData = new FormData(form);
        
        const itemData = {
            id: document.getElementById('item-id').value,
            name: document.getElementById('item-name').value,
            description: document.getElementById('item-description').value,
            timestamp: Date.now()
        };

        try {
            // An aktuellen Controller weiterleiten
            const currentController = this.controllers[this.currentPage];
            if (currentController && typeof currentController.handleItemSubmit === 'function') {
                await currentController.handleItemSubmit(itemData);
            }
            
            this.hideModal();
            form.reset();
            
        } catch (error) {
            console.error('Fehler beim Speichern:', error);
            alert('Fehler beim Speichern des Items');
        }
    }

    loadCurrentPage() {
        this.loadPageController(this.currentPage);
    }
}

// App starten wenn DOM geladen
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
/**
 * Haupt-App Controller für Navigation und Seitenverwaltung
 */
class AppController {
    constructor() {
        this.currentPage = 'page1';
        this.init();
    }

    init() {
        console.log('🚀 AppController initialisiert');
        this.setupTabNavigation();
        this.showPage(this.currentPage);
        this.setupGlobalEventListeners();
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetPage = e.currentTarget.getAttribute('data-tab');
                this.navigateTo(targetPage);
            });
        });

        console.log('✅ Tab-Navigation eingerichtet');
    }

    navigateTo(pageId) {
        console.log(`🔄 Navigiere zu: ${pageId}`);
        
        // Verlasse aktuelle Seite
        this.leaveCurrentPage();
        
        // Wechsle zur neuen Seite
        this.showPage(pageId);
        
        // Aktualisiere aktiven Tab
        this.updateActiveTab(pageId);
        
        this.currentPage = pageId;
    }

    showPage(pageId) {
        // Verstecke alle Seiten
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Zeige gewünschte Seite
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            console.log(`✅ Seite ${pageId} angezeigt`);
        } else {
            console.error(`❌ Seite ${pageId} nicht gefunden`);
        }
        
        // Rufe onEnter des entsprechenden Controllers auf
        this.callPageControllerMethod(pageId, 'onEnter');
    }

    leaveCurrentPage() {
        // Rufe onLeave des aktuellen Controllers auf
        this.callPageControllerMethod(this.currentPage, 'onLeave');
    }

    callPageControllerMethod(pageId, methodName) {
        const controllerMap = {
            'page1': window.page1Controller,
            'page2': window.page2Controller, 
            'page3': window.page3Controller,
            'page4': window.page4Controller
        };
        
        const controller = controllerMap[pageId];
        if (controller && typeof controller[methodName] === 'function') {
            console.log(`📞 Rufe ${methodName} auf für ${pageId}`);
            controller[methodName]();
        }
    }

    updateActiveTab(pageId) {
        // Entferne active von allen Tabs
        document.querySelectorAll('.tab-button').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Setze active auf aktuellen Tab
        const activeTab = document.querySelector(`[data-tab="${pageId}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }

    setupGlobalEventListeners() {
        // Globale Event Listener für seitenübergreifende Funktionen
        console.log('🔧 Globale Event Listener eingerichtet');
        
        // Tastatur-Shortcuts
        document.addEventListener('keydown', (e) => {
            // Strg + Nummer für schnelle Navigation
            if (e.ctrlKey && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const pageNumber = parseInt(e.key);
                this.navigateTo(`page${pageNumber}`);
            }
            
            // F5 für Refresh
            if (e.key === 'F5') {
                e.preventDefault();
                this.refreshCurrentPage();
            }
        });
        
        // Globale Refresh-Funktion
        window.refreshApp = () => {
            this.refreshCurrentPage();
        };
    }

    refreshCurrentPage() {
        console.log(`🔄 Aktualisiere aktuelle Seite: ${this.currentPage}`);
        this.callPageControllerMethod(this.currentPage, 'onEnter');
    }

    // Öffentliche API
    getCurrentPage() {
        return this.currentPage;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 4000);
    }

    // Diagnose-Funktion
    diagnose() {
        return {
            currentPage: this.currentPage,
            page1Controller: !!window.page1Controller,
            page2Controller: !!window.page2Controller,
            page3Controller: !!window.page3Controller, 
            page4Controller: !!window.page4Controller,
            cloudAPI: !!window.cloudAPI,
            cloudAPIReady: window.cloudAPI ? window.cloudAPI.ready : false,
            timestamp: Date.now()
        };
    }
}

// App initialisieren wenn DOM geladen
document.addEventListener('DOMContentLoaded', function() {
    window.app = new AppController();
    
    // Kurze Verzögerung für Initialisierung aller Controller
    setTimeout(() => {
        console.log('🎉 App vollständig geladen');
        console.table(window.app.diagnose());
    }, 1000);
});

// Fallback für manuelle Initialisierung
if (!window.app) {
    window.app = new AppController();
}
