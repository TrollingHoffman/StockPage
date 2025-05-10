// info.js - סקריפט עבור דף מילון המושגים

document.addEventListener('DOMContentLoaded', function() {
    console.log('דף המושגים נטען בהצלחה');
    
    // אתחול חיפוש מושגים
    initConceptSearch();
    
    // אתחול סינון קטגוריות מושגים
    initCategoryFilter();
    
    // אתחול לחיצה על קטגוריות
    initCategoryCards();
    
    // הוספת אנימציות לכרטיסים
    initCardAnimations();
});

// אתחול מנגנון חיפוש מושגים
function initConceptSearch() {
    const searchInput = document.getElementById('concept-search');
    const clearButton = document.getElementById('search-clear');
    
    if (!searchInput || !clearButton) return;
    
    // אירוע הקלדה בשדה החיפוש
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.trim().toLowerCase();
        
        // הצגה/הסתרה של כפתור ניקוי
        if (searchTerm.length > 0) {
            clearButton.style.display = 'block';
        } else {
            clearButton.style.display = 'none';
        }
        
        // סינון מושגים לפי מילת חיפוש
        filterConcepts(searchTerm);
    });
    
    // אירוע לחיצה על כפתור ניקוי
    clearButton.addEventListener('click', function() {
        searchInput.value = '';
        clearButton.style.display = 'none';
        
        // הצגת כל המושגים
        filterConcepts('');
    });
}

// פונקציית סינון מושגים
function filterConcepts(searchTerm) {
    const conceptCards = document.querySelectorAll('.concept-card');
    const activeFilter = document.querySelector('.filter-btn.active');
    const activeCategory = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
    
    // כמה מושגים נמצאו
    let matchCount = 0;
    
    conceptCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const content = card.querySelector('p').textContent.toLowerCase();
        const category = card.getAttribute('data-category');
        
        // בדיקה אם המושג מתאים לקטגוריה הפעילה וגם למונח החיפוש
        const matchesCategory = (activeCategory === 'all' || category === activeCategory);
        const matchesSearch = (searchTerm === '' || title.includes(searchTerm) || content.includes(searchTerm));
        
        if (matchesCategory && matchesSearch) {
            card.style.display = 'block';
            matchCount++;
            
            // הדגשת מילות חיפוש
            if (searchTerm !== '') {
                highlightSearchTerm(card, searchTerm);
            } else {
                // הסרת הדגשה קודמת
                removeHighlights(card);
            }
        } else {
            card.style.display = 'none';
        }
    });
    
    // הצגת הודעה אם אין תוצאות
    const conceptsGrid = document.getElementById('concepts-grid');
    const noResultsMessage = conceptsGrid.querySelector('.no-results-message');
    
    if (matchCount === 0) {
        if (!noResultsMessage) {
            const message = document.createElement('div');
            message.className = 'no-results-message';
            message.textContent = 'לא נמצאו מושגים התואמים את החיפוש';
            conceptsGrid.appendChild(message);
        }
    } else if (noResultsMessage) {
        noResultsMessage.remove();
    }
}

// פונקציה להדגשת מונח חיפוש
function highlightSearchTerm(card, term) {
    // קודם מסירים הדגשות קודמות
    removeHighlights(card);
    
    // מחליפים את המופעים של מילת החיפוש בטקסט עם גרסה מודגשת
    const titleElement = card.querySelector('h3');
    const contentElement = card.querySelector('p');
    
    // לא משנים את ה-DOM ישירות כדי למנוע בעיות עם אירועים וכו'
    // במקום זאת, יוצרים העתק של הטקסט ומחליפים בו
    const titleText = titleElement.textContent;
    const contentText = contentElement.textContent;
    
    // מחליפים את מילת החיפוש בטקסט מודגש
    const regex = new RegExp(term, 'gi');
    const highlightedTitle = titleText.replace(regex, match => `<span class="highlight">${match}</span>`);
    const highlightedContent = contentText.replace(regex, match => `<span class="highlight">${match}</span>`);
    
    // מעדכנים את התוכן
    titleElement.innerHTML = highlightedTitle;
    contentElement.innerHTML = highlightedContent;
}

// פונקציה להסרת הדגשות
function removeHighlights(card) {
    const titleElement = card.querySelector('h3');
    const contentElement = card.querySelector('p');
    
    // שמירת הטקסט המקורי
    const titleText = titleElement.textContent;
    const contentText = contentElement.textContent;
    
    // החזרת הטקסט המקורי ללא HTML
    titleElement.textContent = titleText;
    contentElement.textContent = contentText;
}

// אתחול סינון קטגוריות
function initCategoryFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // הסרת active מכל הכפתורים
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // הוספת active לכפתור הנוכחי
            this.classList.add('active');
            
            // סינון קטגוריות
            const category = this.getAttribute('data-filter');
            const searchTerm = document.getElementById('concept-search').value.trim().toLowerCase();
            
            filterConcepts(searchTerm);
        });
    });
}

// אתחול קטגוריות
function initCategoryCards() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // הפעלת הכפתור המתאים
            const filterButtons = document.querySelectorAll('.filter-btn');
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-filter') === category) {
                    btn.classList.add('active');
                }
            });
            
            // סינון המושגים
            filterConcepts(document.getElementById('concept-search').value.trim().toLowerCase());
            
            // גלילה אל אזור המושגים
            document.getElementById('concepts-container').scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// אתחול אנימציות לכרטיסי מושגים
function initCardAnimations() {
    // הוספת אנימציות עם Intersection Observer
    if ('IntersectionObserver' in window) {
        const cards = document.querySelectorAll('.concept-card, .summary-item, .category-card, .chart-type-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        cards.forEach(card => {
            card.classList.add('animate-on-scroll');
            observer.observe(card);
        });
    }
}

// פונקציה לטעינת תמונות גרפים
function loadChartImages() {
    const chartImages = document.querySelectorAll('.chart-image');
    
    // עדכון תמונות הגרפים למניעת הצגת תמונות placeholder
    chartImages.forEach((img, index) => {
        // כאן ניתן להחליף עם קישורים אמיתיים לתמונות גרפים
        const chartTypes = ['line-chart', 'candlestick-chart', 'ohlc-chart', 'patterns-chart'];
        const chartType = chartTypes[index % chartTypes.length];
        
        // עדכון תמונות רק אם הן תמונות placeholder
        if (img.src.includes('placeholder')) {
            img.src = `/images/${chartType}.png`;
            img.onerror = () => {
                // אם התמונה לא קיימת, שימוש בתמונת placeholder
                img.src = 'https://via.placeholder.com/350x200?text=' + chartType;
            };
        }
    });
}