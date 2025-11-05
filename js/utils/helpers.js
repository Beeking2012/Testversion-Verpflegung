/**
 * Hilfsfunktionen und Utilities
 */

class Helpers {
    // DOM Utilities
    static createElement(tag, classes = [], attributes = {}) {
        const element = document.createElement(tag);
        
        if (classes.length > 0) {
            element.className = classes.join(' ');
        }
        
        Object.keys(attributes).forEach(key => {
            element.setAttribute(key, attributes[key]);
        });
        
        return element;
    }

    static showElement(element) {
        element.classList.remove('hidden');
    }

    static hideElement(element) {
        element.classList.add('hidden');
    }

    static toggleElement(element) {
        element.classList.toggle('hidden');
    }

    // Formatierung
    static formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static formatNumber(number, decimals = 2) {
        return new Intl.NumberFormat('de-DE', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    }

    static formatFileSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${this.formatNumber(size, 1)} ${units[unitIndex]}`;
    }

    // Validierung
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // Daten-Transformation
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    static mergeObjects(target, source) {
        return { ...target, ...source };
    }

    static filterObject(obj, predicate) {
        return Object.fromEntries(
            Object.entries(obj).filter(([key, value]) => predicate(key, value))
        );
    }

    // Array Utilities
    static chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    static uniqueArray(array, key = null) {
        if (key) {
            const seen = new Set();
            return array.filter(item => {
                const value = item[key];
                if (seen.has(value)) {
                    return false;
                }
                seen.add(value);
                return true;
            });
        }
        return [...new Set(array)];
    }

    // Storage Utilities
    static setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    static getStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage error:', error);
            return defaultValue;
        }
    }

    static removeStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    // String Utilities
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static truncate(str, length, suffix = '...') {
        return str.length > length ? str.substring(0, length) + suffix : str;
    }

    static generateId(prefix = '') {
        return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Performance
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // URL Utilities
    static getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }

    static setQueryParams(params) {
        const url = new URL(window.location);
        Object.keys(params).forEach(key => {
            url.searchParams.set(key, params[key]);
        });
        window.history.replaceState({}, '', url);
    }

    // Event Utilities
    static once(element, event, handler) {
        const onceHandler = (...args) => {
            handler(...args);
            element.removeEventListener(event, onceHandler);
        };
        element.addEventListener(event, onceHandler);
    }

    // Animation Utilities
    static animateValue(element, start, end, duration) {
        const startTime = performance.now();
        const change = end - start;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = start + change * progress;
            element.textContent = Helpers.formatNumber(current);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }
}

// Globale Hilfsfunktionen
window.helpers = Helpers;
