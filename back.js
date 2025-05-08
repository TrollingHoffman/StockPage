// משתנים גלובליים
let currentStock = null;
let lastUpdateTime = null;
let updateInterval = null;

// פונקציית אתחול
document.addEventListener('DOMContentLoaded', function() {
    // קישור אירועי לחיצה
    document.getElementById('search-button').addEventListener('click', searchStock);
    document.getElementById('ask-perplexity').addEventListener('click', askPerplexity);
    
    // קישור לשוניות חדשות
    const newsTabs = document.querySelectorAll('.news-tabs .tab-button');
    newsTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            switchNewsTab(this.getAttribute('data-source'));
        });
    });
    
    // קישור לשוניות המלצות
    const recommendationTabs = document.querySelectorAll('.recommendations-tabs .tab-button');
    recommendationTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            switchRecommendationsTab(this.getAttribute('data-budget'));
        });
    });
    
    // טעינת המלצות ראשונית
    loadRecommendations();
    
    // הגדרת עדכון אוטומטי כל 5 דקות
    setUpdateInterval();
});

// פונקציית חיפוש מניה
function searchStock() {
    const stockSymbol = document.getElementById('stock-search').value.trim();
    
    if (stockSymbol === '') {
        alert('נא להזין סמל או שם מניה');
        return;
    }
    
    // הצגת אזור המניה
    document.getElementById('stock-display').style.display = 'block';
    
    // איפוס נתונים קודמים
    clearStockData();
    
    // הגדרת מניה נוכחית
    currentStock = stockSymbol;
    
    // טעינת נתוני המניה
    loadStockData(stockSymbol);
    
    // טעינת חדשות רלוונטיות
    loadNewsForStock(stockSymbol);
}

// פונקציית טעינת נתוני מניה
function loadStockData(symbol) {
    // כאן יש להוסיף קוד לטעינת נתוני המניה מ-Stockcal API
    // לדוגמה:
    /*
    fetch(`https://stockcal.rf.gd/api/stock?symbol=${symbol}`)
        .then(response => response.json())
        .then(data => {
            updateStockInfo(data);
            createStockChart(data);
        })
        .catch(error => {
            console.error('שגיאה בטעינת נתוני המניה:', error);
            document.getElementById('stock-name').textContent = 'שגיאה בטעינת נתוני המניה';
        });
    */
    
    // קוד זמני להדגמה בלבד:
    setTimeout(() => {
        const mockData = {
            name: symbol,
            currentValue: 150.25,
            change: 2.75,
            changePercent: 1.87
        };
        updateStockInfo(mockData);
    }, 1000);
}

// פונקציית עדכון מידע על המניה בממשק
function updateStockInfo(data) {
    document.getElementById('stock-name').textContent = data.name;
    document.getElementById('stock-value').textContent = data.currentValue.toFixed(2);
    
    const changeElement = document.getElementById('stock-change');
    const changeText = `${data.change.toFixed(2)} (${data.changePercent.toFixed(2)}%)`;
    changeElement.textContent = changeText;
    
    // עדכון צבע על פי מגמה
    if (data.change > 0) {
        changeElement.className = 'positive';
    } else if (data.change < 0) {
        changeElement.className = 'negative';
    } else {
        changeElement.className = 'neutral';
    }
    
    // יצירת גרף
    createStockChart(data);
    
    // עדכון זמן עדכון אחרון
    updateLastUpdateTime();
}

// פונקציית יצירת גרף למניה
function createStockChart(data) {
    // כאן יש להוסיף קוד ליצירת גרף המניה
    // לדוגמה, באמצעות ספריית Chart.js או גרף מותאם אישית
    const chartContainer = document.getElementById('stock-chart');
    chartContainer.innerHTML = '<p>כאן יוצג הגרף של המניה</p>';
}

// פונקציית טעינת חדשות למניה
function loadNewsForStock(symbol) {
    // כאן יש להוסיף קוד לטעינת חדשות למניה ממקורות שונים
    // לדוגמה:
    /*
    // טעינת חדשות מ-X
    fetch(`https://stockcal.rf.gd/api/news/x?symbol=${symbol}`)
        .then(response => response.json())
        .then(data => {
            displayNews('news-x', data);
        })
        .catch(error => {
            console.error('שגיאה בטעינת חדשות מ-X:', error);
            document.getElementById('news-x').innerHTML = '<p>שגיאה בטעינת חדשות</p>';
        });
    
    // טעינת חדשות מ-Facebook
    // וכו'...
    */
    
    // קוד זמני להדגמה בלבד:
    const mockNews = {
        x: [
            { title: 'חדשות מ-X על ' + symbol, date: '12/05/2025', url: '#' },
            { title: 'עדכון חשוב על ' + symbol, date: '11/05/2025', url: '#' }
        ],
        facebook: [
            { title: 'פוסט פייסבוק על ' + symbol, date: '10/05/2025', url: '#' }
        ],
        yahoo: [
            { title: 'יאהו פיננס: ' + symbol + ' מציגה תוצאות מרשימות', date: '09/05/2025', url: '#' },
            { title: 'ניתוח ' + symbol + ' מאת מומחי יאהו', date: '08/05/2025', url: '#' }
        ],
        stockcal: [
            { title: 'ניתוח טכני עבור ' + symbol, date: '07/05/2025', url: '#' }
        ]
    };
    
    displayNews('news-x', mockNews.x);
    displayNews('news-facebook', mockNews.facebook);
    displayNews('news-yahoo', mockNews.yahoo);
    displayNews('news-stockcal', mockNews.stockcal);
}

// פונקציית הצגת חדשות בלשונית
function displayNews(tabId, newsItems) {
    const tabElement = document.getElementById(tabId);
    tabElement.innerHTML = '';
    
    if (newsItems.length === 0) {
        tabElement.innerHTML = '<p>אין חדשות להצגה</p>';
        return;
    }
    
    newsItems.forEach(item => {
        const newsElement = document.createElement('div');
        newsElement.className = 'news-item';
        
        const titleElement = document.createElement('a');
        titleElement.className = 'news-title';
        titleElement.href = item.url;
        titleElement.target = '_blank';
        titleElement.textContent = item.title;
        
        const dateElement = document.createElement('div');
        dateElement.className = 'news-date';
        dateElement.textContent = item.date;
        
        newsElement.appendChild(titleElement);
        newsElement.appendChild(dateElement);
        tabElement.appendChild(newsElement);
    });
}

// פונקציית החלפת לשונית חדשות
function switchNewsTab(source) {
    // הסרת מחלקת active מכל הלשוניות
    const allTabs = document.querySelectorAll('.news-tab');
    allTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // הוספת מחלקת active ללשונית הנבחרת
    const tabId = 'news-' + source;
    document.getElementById(tabId).classList.add('active');
    
    // עדכון כפתורי הלשוניות
    const allButtons = document.querySelectorAll('.news-tabs .tab-button');
    allButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-source') === source) {
            button.classList.add('active');
        }
    });
}

// פונקציית שאילתא ל-Perplexity
function askPerplexity() {
    const question = document.getElementById('perplexity-question').value.trim();
    
    if (question === '') {
        alert('נא להזין שאלה');
        return;
    }
    
    const resultElement = document.getElementById('perplexity-result');
    resultElement.innerHTML = '<p>שולח שאילתא...</p>';
    
    // כאן יש להוסיף קוד לשליחת שאילתא ל-Perplexity API
    // לדוגמה:
    /*
    fetch('https://api.perplexity.ai/query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_API_KEY'
        },
        body: JSON.stringify({
            query: question,
            context: currentStock ? `מידע על מניית ${currentStock}` : ''
        })
    })
        .then(response => response.json())
        .then(data => {
            displayPerplexityResult(data);
        })
        .catch(error => {
            console.error('שגיאה בשליחת שאילתא ל-Perplexity:', error);
            resultElement.innerHTML = '<p>שגיאה בשליחת השאילתא</p>';
        });
    */
    
    // קוד זמני להדגמה בלבד:
    setTimeout(() => {
        resultElement.innerHTML = '<p>תשובה מ-Perplexity לשאלה: "' + question + '"</p>' +
            '<p>כאן תוצג התשובה מה-API של Perplexity.</p>';
    }, 1500);
}

// פונקציית הצגת תוצאת Perplexity
function displayPerplexityResult(data) {
    const resultElement = document.getElementById('perplexity-result');
    // כאן יש לעבד את התשובה מ-Perplexity ולהציג אותה
    resultElement.innerHTML = '<p>' + data.answer + '</p>';
}

// פונקציית טעינת המלצות אלגוריתמיות
function loadRecommendations() {
    // כאן יש להוסיף קוד לטעינת המלצות מניות אלגוריתמיות
    // לדוגמה:
    /*
    fetch('https://stockcal.rf.gd/api/recommendations')
        .then(response => response.json())
        .then(data => {
            displayRecommendations('low-budget', data.lowBudget);
            displayRecommendations('high-budget', data.highBudget);
        })
        .catch(error => {
            console.error('שגיאה בטעינת המלצות:', error);
            document.getElementById('low-budget').innerHTML = '<p>שגיאה בטעינת המלצות</p>';
            document.getElementById('high-budget').innerHTML = '<p>שגיאה בטעינת המלצות</p>';
        });
    */
    
    // קוד זמני להדגמה בלבד:
    const mockRecommendations = {
        lowBudget: [
            { name: 'חברה א', value: '35.40', date: '08/05/2025' },
            { name: 'חברה ב', value: '12.75', date: '08/05/2025' }
        ],
        highBudget: [
            { name: 'חברה ג', value: '342.10', date: '08/05/2025' },
            { name: 'חברה ד', value: '1204.50', date: '08/05/2025' }
        ]
    };
    
    displayRecommendations('low-budget', mockRecommendations.lowBudget);
    displayRecommendations('high-budget', mockRecommendations.highBudget);
    
    // עדכון זמן עדכון אחרון
    updateLastUpdateTime();
}

// פונקציית הצגת המלצות
function displayRecommendations(tabId, recommendations) {
    const tabElement = document.getElementById(tabId);
    tabElement.innerHTML = '';
    
    if (recommendations.length === 0) {
        tabElement.innerHTML = '<p>אין המלצות להצגה</p>';
        return;
    }
    
    recommendations.forEach(item => {
        const recommendationElement = document.createElement('div');
        recommendationElement.className = 'stock-recommendation';
        
        const titleElement = document.createElement('div');
        titleElement.className = 'recommendation-title';
        titleElement.textContent = item.name;
        
        const valueElement = document.createElement('div');
        valueElement.className = 'recommendation-value';
        valueElement.textContent = 'ערך נוכחי: ' + item.value;
        
        const dateElement = document.createElement('div');
        dateElement.className = 'recommendation-date';
        dateElement.textContent = 'תאריך המלצה: ' + item.date;
        
        recommendationElement.appendChild(titleElement);
        recommendationElement.appendChild(valueElement);
        recommendationElement.appendChild(dateElement);
        tabElement.appendChild(recommendationElement);
    });
}

// פונקציית החלפת לשונית המלצות
function switchRecommendationsTab(budget) {
    // הסרת מחלקת active מכל הלשוניות
    const allTabs = document.querySelectorAll('.recommendations-tab');
    allTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // הוספת מחלקת active ללשונית הנבחרת
    const tabId = budget + '-budget';
    document.getElementById(tabId).classList.add('active');
    
    // עדכון כפתורי הלשוניות
    const allButtons = document.querySelectorAll('.recommendations-tabs .tab-button');
    allButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-budget') === budget) {
            button.classList.add('active');
        }
    });
}

// פונקציית עדכון זמן עדכון אחרון
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0');
    
    document.getElementById('last-update-time').textContent = timeString;
    lastUpdateTime = now;
}

// פונקציית הגדרת עדכון אוטומטי
function setUpdateInterval() {
    // ביטול עדכון קודם אם קיים
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    // הגדרת עדכון חדש - כל 5 דקות (300,000 מילישניות)
    updateInterval = setInterval(() => {
        if (currentStock) {
            loadStockData(currentStock);
            loadNewsForStock(currentStock);
        }
        loadRecommendations();
    }, 300000);
}

// פונקציית איפוס נתוני מניה
function clearStockData() {
    document.getElementById('stock-name').textContent = 'טוען...';
    document.getElementById('stock-value').textContent = '0.00';
    document.getElementById('stock-change').textContent = '0.00 (0.00%)';
    document.getElementById('stock-change').className = 'neutral';
    document.getElementById('stock-chart').innerHTML = '';
    
    // איפוס לשוניות חדשות
    document.getElementById('news-x').innerHTML = '<p>טוען חדשות...</p>';
    document.getElementById('news-facebook').innerHTML = '<p>טוען חדשות...</p>';
    document.getElementById('news-yahoo').innerHTML = '<p>טוען חדשות...</p>';
    document.getElementById('news-stockcal').innerHTML = '<p>טוען חדשות...</p>';
}