// משתנים גלובליים
let currentStock = null;
let lastUpdateTime = null;
let updateInterval = null;
const API_KEY_FINNHUB = 'd0eerv1r01qkbclau660d0eerv1r01qkbclau66g';
const API_KEY_STOCKDAIO = '7AE8EC3A9B0140D4835C74E5899E348F';
const API_KEY_STOCKDATA = 'lNzHKanOvI3TcSInUsknlajmAfC9OPdaH2ivMWAn';
let stockChart = null;

// מיפוי ETF ומדדים
const etfMapping = {
    gold: {
        ticker: 'CG=F',
        leverageBull: 'GDXU',
        leverageBear: 'GDXD'
    },
    oil: {
        ticker: 'CL=F',
        leverageBull: 'UCO',
        leverageBear: 'SCO'
    },
    gas: {
        ticker: 'NG=F',
        leverageBull: 'BOIL',
        leverageBear: 'KOLD'
    },
    semiconductor: {
        ticker: 'SOX=F',
        leverageBull: 'SOXL',
        leverageBear: 'SOXS'
    },
    nasdaq: {
        ticker: '^IXIC',
        leverageBull: 'TQQQ',
        leverageBear: 'SQQQ'
    },
    sp500: {
        ticker: '^GSPC',
        leverageBull: 'SPXL',
        leverageBear: 'SPXS'
    }
};

// פונקציית אתחול
document.addEventListener('DOMContentLoaded', function() {
    // קישור אירועי לחיצה לחיפוש מניה
    document.getElementById('search-button').addEventListener('click', searchStock);
    document.getElementById('stock-search').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchStock();
        }
    });
    
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

            // הוסף אפקט גלילה חלקה לקישורים באזור "בואו לחקור עוד"
document.querySelector('.explore-section').addEventListener('mouseover', function() {
    const cards = document.querySelectorAll('.explore-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = 'translateY(-8px)';
        }, index * 100);
        
        setTimeout(() => {
            card.style.transform = '';
        }, index * 100 + 500);
    });
});

// התאמת צבעים בהתאם למצב התצוגה (כהה/בהיר)
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

// הרץ פונקציית עדכון תצוגה בטעינה ובכל שינוי מצב
updateExploreCardsTheme();
document.getElementById('theme-toggle').addEventListener('click', updateExploreCardsTheme);
        });
    });
    
    // קישור לשוניות סננים
    const filterTabs = document.querySelectorAll('.filters-tabs .tab-button');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            switchFilterTab(this.getAttribute('data-filter'));
        });
    });
    
    // קישור לכפתורי גרף
    const rangeButtons = document.querySelectorAll('.range-button');
    rangeButtons.forEach(button => {
        button.addEventListener('click', function() {
            setActiveButton(rangeButtons, this);
            updateChartRange(this.getAttribute('data-range'));
        });
    });
    
    const chartTypeButtons = document.querySelectorAll('.chart-type-button');
    chartTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            setActiveButton(chartTypeButtons, this);
            updateChartType(this.getAttribute('data-type'));
        });
    });
    
    // קישור לכפתורי הפעלת סננים
    document.getElementById('apply-momentum').addEventListener('click', applyMomentumFilter);
    document.getElementById('apply-etf').addEventListener('click', applyEtfLeverageFilter);
    document.getElementById('apply-technical').addEventListener('click', applyTechnicalFilter);
    
    // הגדרת תפריט המבורגר
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // הגדרת כפתור מצב כהה
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle.querySelector('i');
    
    // בדיקה אם המשתמש כבר בחר תצוגה כהה
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        
        if (currentTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
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
        showNotification('נא להזין סמל או שם מניה', 'warning');
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
// פונקציית טעינת נתוני מניה - גרסה מעודכנת
function loadStockData(symbol) {
    // הצגת מחוון טעינה
    document.getElementById('stock-name').textContent = 'טוען...';
    
    // קידוד הסמל לפורמט תקין ל-URL
    const encodedSymbol = encodeURIComponent(symbol.toUpperCase().trim());
    
    console.log(`מחפש מניה לפי הסמל: ${encodedSymbol}`);
    
    // שליחת בקשה לנתוני מניה מ-API של STOCKDATA
    fetch(`https://api.stockdata.org/v1/data/quote?symbols=${encodedSymbol}&api_key=${API_KEY_STOCKDATA}`)
        .then(response => {
            if (!response.ok) {
                console.error(`שגיאת תגובה מהשרת: ${response.status} ${response.statusText}`);
                throw new Error('שגיאה בטעינת נתוני המניה');
            }
            return response.json();
        })
        .then(data => {
            console.log('תשובה מהשרת:', data);
            
            if (data.data && data.data.length > 0) {
                const stockData = data.data[0];
                updateStockInfo(stockData);
                loadStockChart(encodedSymbol);  // שימוש באותו סימול מקודד
            } else {
                // נסיון לחפש את המניה לפי שם
                return fetch(`https://api.stockdata.org/v1/entity/search?search=${encodedSymbol}&api_key=${API_KEY_STOCKDATA}`);
            }
        })
        .then(response => {
            if (!response || !response.ok) {
                if (response) {
                    throw new Error('שגיאה בחיפוש נתוני המניה');
                }
                return; // אם זה לא תגובה (כי הפונקציה הקודמת טיפלה בה), פשוט חזור
            }
            return response.json();
        })
        .then(data => {
            if (!data) return; // אם אין נתונים (כי הפונקציה הראשונה טיפלה בהם), פשוט חזור
            
            console.log('תוצאות חיפוש:', data);
            
            if (data.data && data.data.length > 0) {
                // לקחת את הסמל הראשון שנמצא
                const foundSymbol = data.data[0].ticker;
                console.log(`נמצא סמל: ${foundSymbol} עבור החיפוש: ${symbol}`);
                
                // טעינה מחדש עם הסמל שנמצא
                return fetch(`https://api.stockdata.org/v1/data/quote?symbols=${foundSymbol}&api_key=${API_KEY_STOCKDATA}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('שגיאה בטעינת נתוני המניה');
                        }
                        return response.json();
                    })
                    .then(quoteData => {
                        if (quoteData.data && quoteData.data.length > 0) {
                            const stockData = quoteData.data[0];
                            updateStockInfo(stockData);
                            loadStockChart(foundSymbol);
                        } else {
                            throw new Error('לא נמצאו נתונים עבור המניה המבוקשת');
                        }
                    });
            } else {
                throw new Error('לא נמצאו נתונים עבור המניה המבוקשת');
            }
        })
        .catch(error => {
            console.error('שגיאה בטעינת נתוני המניה:', error);
            document.getElementById('stock-name').textContent = 'שגיאה בטעינת נתוני המניה';
            showNotification(error.message, 'error');
        });
}

// פונקציה חדשה לתיקון סמלי מניות פופולריים
function getCorrectTickerSymbol(symbol) {
    // מיפוי של סמלים שגויים נפוצים לסמלים תקינים
    const symbolMap = {
        'אפל': 'AAPL',
        'מייקרוסופט': 'MSFT',
        'גוגל': 'GOOGL',
        'אמזון': 'AMZN',
        'פייסבוק': 'META',
        'טסלה': 'TSLA',
        'נטפליקס': 'NFLX',
        'נוידיה': 'NVDA',
        'אינטל': 'INTC',
        'איביאם': 'IBM',
        'צ׳ק פוינט': 'CHKP',
        'צק פוינט': 'CHKP',
        'צקפוינט': 'CHKP',
        'נייס': 'NICE',
        'טאוור': 'TSEM',
        'טבע': 'TEVA',
        'אמדוקס': 'DOX',
        'טלדור': 'TALD'
    };
    
    // בדיקה אם הסמל מופיע במיפוי
    const normalizedSymbol = symbol.trim().toLowerCase();
    if (symbolMap[normalizedSymbol]) {
        return symbolMap[normalizedSymbol];
    }
    
    // אם לא מופיע במיפוי, החזר את הסמל המקורי
    return symbol.toUpperCase().trim();
}

// עדכון פונקציית החיפוש
function searchStock() {
    let stockSymbol = document.getElementById('stock-search').value.trim();
    
    if (stockSymbol === '') {
        showNotification('נא להזין סמל או שם מניה', 'warning');
        return;
    }
    
    // בדיקה וטיפול בשמות מניות בעברית או סמלים שגויים
    stockSymbol = getCorrectTickerSymbol(stockSymbol);
    
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

// פונקציית עדכון מידע על המניה בממשק
function updateStockInfo(data) {
    // עדכון שם המניה
    document.getElementById('stock-name').textContent = data.name || data.symbol;
    
    // עדכון מחיר נוכחי
    const currentValue = data.price || 0;
    document.getElementById('stock-value').textContent = currentValue.toFixed(2);
    
    // עדכון שינוי
    const change = data.day_change || 0;
    const changePercent = data.change_percent || 0;
    const changeElement = document.getElementById('stock-change');
    const changeText = `${change.toFixed(2)} (${changePercent.toFixed(2)}%)`;
    changeElement.textContent = changeText;
    
    // עדכון צבע על פי מגמה
    if (change > 0) {
        changeElement.className = 'positive';
    } else if (change < 0) {
        changeElement.className = 'negative';
    } else {
        changeElement.className = 'neutral';
    }
    
    // עדכון מדדים נוספים
    document.getElementById('stock-volume').textContent = formatNumber(data.volume || 0);
    document.getElementById('stock-turnover').textContent = `$${formatNumber(data.volume * data.price || 0)}`;
    document.getElementById('stock-market-cap').textContent = formatMarketCap(data.market_cap || 0);
    document.getElementById('stock-pe').textContent = (data.pe || 0).toFixed(2);
    
    // עדכון זמן עדכון אחרון
    updateLastUpdateTime();
}

// פונקציית טעינת גרף למניה
// פונקציית טעינת חדשות למניה - גרסה מעודכנת
function loadNewsForStock(symbol) {
    // איפוס לשוניות חדשות
    document.getElementById('news-all').innerHTML = '<p>טוען חדשות...</p>';
    document.getElementById('news-yahoo').innerHTML = '';
    document.getElementById('news-finnhub').innerHTML = '';
    document.getElementById('news-stockdata').innerHTML = '';
    
    // קידוד הסמל לפורמט תקין ל-URL
    const encodedSymbol = encodeURIComponent(symbol.toUpperCase().trim());
    
    console.log(`מחפש חדשות עבור סמל: ${encodedSymbol}`);
    
    // טעינת חדשות מ-Finnhub
    fetch(`https://finnhub.io/api/v1/company-news?symbol=${encodedSymbol}&from=${getDateBefore(30)}&to=${getToday()}&token=${API_KEY_FINNHUB}`)
        .then(response => {
            if (!response.ok) {
                console.error(`שגיאת תגובה מ-Finnhub: ${response.status}`);
                throw new Error('שגיאה בטעינת חדשות מ-Finnhub');
            }
            return response.json();
        })
        .then(data => {
            console.log(`התקבלו ${data.length || 0} פריטי חדשות מ-Finnhub`);
            const finnhubNews = Array.isArray(data) ? data.slice(0, 10) : []; // מגביל ל-10 פריטים
            displayNews('news-finnhub', finnhubNews, 'finnhub');
            
            // טעינת חדשות מ-STOCKDATA אחרי שהסתיימה הטעינה מ-Finnhub
            return fetch(`https://api.stockdata.org/v1/news/all?symbols=${encodedSymbol}&filter_entities=true&language=en&api_key=${API_KEY_STOCKDATA}`);
        })
        .then(response => {
            if (!response.ok) {
                console.error(`שגיאת תגובה מ-StockData: ${response.status}`);
                throw new Error('שגיאה בטעינת חדשות מ-StockData');
            }
            return response.json();
        })
        .then(data => {
            console.log(`התקבלו ${data.data?.length || 0} פריטי חדשות מ-StockData`);
            const stockdataNews = data.data || [];
            displayNews('news-stockdata', stockdataNews, 'stockdata');
            
            // יצירת קומבינציה של כל החדשות
            combineAndDisplayAllNews();
        })
        .catch(error => {
            console.error('שגיאה בטעינת חדשות:', error);
            document.getElementById('news-all').innerHTML = '<p>שגיאה בטעינת חדשות או אין חדשות זמינות עבור מניה זו</p>';
            document.getElementById('news-finnhub').innerHTML = '<p>שגיאה בטעינת חדשות</p>';
            document.getElementById('news-stockdata').innerHTML = '<p>שגיאה בטעינת חדשות</p>';
            document.getElementById('news-yahoo').innerHTML = '<p>חדשות מיאהו אינן זמינות כרגע</p>';
            showNotification('לא ניתן לטעון חדשות עבור מניה זו - נא לוודא כי הזנת סמל מניה תקין', 'warning');
        });
}
// פונקציית יצירת גרף למניה
function createStockChart(data) {
    const chartContainer = document.getElementById('stock-chart');
    chartContainer.innerHTML = '<canvas id="price-chart"></canvas>';
    
    const ctx = document.getElementById('price-chart').getContext('2d');
    
    // הכנת נתונים לגרף
    const chartData = {
        labels: data.map(item => new Date(item.date).toLocaleDateString()),
        datasets: [{
            label: 'מחיר סגירה',
            data: data.map(item => item.close),
            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-primary'),
            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-primary-light') + '20',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHitRadius: 10,
            pointHoverBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-primary'),
            fill: true,
            tension: 0.2
        }]
    };
    
    // אפשרויות גרף
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(context) {
                        return `מחיר: $${context.raw.toFixed(2)}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    maxTicksLimit: 10
                }
            },
            y: {
                position: 'right',
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };
    
    // יצירת הגרף
    if (stockChart) {
        stockChart.destroy();
    }
    
    stockChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: chartOptions
    });
}

// פונקציית עדכון טווח הגרף
function updateChartRange(range) {
    if (!currentStock || !stockChart) return;
    
    // שליחת בקשה לנתוני היסטוריה עם טווח תאריכים מותאם
    const endDate = new Date();
    let startDate = new Date();
    
    switch (range) {
        case '1d':
            startDate.setDate(endDate.getDate() - 1);
            break;
        case '5d':
            startDate.setDate(endDate.getDate() - 5);
            break;
        case '1m':
            startDate.setMonth(endDate.getMonth() - 1);
            break;
        case '3m':
            startDate.setMonth(endDate.getMonth() - 3);
            break;
        case '1y':
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
        case '5y':
            startDate.setFullYear(endDate.getFullYear() - 5);
            break;
        default:
            startDate.setMonth(endDate.getMonth() - 1);
    }
    
    const start = formatDateForAPI(startDate);
    const end = formatDateForAPI(endDate);
    
    fetch(`https://api.stockdata.org/v1/data/eod?symbols=${currentStock}&date_from=${start}&date_to=${end}&sort=asc&api_key=${API_KEY_STOCKDATA}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('שגיאה בטעינת נתוני גרף');
            }
            return response.json();
        })
        .then(data => {
            if (data.data && data.data.length > 0) {
                updateChartData(data.data);
            } else {
                throw new Error('לא נמצאו נתוני גרף לטווח המבוקש');
            }
        })
        .catch(error => {
            console.error('שגיאה בעדכון טווח גרף:', error);
            showNotification(error.message, 'error');
        });
}

// פונקציית עדכון נתוני גרף
function updateChartData(data) {
    stockChart.data.labels = data.map(item => new Date(item.date).toLocaleDateString());
    stockChart.data.datasets[0].data = data.map(item => item.close);
    stockChart.update();
}

// פונקציית עדכון סוג גרף
function updateChartType(type) {
    if (!stockChart) return;
    
    let chartType = 'line';
    let tension = 0.2;
    
    switch (type) {
        case 'candle':
            // הערה: לגרף נרות נדרשים נתונים נוספים ושינוי מבנה הנתונים
            // כאן ניתן להוסיף לוגיקה להמרת הנתונים ויצירת גרף נרות
            showNotification('גרף נרות יתמך בקרוב', 'info');
            return;
        case 'ohlc':
            // הערה: לגרף OHLC נדרשים נתונים נוספים ושינוי מבנה הנתונים
            showNotification('גרף OHLC יתמך בקרוב', 'info');
            return;
        case 'line':
        default:
            chartType = 'line';
            tension = 0.2;
    }
    
    stockChart.config.type = chartType;
    stockChart.data.datasets[0].tension = tension;
    stockChart.update();
}

// פונקציית טעינת חדשות למניה (המשך)
function loadNewsForStock(symbol) {
    // איפוס לשוניות חדשות
    document.getElementById('news-all').innerHTML = '<p>טוען חדשות...</p>';
    document.getElementById('news-yahoo').innerHTML = '';
    document.getElementById('news-finnhub').innerHTML = '';
    document.getElementById('news-stockdata').innerHTML = '';
    
    // טעינת חדשות מ-Finnhub
    fetch(`https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${getDateBefore(30)}&to=${getToday()}&token=${API_KEY_FINNHUB}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('שגיאה בטעינת חדשות מ-Finnhub');
            }
            return response.json();
        })
        .then(data => {
            const finnhubNews = data.slice(0, 10); // מגביל ל-10 פריטים
            displayNews('news-finnhub', finnhubNews, 'finnhub');
            
            // טעינת חדשות מ-STOCKDATA אחרי שהסתיימה הטעינה מ-Finnhub
            return fetch(`https://api.stockdata.org/v1/news/all?symbols=${symbol}&filter_entities=true&language=en&api_key=${API_KEY_STOCKDATA}`);
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('שגיאה בטעינת חדשות מ-StockData');
            }
            return response.json();
        })
        .then(data => {
            const stockdataNews = data.data || [];
            displayNews('news-stockdata', stockdataNews, 'stockdata');
            
            // יצירת קומבינציה של כל החדשות
            combineAndDisplayAllNews();
        })
        .catch(error => {
            console.error('שגיאה בטעינת חדשות:', error);
            document.getElementById('news-all').innerHTML = '<p>שגיאה בטעינת חדשות</p>';
            document.getElementById('news-finnhub').innerHTML = '<p>שגיאה בטעינת חדשות</p>';
            document.getElementById('news-stockdata').innerHTML = '<p>שגיאה בטעינת חדשות</p>';
            document.getElementById('news-yahoo').innerHTML = '<p>חדשות מיאהו אינן זמינות כרגע</p>';
            showNotification(error.message, 'error');
        });
}

// פונקציית הצגת חדשות בלשונית
function displayNews(tabId, newsItems, source) {
    const tabElement = document.getElementById(tabId);
    tabElement.innerHTML = '';
    
    if (!newsItems || newsItems.length === 0) {
        tabElement.innerHTML = '<p>אין חדשות להצגה</p>';
        return;
    }
    
    newsItems.forEach(item => {
        const newsElement = document.createElement('div');
        newsElement.className = 'news-item';
        
        // התאמת שדות בהתאם למקור
        let title, url, date, sourceName;
        
        if (source === 'finnhub') {
            title = item.headline || 'אין כותרת';
            url = item.url || '#';
            date = new Date(item.datetime * 1000).toLocaleDateString();
            sourceName = item.source || 'Finnhub';
        } else if (source === 'stockdata') {
            title = item.title || 'אין כותרת';
            url = item.url || '#';
            date = new Date(item.published_at).toLocaleDateString();
            sourceName = item.source || 'StockData';
        } else {
            title = item.title || 'אין כותרת';
            url = item.url || '#';
            date = item.date || 'לא ידוע';
            sourceName = item.source || 'לא ידוע';
        }
        
        const titleElement = document.createElement('a');
        titleElement.className = 'news-title';
        titleElement.href = url;
        titleElement.target = '_blank';
        titleElement.textContent = title;
        
        const metaElement = document.createElement('div');
        metaElement.className = 'news-meta';
        
        const sourceElement = document.createElement('span');
        sourceElement.className = 'news-source';
        sourceElement.textContent = sourceName;
        
        const dateElement = document.createElement('span');
        dateElement.className = 'news-date';
        dateElement.textContent = date;
        
        metaElement.appendChild(sourceElement);
        metaElement.appendChild(dateElement);
        
        newsElement.appendChild(titleElement);
        newsElement.appendChild(metaElement);
        tabElement.appendChild(newsElement);
    });
}

// פונקציית שילוב כל החדשות בלשונית "הכל"
function combineAndDisplayAllNews() {
    const finnhubTab = document.getElementById('news-finnhub');
    const stockdataTab = document.getElementById('news-stockdata');
    const allTab = document.getElementById('news-all');
    
    // איסוף כל פריטי החדשות
    const newsItems = [];
    const finnhubItems = finnhubTab.querySelectorAll('.news-item');
    const stockdataItems = stockdataTab.querySelectorAll('.news-item');
    
    finnhubItems.forEach(item => {
        newsItems.push(item.cloneNode(true));
    });
    
    stockdataItems.forEach(item => {
        newsItems.push(item.cloneNode(true));
    });
    
    // בדיקה אם יש חדשות להצגה
    if (newsItems.length === 0) {
        allTab.innerHTML = '<p>אין חדשות להצגה</p>';
        return;
    }
    
    // מיון החדשות לפי תאריך (מהחדש לישן)
    newsItems.sort((a, b) => {
        const dateA = new Date(a.querySelector('.news-date').textContent);
        const dateB = new Date(b.querySelector('.news-date').textContent);
        return dateB - dateA;
    });
    
    // הצגת החדשות המשולבות
    allTab.innerHTML = '';
    newsItems.forEach(item => {
        allTab.appendChild(item);
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

// פונקציית החלפת לשונית סננים
function switchFilterTab(filter) {
    // הסרת מחלקת active מכל הלשוניות
    const allTabs = document.querySelectorAll('.filter-tab');
    allTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // הוספת מחלקת active ללשונית הנבחרת
    const tabId = filter + '-filter';
    document.getElementById(tabId).classList.add('active');
    
    // עדכון כפתורי הלשוניות
    const allButtons = document.querySelectorAll('.filters-tabs .tab-button');
    allButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-filter') === filter) {
            button.classList.add('active');
        }
    });
}

// פונקציית טעינת המלצות אלגוריתמיות
function loadRecommendations() {
    // טעינת המלצות בתקציב נמוך
    fetch(`https://api.stockdata.org/v1/data/quote?symbols=AMD,INTC,NVDA,MSFT,PLTR,IBM&api_key=${API_KEY_STOCKDATA}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('שגיאה בטעינת המלצות');
            }
            return response.json();
        })
        .then(data => {
            if (data.data && data.data.length > 0) {
                // מיון מניות לפי מחיר - מהנמוך לגבוה
                const lowBudgetStocks = data.data
                    .filter(stock => stock.price < 100) // מסנן לתקציב נמוך
                    .sort((a, b) => a.price - b.price);
                
                displayRecommendations('low-budget', lowBudgetStocks);
                
                // מיון מניות לפי מחיר - מהגבוה לנמוך
                const highBudgetStocks = data.data
                    .filter(stock => stock.price >= 100) // מסנן לתקציב גבוה
                    .sort((a, b) => b.price - a.price);
                
                displayRecommendations('high-budget', highBudgetStocks);
            } else {
                throw new Error('לא נמצאו המלצות');
            }
        })
        .catch(error => {
            console.error('שגיאה בטעינת המלצות:', error);
            document.getElementById('low-budget').innerHTML = '<p>שגיאה בטעינת המלצות</p>';
            document.getElementById('high-budget').innerHTML = '<p>שגיאה בטעינת המלצות</p>';
            showNotification(error.message, 'error');
        });
    
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
        
        const leftSection = document.createElement('div');
        leftSection.className = 'recommendation-left';
        
        const titleElement = document.createElement('div');
        titleElement.className = 'recommendation-title';
        titleElement.textContent = item.name || item.symbol;
        
        const infoElement = document.createElement('div');
        infoElement.className = 'recommendation-info';
        
        const valueElement = document.createElement('div');
        valueElement.className = 'recommendation-value';
        valueElement.textContent = `$${item.price?.toFixed(2) || '0.00'}`;
        
        const changeElement = document.createElement('div');
        changeElement.className = item.day_change > 0 ? 'recommendation-change positive' : item.day_change < 0 ? 'recommendation-change negative' : 'recommendation-change neutral';
        changeElement.textContent = `${item.day_change?.toFixed(2) || '0.00'} (${item.change_percent?.toFixed(2) || '0.00'}%)`;
        
        const dateElement = document.createElement('div');
        dateElement.className = 'recommendation-date';
        dateElement.textContent = new Date().toLocaleDateString();
        
        infoElement.appendChild(valueElement);
        infoElement.appendChild(changeElement);
        
        leftSection.appendChild(titleElement);
        leftSection.appendChild(infoElement);
        leftSection.appendChild(dateElement);
        
        const rightSection = document.createElement('div');
        rightSection.className = 'recommendation-right';
        
        // חישוב ציון אלגוריתמי למניה - לדוגמה על סמך מומנטום ומכפיל רווח
        const momentum = item.change_percent || 0;
        const pe = item.pe || 20;
        let score = calculateStockScore(momentum, pe);
        
        const scoreElement = document.createElement('div');
        scoreElement.className = 'recommendation-score';
        
        // הגדרת אייקון בהתאם לציון
        let icon = '';
        if (score >= 8) {
            icon = '<i class="fas fa-fire" style="color: var(--stock-superhot);"></i>';
            scoreElement.className += ' superhot';
        } else if (score >= 6) {
            icon = '<i class="fas fa-fire" style="color: var(--stock-fire);"></i>';
            scoreElement.className += ' fire';
        } else if (score >= 4) {
            icon = '<i class="fas fa-arrow-up" style="color: var(--stock-positive);"></i>';
            scoreElement.className += ' positive';
        } else {
            icon = '<i class="fas fa-arrow-right" style="color: var(--stock-neutral);"></i>';
            scoreElement.className += ' neutral';
        }
        
        scoreElement.innerHTML = `${score.toFixed(1)}/10 ${icon}`;
        
        const actionElement = document.createElement('div');
        actionElement.className = score >= 6 ? 'recommendation-action buy' : score <= 3 ? 'recommendation-action sell' : 'recommendation-action';
        actionElement.textContent = score >= 6 ? 'קניה' : score <= 3 ? 'מכירה' : 'המתנה';
        
        rightSection.appendChild(scoreElement);
        rightSection.appendChild(actionElement);
        
        recommendationElement.appendChild(leftSection);
        recommendationElement.appendChild(rightSection);
        
        // הוספת אירוע לחיצה לחיפוש המניה
        recommendationElement.addEventListener('click', function() {
            document.getElementById('stock-search').value = item.symbol;
            searchStock();
        });
        
        tabElement.appendChild(recommendationElement);
    });
}

// פונקציית חישוב ציון למניה
function calculateStockScore(momentum, pe) {
    // נוסחה לדוגמה לחישוב ציון
    // המשקל: 60% למומנטום, 40% למכפיל רווח
    
    // ציון מומנטום (0-10): חיובי = ציון גבוה, שלילי = ציון נמוך
    let momentumScore = 5; // ציון בסיס
    if (momentum > 0) {
        momentumScore += Math.min(momentum * 2, 5); // מקסימום 10
    } else {
        momentumScore += Math.max(momentum * 2, -5); // מינימום 0
    }
    
    // ציון מכפיל רווח (0-10): נמוך = ציון גבוה, גבוה = ציון נמוך
    let peScore;
    if (pe <= 0) {
        peScore = 0; // מכפיל רווח שלילי = ציון נמוך
    } else if (pe < 10) {
        peScore = 10; // מכפיל רווח מצוין
    } else if (pe < 15) {
        peScore = 8;
    } else if (pe < 20) {
        peScore = 6;
    } else if (pe < 25) {
        peScore = 4;
    } else if (pe < 30) {
        peScore = 2;
    } else {
        peScore = 1; // מכפיל רווח גבוה מאוד
    }
    
    // חישוב ציון משוקלל
    return momentumScore * 0.6 + peScore * 0.4;
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

// פונקציות סינון אלגוריתמיות
// 1. סנן מומנטום
function applyMomentumFilter() {
    const thresholdElement = document.getElementById('momentum-threshold');
    const timeframeElement = document.getElementById('momentum-timeframe');
    const profitTargetElement = document.getElementById('profit-target');
    
    const threshold = parseFloat(thresholdElement.value);
    const timeframe = parseInt(timeframeElement.value);
    const profitTarget = parseFloat(profitTargetElement.value);
    
    if (isNaN(threshold) || isNaN(timeframe) || isNaN(profitTarget)) {
        showNotification('אנא הזן ערכים תקינים', 'warning');
        return;
    }
    
    const resultsElement = document.getElementById('momentum-results');
    resultsElement.innerHTML = '<p>מחפש מניות עם מומנטום...</p>';
    
    // לוגיקת סינון מומנטום
    // לדוגמה: חיפוש מניות מ-S&P500 עם תנועה חיובית בשיעור מסוים בזמן מוגדר
    fetch(`https://api.stockdata.org/v1/data/quote?symbols=AAPL,MSFT,AMZN,GOOGL,META,NVDA,TSLA&api_key=${API_KEY_STOCKDATA}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('שגיאה בטעינת נתוני מניות');
            }
            return response.json();
        })
        .then(data => {
            if (data.data && data.data.length > 0) {
                // סינון מניות לפי קריטריון מומנטום
                const filteredStocks = data.data.filter(stock => {
                    // לדוגמה: מומנטום = אחוז שינוי יומי
                    const stockMomentum = stock.change_percent || 0;
                    return stockMomentum >= threshold;
                });
                
                displayFilterResults(resultsElement, filteredStocks, 'מומנטום', {
                    threshold,
                    timeframe,
                    profitTarget
                });
            } else {
                throw new Error('לא נמצאו נתונים לסינון');
            }
        })
        .catch(error => {
            console.error('שגיאה בהפעלת סנן מומנטום:', error);
            resultsElement.innerHTML = '<p>שגיאה בהפעלת הסנן</p>';
            showNotification(error.message, 'error');
        });
}

// 2. סנן ETF מינוף
function applyEtfLeverageFilter() {
    const sectorElement = document.getElementById('etf-sector');
    const mismatchThresholdElement = document.getElementById('mismatch-threshold');
    const directionElement = document.getElementById('etf-direction');
    
    const sector = sectorElement.value;
    const mismatchThreshold = parseFloat(mismatchThresholdElement.value);
    const direction = directionElement.value;
    
    if (isNaN(mismatchThreshold)) {
        showNotification('אנא הזן ערך תקין לסף אי התאמה', 'warning');
        return;
    }
    
    const resultsElement = document.getElementById('etf-results');
    resultsElement.innerHTML = '<p>מחפש אי התאמות ב-ETF...</p>';
    
    // יצירת רשימת סמלים לפי הסקטור הנבחר
    let symbols = [];
    if (sector === 'all') {
        // כל הסקטורים
        Object.values(etfMapping).forEach(mapping => {
            symbols.push(mapping.ticker, mapping.leverageBull, mapping.leverageBear);
        });
    } else if (etfMapping[sector]) {
        // סקטור ספציפי
        symbols.push(
            etfMapping[sector].ticker,
            etfMapping[sector].leverageBull,
            etfMapping[sector].leverageBear
        );
    } else {
        resultsElement.innerHTML = '<p>סקטור לא תקין</p>';
        return;
    }
    
    // הסרת סמלים כפולים
    symbols = [...new Set(symbols)];
    
    fetch(`https://api.stockdata.org/v1/data/quote?symbols=${symbols.join(',')}&api_key=${API_KEY_STOCKDATA}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('שגיאה בטעינת נתוני ETF');
            }
            return response.json();
        })
        .then(data => {
            if (data.data && data.data.length > 0) {
                // מציאת אי התאמות בין מדדים ל-ETF עם מינוף
                const opportunities = findEtfMismatchOpportunities(data.data, mismatchThreshold, direction);
                
                displayFilterResults(resultsElement, opportunities, 'ETF מינוף', {
                    sector: sector === 'all' ? 'כל הסקטורים' : sector,
                    mismatchThreshold,
                    direction: direction === 'both' ? 'שני הכיוונים' : direction === 'up' ? 'עלייה' : 'ירידה'
                });
            } else {
                throw new Error('לא נמצאו נתונים לסינון');
            }
        })
        .catch(error => {
            console.error('שגיאה בהפעלת סנן ETF מינוף:', error);
            resultsElement.innerHTML = '<p>שגיאה בהפעלת הסנן</p>';
            showNotification(error.message, 'error');
        });
}

// 3. סנן אינדיקטורים טכניים
function applyTechnicalFilter() {
    const indicatorElement = document.getElementById('technical-indicator');
    const conditionElement = document.getElementById('condition');
    const timeframeElement = document.getElementById('timeframe');
    
    const indicator = indicatorElement.value;
    const condition = conditionElement.value;
    const timeframe = timeframeElement.value;
    
    const resultsElement = document.getElementById('technical-results');
    resultsElement.innerHTML = '<p>מחפש מניות לפי אינדיקטורים טכניים...</p>';
    
    // לוגיקת סינון אינדיקטורים טכניים
    // לדוגמה: חיפוש מניות עם RSI מתחת ל-30 (oversold)
    if (indicator === 'rsi' && condition === 'oversold') {
        fetch(`https://api.stockdata.org/v1/data/quote?symbols=AAPL,MSFT,AMZN,GOOGL,META,NVDA,TSLA&api_key=${API_KEY_STOCKDATA}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('שגיאה בטעינת נתוני מניות');
                }
                return response.json();
            })
            .then(data => {
                if (data.data && data.data.length > 0) {
                    // סימולציה של חישוב RSI - במערכת אמיתית יש להשתמש ב-API שמספק נתוני RSI
                    const filteredStocks = data.data.filter(stock => {
                        // סימולציה - מניות שירדו יותר מ-2% ביום נחשבות כ-oversold
                        return stock.change_percent <= -2;
                    });
                    
                    displayFilterResults(resultsElement, filteredStocks, 'RSI', {
                        indicator,
                        condition,
                        timeframe
                    });
                } else {
                    throw new Error('לא נמצאו נתונים לסינון');
                }
            })
            .catch(error => {
                console.error('שגיאה בהפעלת סנן אינדיקטורים טכניים:', error);
                resultsElement.innerHTML = '<p>שגיאה בהפעלת הסנן</p>';
                showNotification(error.message, 'error');
            });
    } else {
        resultsElement.innerHTML = '<p>שילוב האינדיקטור והתנאי אינו נתמך עדיין</p>';
    }
}

// פונקציית מציאת אי התאמות בין מדדים ל-ETF עם מינוף
function findEtfMismatchOpportunities(stocks, threshold, direction) {
    const opportunities = [];
    
    // עבור על כל הסקטורים
    Object.entries(etfMapping).forEach(([sector, mapping]) => {
        // חיפוש המדד והETF המתאימים
        const baseIndex = stocks.find(stock => stock.symbol === mapping.ticker);
        const bullETF = stocks.find(stock => stock.symbol === mapping.leverageBull);
        const bearETF = stocks.find(stock => stock.symbol === mapping.leverageBear);
        
        if (baseIndex && bullETF && bearETF) {
            const baseChange = baseIndex.change_percent || 0;
            const bullChange = bullETF.change_percent || 0;
            const bearChange = bearETF.change_percent || 0;
            
            // אי התאמה חיובית (bullETF לא עולה מספיק)
            const bullMismatch = (baseChange > 0) && (bullChange < baseChange * 3 - threshold);
            
            // אי התאמה שלילית (bearETF לא עולה מספיק כאשר המדד יורד)
            const bearMismatch = (baseChange < 0) && (bearChange < Math.abs(baseChange) * 3 - threshold);
            
            if ((direction === 'up' || direction === 'both') && bullMismatch) {
                opportunities.push({
                    sector,
                    symbol: bullETF.symbol,
                    name: bullETF.name || bullETF.symbol,
                    price: bullETF.price,
                    change_percent: bullETF.change_percent,
                    base_symbol: baseIndex.symbol,
                    base_change: baseIndex.change_percent,
                    expected_change: baseIndex.change_percent * 3,
                    actual_change: bullETF.change_percent,
                    mismatch: (baseIndex.change_percent * 3 - bullETF.change_percent).toFixed(2),
                    direction: 'up'
                });
            }
            
            if ((direction === 'down' || direction === 'both') && bearMismatch) {
                opportunities.push({
                    sector,
                    symbol: bearETF.symbol,
                    name: bearETF.name || bearETF.symbol,
                    price: bearETF.price,
                    change_percent: bearETF.change_percent,
                    base_symbol: baseIndex.symbol,
                    base_change: baseIndex.change_percent,
                    expected_change: Math.abs(baseIndex.change_percent) * 3,
                    actual_change: bearETF.change_percent,
                    mismatch: (Math.abs(baseIndex.change_percent) * 3 - bearETF.change_percent).toFixed(2),
                    direction: 'down'
                });
            }
        }
    });
    
    return opportunities;
}

// פונקציית הצגת תוצאות סינון
function displayFilterResults(container, results, filterType, params) {
    container.innerHTML = '';
    
    if (results.length === 0) {
        container.innerHTML = `<p>לא נמצאו תוצאות לסנן ${filterType}</p>`;
        return;
    }
    
    // יצירת הסבר על הפרמטרים
    const paramsElement = document.createElement('div');
    paramsElement.className = 'filter-params-summary';
    
    let paramsHTML = '<span>פרמטרים: </span>';
    Object.entries(params).forEach(([key, value]) => {
        paramsHTML += `<span><strong>${key}:</strong> ${value}</span> `;
    });
    
    paramsElement.innerHTML = paramsHTML;
    container.appendChild(paramsElement);
    
    // יצירת רשימת תוצאות
    const resultsElement = document.createElement('div');
    resultsElement.className = 'filter-results-list';
    
    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'filter-result-item';
        
        // התאמת התצוגה לסוג הסנן
        switch (filterType) {
            case 'מומנטום':
                resultItem.innerHTML = `
                    <div class="result-title">${result.name || result.symbol}</div>
                    <div class="result-value">מחיר: $${result.price?.toFixed(2) || '0.00'}</div>
                    <div class="result-momentum ${result.change_percent >= 0 ? 'positive' : 'negative'}">
                        מומנטום: ${result.change_percent?.toFixed(2) || '0.00'}%
                    </div>
                    <div class="result-target">יעד רווח: $${(result.price * (1 + params.profitTarget / 100)).toFixed(2)}</div>
                    <button class="result-action-button" data-symbol="${result.symbol}">חפש מניה</button>
                `;
                break;
                
            case 'ETF מינוף':
                resultItem.innerHTML = `
                    <div class="result-title">${result.name} (${result.symbol})</div>
                    <div class="result-value">מחיר: $${result.price?.toFixed(2) || '0.00'}</div>
                    <div class="result-details">
                        <div>מדד בסיס (${result.base_symbol}): ${result.base_change?.toFixed(2) || '0.00'}%</div>
                        <div>שינוי צפוי: ${result.expected_change?.toFixed(2) || '0.00'}%</div>
                        <div>שינוי בפועל: ${result.actual_change?.toFixed(2) || '0.00'}%</div>
                        <div class="result-mismatch">פער: ${result.mismatch}%</div>
                    </div>
                    <div class="result-direction ${result.direction === 'up' ? 'positive' : 'negative'}">
                        כיוון: ${result.direction === 'up' ? 'עלייה' : 'ירידה'}
                    </div>
                    <button class="result-action-button" data-symbol="${result.symbol}">חפש מניה</button>
                `;
                break;
                
            case 'RSI':
                resultItem.innerHTML = `
                    <div class="result-title">${result.name || result.symbol}</div>
                    <div class="result-value">מחיר: $${result.price?.toFixed(2) || '0.00'}</div>
                    <div class="result-rsi negative">
                        RSI: נמוך (Oversold)
                    </div>
                    <div class="result-change ${result.change_percent >= 0 ? 'positive' : 'negative'}">
                        שינוי יומי: ${result.change_percent?.toFixed(2) || '0.00'}%
                    </div>
                    <button class="result-action-button" data-symbol="${result.symbol}">חפש מניה</button>
                `;
                break;
                
            default:
                resultItem.innerHTML = `
                    <div class="result-title">${result.name || result.symbol}</div>
                    <div class="result-value">מחיר: $${result.price?.toFixed(2) || '0.00'}</div>
                    <button class="result-action-button" data-symbol="${result.symbol}">חפש מניה</button>
                `;
        }
        
        resultsElement.appendChild(resultItem);
    });
    
    container.appendChild(resultsElement);
    
    // הוספת אירועי לחיצה לכפתורי פעולה
    const actionButtons = container.querySelectorAll('.result-action-button');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const symbol = this.getAttribute('data-symbol');
            document.getElementById('stock-search').value = symbol;
            searchStock();
        });
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
    document.getElementById('stock-volume').textContent = '0';
    document.getElementById('stock-turnover').textContent = '$0';
    document.getElementById('stock-market-cap').textContent = '$0';
    document.getElementById('stock-pe').textContent = '0';
    document.getElementById('stock-chart').innerHTML = '';
    
    // איפוס לשוניות חדשות
    document.getElementById('news-all').innerHTML = '<p>טוען חדשות...</p>';
    document.getElementById('news-yahoo').innerHTML = '';
    document.getElementById('news-finnhub').innerHTML = '';
    document.getElementById('news-stockdata').innerHTML = '';
}

// פונקציות עזר

// פורמט מספרים גדולים
function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

// פורמט שווי שוק
function formatMarketCap(num) {
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

// הצגת הודעה למשתמש
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

// הפעלת כפתור
function setActiveButton(buttons, activeButton) {
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    activeButton.classList.add('active');
}

// פונקציות תאריך

// קבלת תאריך היום בפורמט YYYY-MM-DD
function getToday() {
    const today = new Date();
    return formatDateForAPI(today);
}

// קבלת תאריך לפני X ימים בפורמט YYYY-MM-DD
function getDateBefore(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return formatDateForAPI(date);
}

// פורמט תאריך ל-API
function formatDateForAPI(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}