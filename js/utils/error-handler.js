/**
 * Zentrale Fehlerbehandlung
 */

class ErrorHandler {
    static handleCloudError(error, operation, context = {}) {
        console.error(`Cloud-Operation fehlgeschlagen: ${operation}`, error, context);
        
        const errorInfo = {
            operation,
            error: error.message,
            timestamp: Date.now(),
            ...context
        };
        
        // Fehler protokollieren
        this.logError(errorInfo);
        
        // Benutzerfreundliche Fehlermeldung
        const userMessage = this.getUserFriendlyMessage(error, operation);
        this.showUserNotification(userMessage, 'error');
        
        // Fallback: Lokale Daten verwenden
        if (error.name === 'NetworkError' || error.name === 'TypeError') {
            this.useLocalDataFallback(operation, context);
        }
        
        return errorInfo;
    }
    
    static async retryOperation(operation, maxRetries = 3, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                
                console.log(`Wiederholung ${i + 1}/${maxRetries} fehlgeschlagen, warte...`);
                await this.delay(delay * (i + 1));
            }
        }
    }
    
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    static getUserFriendlyMessage(error, operation) {
        const operationMap = {
            'fetch': 'Abruf der Daten',
            'save': 'Speichern der Daten',
            'update': 'Aktualisieren der Daten',
            'delete': 'Löschen der Daten',
            'sync': 'Synchronisation'
        };
        
        const operationText = operationMap[operation] || operation;
        
        if (error.name === 'NetworkError') {
            return `${operationText} fehlgeschlagen: Keine Verbindung zum Server.`;
        }
        
        if (error.message.includes('401') || error.message.includes('403')) {
            return `${operationText} fehlgeschlagen: Zugriff verweigert.`;
        }
        
        if (error.message.includes('404')) {
            return `${operationText} fehlgeschlagen: Ressource nicht gefunden.`;
        }
        
        if (error.message.includes('500')) {
            return `${operationText} fehlgeschlagen: Server-Fehler.`;
        }
        
        return `${operationText} fehlgeschlagen: ${error.message}`;
    }
    
    static showUserNotification(message, type = 'info') {
        // Einfache Notification implementieren
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${this.getNotificationColor(type)};
            color: white;
            border-radius: 0.375rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 1rem;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Close Button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    static getNotificationColor(type) {
        const colors = {
            info: '#2563eb',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444'
        };
        return colors[type] || colors.info;
    }
    
    static useLocalDataFallback(operation, context) {
        console.warn(`Verwende lokale Daten als Fallback für: ${operation}`);
        
        // Event auslösen für Fallback-Modus
        window.dispatchEvent(new CustomEvent('fallbackMode', {
            detail: { operation, context }
        }));
    }
    
    static logError(errorInfo) {
        // Fehler in localStorage protokollieren (max 50 Einträge)
        try {
            const errorLog = JSON.parse(localStorage.getItem('errorLog') || '[]');
            errorLog.unshift(errorInfo);
            
            // Auf 50 Einträge begrenzen
            if (errorLog.length > 50) {
                errorLog.splice(50);
            }
            
            localStorage.setItem('errorLog', JSON.stringify(errorLog));
        } catch (error) {
            console.error('Fehler beim Protokollieren:', error);
        }
    }
    
    static getErrorLog() {
        try {
            return JSON.parse(localStorage.getItem('errorLog') || '[]');
        } catch (error) {
            return [];
        }
    }
    
    static clearErrorLog() {
        localStorage.removeItem('errorLog');
    }
}

// CSS für Notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.25rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;
document.head.appendChild(notificationStyles);
