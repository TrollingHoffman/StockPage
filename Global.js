// global.js - פונקציות JavaScript משותפות לכל העמודים

// אתחול כשהדף נטען
document.addEventListener('DOMContentLoaded', function() {
    // אתחול תפריט המבורגר
    initHamburgerMenu();
    
    // אתחול מנגנון מצב כהה/בהיר
    initDarkModeToggle();
    
    // נטרול אפקט אקטיב מהקישורים
    disableLinkActiveState();
    
    // עדכון קישור פעיל בתפריט
    updateActiveNavLink();
});

// פונקציית אתחול תפריט המבורגר
function initHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // סגירת התפריט בלחיצה על קישור
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // סגירת התפריט בלחיצה מחוץ לתפריט
        document.addEventListener('click', function(event) {
            if (!navMenu.contains(event.target) && !hamburger.contains(event.target) && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

// פונקציית אתחול מנגנון מצב כהה/בהיר
function initDarkModeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        
        // בדיקה אם המשתמש כבר בחר תצוגה כהה
        if (localStorage.getItem('theme') === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            if (icon) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        }
        
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            
            if (currentTheme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                if (icon) {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                }
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                if (icon) {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                }
            }
            
            // עדכון צבעים דינמיים אם קיימת פונקציה
            if (typeof updateExploreCardsTheme === 'function') {
                updateExploreCardsTheme();
            }
        });
    }
}

// פונקציה לנטרול אפקט אקטיב מהקישורים (למניעת צבע כחול כברירת מחדל)
function disableLinkActiveState() {
    document.addEventListener('mousedown', function(e) {
        if (e.target.tagName === 'A') {
            e.preventDefault();
        }
    });
}

// פונקציה לעדכון הקישור הפעיל בתפריט
function updateActiveNavLink() {
    const currentPath = window.location.pathname;
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        
        const href = link.getAttribute('href');
        if (href === currentPath || 
           (currentPath === '/' && href === '/index.html') ||
           (href !== '/index.html' && currentPath.includes(href))) {
            link.classList.add('active');
        }
    });
}

// פונקציית הצגת התראות למשתמש - פונקציה משותפת לכל העמודים
function showNotification(message, type = 'info') {
    // בדיקה אם קיים אלמנט הודעות
    let notificationContainer = document.querySelector('.notification-container');
    
    // יצירת מיכל הודעות אם לא קיים
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // יצירת הודעה חדשה
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // הוספת אייקון בהתאם לסוג ההודעה
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-times-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle"></i>';
    }
    
    notification.innerHTML = `
        ${icon}
        <span class="notification-message">${message}</span>
        <span class="notification-close">&times;</span>
    `;
    
    // הוספת אירוע סגירה
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.classList.add('closing');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // הוספת ההודעה למיכל
    notificationContainer.appendChild(notification);
    
    // הסרת ההודעה אוטומטית אחרי 5 שניות
    setTimeout(() => {
        if (notification) {
            notification.classList.add('closing');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// פונקציות עזר לפורמט מספרים וסכומים
function formatNumber(num) {
    if (num === undefined || num === null || isNaN(num)) {
        return '0';
    }
    return new Intl.NumberFormat().format(num);
}

function formatMarketCap(num) {
    if (!num || isNaN(num)) {
        return '$0';
    }
    
    if (num >= 1e12) {
        return '$' + (num / 1e12).toFixed(2) + 'T';
    } else if (num >= 1e9) {
        return '$' + (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
        return '$' + (num / 1e6).toFixed(2) + 'M';
    } else {
        return '$' + formatNumber(num);
    }
}

// פונקציות תאריך משותפות
function getToday() {
    const today = new Date();
    return formatDateForAPI(today);
}

function getDateBefore(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return formatDateForAPI(date);
}

function formatDateForAPI(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// פונקציית התאמת צבעים לפי מצב תצוגה
function updateExploreCardsTheme() {
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const cards = document.querySelectorAll('.explore-card');
    
    cards.forEach(card => {
        if (isDarkMode) {
            card.style.backgroundColor = 'var(--bg-card-dark, #2a2a2a)';
        } else {
            card.style.backgroundColor = 'var(--bg-card, #ffffff)';
        }
    });
}