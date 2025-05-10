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

    // שימוש ב-stockApi לחיפוש אינדיקטורים טכניים
    StockAPI.findTechnicalIndicatorStocks(indicator, condition, timeframe)
    .then(stocks => {
        displayFilterResults(resultsElement, stocks, indicator.toUpperCase(), {
            indicator,
            condition,
            timeframe
        });
    })
    .catch(error => {
        console.error('שגיאה בהפעלת סנן אינדיקטורים טכניים:', error);
        resultsElement.innerHTML = '<p>שגיאה בהפעלת הסנן</p>';
        showNotification(error.message, 'error');
    });
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
                    <div class="result-value">מחיר: ${result.price?.toFixed(2) || '0.00'}</div>
                    <div class="result-momentum ${result.change_percent >= 0 ? 'positive' : 'negative'}">
                        מומנטום: ${result.change_percent?.toFixed(2) || '0.00'}%
                    </div>
                    <div class="result-target">יעד רווח: ${result.target_price || (result.price * (1 + params.profitTarget / 100)).toFixed(2)}</div>
                    <button class="result-action-button" data-symbol="${result.symbol}">חפש מניה</button>
                `;
                break;
                
            case 'ETF מינוף':
                resultItem.innerHTML = `
                    <div class="result-title">${result.name} (${result.symbol})</div>
                    <div class="result-value">מחיר: ${result.price?.toFixed(2) || '0.00'}</div>
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
            case 'MACD':
            case 'MOVING_AVG':
                resultItem.innerHTML = `
                    <div class="result-title">${result.name || result.symbol}</div>
                    <div class="result-value">מחיר: ${result.price?.toFixed(2) || '0.00'}</div>
                    <div class="result-indicator ${result.indicator_value < 30 ? 'negative' : result.indicator_value > 70 ? 'positive' : 'neutral'}">
                        ${result.indicator_text}
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
                    <div class="result-value">מחיר: ${result.price?.toFixed(2) || '0.00'}</div>
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

// פונקציית הפעלת כפתור
function setActiveButton(buttons, activeButton) {
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    activeButton.classList.add('active');
}// back.js - קובץ ראשי לניהול אינטראקציות באתר

// משתנים גלובליים
let currentStock = null;
let stockChart = null;

// פונקציית אתחול
document.addEventListener('DOMContentLoaded', function() {
    console.log('האתר נטען בהצלחה');

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

    // הגדרת אפקט גלילה חלקה לקישורים באזור "בואו לחקור עוד"
    const exploreSection = document.querySelector('.explore-section');
    if (exploreSection) {
        exploreSection.addEventListener('mouseover', function() {
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
    }

    // טעינת המלצות ראשונית
    loadRecommendations();

    // עדכון זמן עדכון אחרון
    updateLastUpdateTime();
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

// פונקציית טעינת נתוני מניה - משתמשת ב-stockApi
function loadStockData(symbol) {
    // הצגת מחוון טעינה
    document.getElementById('stock-name').textContent = 'טוען...';

    // שימוש ב-stockApi לקבלת נתוני המניה
    StockAPI.getStockData(symbol)
    .then(stockData => {
        // עדכון פרטי המניה בממשק
        updateStockInfo(stockData);
        
        // טעינת גרף היסטורי
        return StockAPI.getStockHistory(stockData.symbol, '1m');
    })
    .then(historyData => {
        // יצירת גרף מניה
        createStockChart(historyData);
    })
    .catch(error => {
        console.error('שגיאה בטעינת נתוני המניה:', error);
        document.getElementById('stock-name').textContent = 'שגיאה בטעינת נתוני המניה';
        showNotification(error.message, 'error');
    });
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

    // הצגת מחוון טעינה
    const chartContainer = document.getElementById('stock-chart-container');
    const originalContent = chartContainer.innerHTML;
    chartContainer.innerHTML = '<div class="loading-indicator">טוען נתונים...</div>';

    // שימוש ב-stockApi לקבלת נתוני היסטוריה
    StockAPI.getStockHistory(currentStock, range)
    .then(data => {
        // עדכון נתוני הגרף
        updateChartData(data);
        
        // שחזור תוכן המקורי
        if (chartContainer.querySelector('.loading-indicator')) {
            chartContainer.innerHTML = originalContent;
        }
    })
    .catch(error => {
        console.error('שגיאה בעדכון טווח גרף:', error);
        chartContainer.innerHTML = originalContent;
        showNotification(error.message, 'error');
    });
}

// פונקציית עדכון נתוני גרף
function updateChartData(data) {
    if (!stockChart) return;

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

// פונקציית טעינת חדשות למניה
function loadNewsForStock(symbol) {
    // איפוס לשוניות חדשות
    document.getElementById('news-all').innerHTML = '<p>טוען חדשות...</p>';
    document.getElementById('news-yahoo').innerHTML = '';
    document.getElementById('news-finnhub').innerHTML = '';
    document.getElementById('news-stockdata').innerHTML = '';

    // שימוש ב-stockApi לקבלת חדשות
    StockAPI.getStockNews(symbol)
    .then(newsData => {
        // הצגת חדשות בלשוניות השונות
        displayNews('news-finnhub', newsData.finnhub, 'finnhub');
        displayNews('news-stockdata', newsData.stockdata, 'stockdata');
        displayNews('news-yahoo', [], 'yahoo'); // כרגע אין מקור נתונים מיאהו
        
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
    // הצגת מחוון טעינה
    document.getElementById('low-budget').innerHTML = '<p>טוען המלצות...</p>';
    document.getElementById('high-budget').innerHTML = '<p>טוען המלצות...</p>';

    // טעינת המלצות בתקציב נמוך
    StockAPI.getRecommendations('low')
    .then(lowBudgetRecommendations => {
        displayRecommendations('low-budget', lowBudgetRecommendations);
        
        // טעינת המלצות בתקציב גבוה
        return StockAPI.getRecommendations('high');
    })
    .then(highBudgetRecommendations => {
        displayRecommendations('high-budget', highBudgetRecommendations);
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

        const scoreElement = document.createElement('div');
        scoreElement.className = 'recommendation-score';

        // הגדרת אייקון בהתאם לציון
        let icon = '';
        if (item.score >= 8) {
            icon = '<i class="fas fa-fire" style="color: var(--stock-superhot);"></i>';
            scoreElement.className += ' superhot';
        } else if (item.score >= 6) {
            icon = '<i class="fas fa-fire" style="color: var(--stock-fire);"></i>';
            scoreElement.className += ' fire';
        } else if (item.score >= 4) {
            icon = '<i class="fas fa-arrow-up" style="color: var(--stock-positive);"></i>';
            scoreElement.className += ' positive';
        } else {
            icon = '<i class="fas fa-arrow-right" style="color: var(--stock-neutral);"></i>';
            scoreElement.className += ' neutral';
        }

        scoreElement.innerHTML = `${item.score.toFixed(1)}/10 ${icon}`;

        const actionElement = document.createElement('div');
        actionElement.className = item.score >= 6 ? 'recommendation-action buy' : item.score <= 3 ? 'recommendation-action sell' : 'recommendation-action';
        actionElement.textContent = item.recommendation || (item.score >= 6 ? 'קניה' : item.score <= 3 ? 'מכירה' : 'המתנה');

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

    // שימוש ב-stockApi לחיפוש מניות עם מומנטום
    StockAPI.findMomentumStocks(threshold, timeframe, profitTarget)
    .then(stocks => {
        displayFilterResults(resultsElement, stocks, 'מומנטום', {
            threshold,
            timeframe,
            profitTarget
        });
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

    // שימוש ב-stockApi למציאת הזדמנויות ETF
    StockAPI.findEtfOpportunities(sector, mismatchThreshold, direction)
    .then(opportunities => {
        displayFilterResults(resultsElement, opportunities, 'ETF מינוף', {
            sector: sector === 'all' ? 'כל הסקטורים' : sector,
            mismatchThreshold,
            direction: direction === 'both' ? 'שני הכיוונים' : direction === 'up' ? 'עלייה' : 'ירידה'
        });
    })
    .catch(error => {
        console.error('שגיאה בהפעלת סנן ETF מינוף:', error);
        resultsElement.innerHTML = '<p>שגיאה בהפעלת הסנן</p>';
        showNotification(error.message, 'error');
    });
}