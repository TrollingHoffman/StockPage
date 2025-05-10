// stockApi.js - מודול לניהול קריאות API ונתוני מניות

// מפתחות API
const API_KEYS = {
    FINNHUB: 'd0eerv1r01qkbclau660d0eerv1r01qkbclau66g',
    STOCKDATA: 'lNzHKanOvI3TcSInUsknlajmAfC9OPdaH2ivMWAn',
};

// קטגוריות מניות וקרנות סל
const CATEGORIES = {
    // סקטורים וקרנות סל
    ETF: {
        gold: {
            ticker: 'CG=F',
            leverageBull: 'GDXU',
            leverageBear: 'GDXD',
            description: 'זהב'
        },
        oil: {
            ticker: 'CL=F',
            leverageBull: 'UCO',
            leverageBear: 'SCO',
            description: 'נפט'
        },
        gas: {
            ticker: 'NG=F',
            leverageBull: 'BOIL',
            leverageBear: 'KOLD',
            description: 'גז טבעי'
        },
        semiconductor: {
            ticker: 'SOX=F',
            leverageBull: 'SOXL',
            leverageBear: 'SOXS',
            description: 'מוליכים למחצה'
        },
        nasdaq: {
            ticker: '^IXIC',
            leverageBull: 'TQQQ',
            leverageBear: 'SQQQ',
            description: 'נאסדק'
        },
        sp500: {
            ticker: '^GSPC',
            leverageBull: 'SPXL',
            leverageBear: 'SPXS',
            description: 'S&P 500'
        }
    },
    
    // מניות פופולריות לפי קטגוריות
    POPULAR_STOCKS: {
        tech: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA'],
        finance: ['JPM', 'BAC', 'WFC', 'C', 'GS'],
        pharma: ['PFE', 'JNJ', 'MRK', 'ABBV', 'BMY'],
        retail: ['WMT', 'TGT', 'COST', 'HD', 'AMZN'],
        israel: ['TEVA', 'NICE', 'CHKP', 'TSEM', 'DOX']
    },
    
    // מיפוי שמות בעברית לסמלי מניות
    HEBREW_TO_SYMBOL: {
        'אפל': 'AAPL',
        'מייקרוסופט': 'MSFT',
        'גוגל': 'GOOGL',
        'אמזון': 'AMZN',
        'פייסבוק': 'META',
        'מטא': 'META',
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
    }
};

// משתני מצב ומטמון
let cache = {
    stockData: {},         // מטמון נתוני מניות
    hotStocks: [],         // מניות חמות
    etfOpportunities: [],  // הזדמנויות מסחר ב-ETF
    lastUpdate: null       // זמן עדכון אחרון
};

/**
 * פונקציה לתיקון סמל מניה - מעברית לאנגלית או תיקון סמלים נפוצים
 * @param {string} symbol - סמל או שם מניה
 * @returns {string} - הסמל המתוקן
 */
function normalizeSymbol(symbol) {
    if (!symbol) return '';
    
    const normalizedSymbol = symbol.trim();
    
    // בדיקה אם זה שם בעברית
    if (CATEGORIES.HEBREW_TO_SYMBOL[normalizedSymbol.toLowerCase()]) {
        return CATEGORIES.HEBREW_TO_SYMBOL[normalizedSymbol.toLowerCase()];
    }
    
    return normalizedSymbol.toUpperCase();
}

/**
 * בדיקה אם הנתונים במטמון תקפים (פחות מ-5 דקות)
 * @param {number} timestamp - חותמת זמן לבדיקה
 * @returns {boolean} - האם הנתונים תקפים
 */
function isDataValid(timestamp) {
    if (!timestamp) return false;
    
    const now = Date.now();
    const fiveMinutesInMs = 5 * 60 * 1000;
    
    return (now - timestamp) < fiveMinutesInMs;
}

/**
 * קבלת נתוני מניה מה-API
 * @param {string} symbol - סמל המניה
 * @returns {Promise<Object>} - הבטחה עם נתוני המניה
 */
async function getStockData(symbol) {
    try {
        const normalizedSymbol = normalizeSymbol(symbol);
        
        // בדיקה אם יש נתונים במטמון
        if (cache.stockData[normalizedSymbol] && isDataValid(cache.stockData[normalizedSymbol].timestamp)) {
            console.log(`מחזיר נתוני מניה מהמטמון: ${normalizedSymbol}`);
            return cache.stockData[normalizedSymbol].data;
        }
        
        console.log(`מבצע קריאת API עבור מניה: ${normalizedSymbol}`);
        
        // קריאה ל-API
        const response = await fetch(`https://api.stockdata.org/v1/data/quote?symbols=${normalizedSymbol}&api_key=${API_KEYS.STOCKDATA}`);
        
        if (!response.ok) {
            throw new Error(`שגיאת API: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            // ננסה לחפש את המניה לפי שם
            return await searchStockByName(symbol);
        }
        
        // שמירה במטמון
        cache.stockData[normalizedSymbol] = {
            data: data.data[0],
            timestamp: Date.now()
        };
        
        return data.data[0];
    } catch (error) {
        console.error(`שגיאה בקבלת נתוני מניה ${symbol}:`, error);
        throw error;
    }
}

/**
 * חיפוש מניה לפי שם
 * @param {string} searchTerm - מונח חיפוש
 * @returns {Promise<Object>} - הבטחה עם נתוני המניה
 */
async function searchStockByName(searchTerm) {
    try {
        console.log(`מחפש מניה לפי שם: ${searchTerm}`);
        
        const response = await fetch(`https://api.stockdata.org/v1/entity/search?search=${encodeURIComponent(searchTerm)}&api_key=${API_KEYS.STOCKDATA}`);
        
        if (!response.ok) {
            throw new Error(`שגיאת API בחיפוש: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            throw new Error(`לא נמצאו תוצאות עבור החיפוש: ${searchTerm}`);
        }
        
        // מצאנו תוצאה, נקבל מידע מלא על המניה
        const foundSymbol = data.data[0].ticker;
        console.log(`נמצא סמל: ${foundSymbol} עבור החיפוש: ${searchTerm}`);
        
        // קריאה נוספת לקבלת מידע מלא
        const stockResponse = await fetch(`https://api.stockdata.org/v1/data/quote?symbols=${foundSymbol}&api_key=${API_KEYS.STOCKDATA}`);
        
        if (!stockResponse.ok) {
            throw new Error(`שגיאת API בקבלת נתוני מניה: ${stockResponse.status}`);
        }
        
        const stockData = await stockResponse.json();
        
        if (!stockData.data || stockData.data.length === 0) {
            throw new Error(`לא נמצאו נתונים עבור הסמל: ${foundSymbol}`);
        }
        
        // שמירה במטמון
        cache.stockData[foundSymbol] = {
            data: stockData.data[0],
            timestamp: Date.now()
        };
        
        return stockData.data[0];
    } catch (error) {
        console.error(`שגיאה בחיפוש מניה לפי שם:`, error);
        throw error;
    }
}

/**
 * קבלת נתוני גרף היסטוריים למניה
 * @param {string} symbol - סמל המניה
 * @param {string} range - טווח הזמן (1d, 5d, 1m, 3m, 1y, 5y)
 * @returns {Promise<Array>} - הבטחה עם נתוני היסטוריה
 */
async function getStockHistory(symbol, range = '1m') {
    try {
        const normalizedSymbol = normalizeSymbol(symbol);
        
        // חישוב תאריכי התחלה וסיום
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
        
        // פורמט תאריכים
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        const start = formatDate(startDate);
        const end = formatDate(endDate);
        
        console.log(`מבקש נתוני היסטוריה עבור ${normalizedSymbol} מתאריך ${start} עד ${end}`);
        
        // קריאה ל-API
        const response = await fetch(`https://api.stockdata.org/v1/data/eod?symbols=${normalizedSymbol}&date_from=${start}&date_to=${end}&sort=asc&api_key=${API_KEYS.STOCKDATA}`);
        
        if (!response.ok) {
            throw new Error(`שגיאת API בקבלת נתוני היסטוריה: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            throw new Error(`לא נמצאו נתוני היסטוריה עבור ${normalizedSymbol}`);
        }
        
        return data.data;
    } catch (error) {
        console.error(`שגיאה בקבלת נתוני היסטוריה:`, error);
        throw error;
    }
}

/**
 * קבלת חדשות עבור מניה
 * @param {string} symbol - סמל המניה
 * @returns {Promise<Object>} - הבטחה עם חדשות ממקורות שונים
 */
async function getStockNews(symbol) {
    try {
        const normalizedSymbol = normalizeSymbol(symbol);
        
        const result = {
            finnhub: [],
            stockdata: []
        };
        
        // קבל תאריכים לחיפוש
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);  // 30 ימים אחורה
        
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        // קבלת חדשות מ-Finnhub
        try {
            const finnhubResponse = await fetch(`https://finnhub.io/api/v1/company-news?symbol=${normalizedSymbol}&from=${formatDate(startDate)}&to=${formatDate(endDate)}&token=${API_KEYS.FINNHUB}`);
            
            if (finnhubResponse.ok) {
                const finnhubData = await finnhubResponse.json();
                
                if (Array.isArray(finnhubData)) {
                    // מגביל ל-10 פריטים
                    result.finnhub = finnhubData.slice(0, 10);
                }
            }
        } catch (finnhubError) {
            console.error('שגיאה בקבלת חדשות מ-Finnhub:', finnhubError);
        }
        
        // קבלת חדשות מ-StockData
        try {
            const stockdataResponse = await fetch(`https://api.stockdata.org/v1/news/all?symbols=${normalizedSymbol}&filter_entities=true&language=en&api_key=${API_KEYS.STOCKDATA}`);
            
            if (stockdataResponse.ok) {
                const stockdataData = await stockdataResponse.json();
                
                if (stockdataData.data && Array.isArray(stockdataData.data)) {
                    // מגביל ל-10 פריטים
                    result.stockdata = stockdataData.data.slice(0, 10);
                }
            }
        } catch (stockdataError) {
            console.error('שגיאה בקבלת חדשות מ-StockData:', stockdataError);
        }
        
        return result;
    } catch (error) {
        console.error(`שגיאה בקבלת חדשות למניה:`, error);
        throw error;
    }
}

/**
 * קבלת המלצות אלגוריתמיות לפי תקציב
 * @param {string} budget - 'low' או 'high'
 * @returns {Promise<Array>} - הבטחה עם רשימת המלצות
 */
async function getRecommendations(budget = 'low') {
    try {
        // רשימת מניות לבדיקה
        const techStocks = CATEGORIES.POPULAR_STOCKS.tech.join(',');
        const israelStocks = CATEGORIES.POPULAR_STOCKS.israel.join(',');
        
        // קבלת מידע על המניות
        const response = await fetch(`https://api.stockdata.org/v1/data/quote?symbols=${techStocks},${israelStocks}&api_key=${API_KEYS.STOCKDATA}`);
        
        if (!response.ok) {
            throw new Error(`שגיאת API בקבלת המלצות: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            throw new Error('לא נמצאו נתונים למניות המבוקשות');
        }
        
        // סינון לפי תקציב
        let filteredStocks;
        
        if (budget === 'low') {
            // מניות במחיר נמוך מ-100$
            filteredStocks = data.data.filter(stock => stock.price < 100).sort((a, b) => a.price - b.price);
        } else {
            // מניות במחיר 100$ ומעלה
            filteredStocks = data.data.filter(stock => stock.price >= 100).sort((a, b) => b.price - a.price);
        }
        
        // הוספת ציון אלגוריתמי
        return filteredStocks.map(stock => {
            // חישוב ציון לפי מומנטום ומכפיל רווח
            const momentum = stock.change_percent || 0;
            const pe = stock.pe || 20;
            const score = calculateStockScore(momentum, pe);
            
            return {
                ...stock,
                score,
                recommendation: score >= 6 ? 'קניה' : score <= 3 ? 'מכירה' : 'המתנה'
            };
        });
    } catch (error) {
        console.error(`שגיאה בקבלת המלצות:`, error);
        throw error;
    }
}

/**
 * מציאת הזדמנויות מסחר ב-ETF ממונפים
 * @param {string} sector - סקטור (או 'all' לכל הסקטורים)
 * @param {number} mismatchThreshold - סף אי התאמה באחוזים
 * @param {string} direction - כיוון ('up', 'down', או 'both')
 * @returns {Promise<Array>} - הבטחה עם רשימת הזדמנויות
 */
async function findEtfOpportunities(sector = 'all', mismatchThreshold = 1.0, direction = 'both') {
    try {
        // בניית רשימת סמלים לבדיקה
        let symbols = [];
        
        if (sector === 'all') {
            // כל הסקטורים
            Object.values(CATEGORIES.ETF).forEach(mapping => {
                symbols.push(mapping.ticker, mapping.leverageBull, mapping.leverageBear);
            });
        } else if (CATEGORIES.ETF[sector]) {
            // סקטור ספציפי
            symbols.push(
                CATEGORIES.ETF[sector].ticker,
                CATEGORIES.ETF[sector].leverageBull,
                CATEGORIES.ETF[sector].leverageBear
            );
        } else {
            throw new Error(`סקטור לא חוקי: ${sector}`);
        }
        
        // הסרת כפילויות
        symbols = [...new Set(symbols)];
        
        // קבלת נתוני מחירים עדכניים
        const response = await fetch(`https://api.stockdata.org/v1/data/quote?symbols=${symbols.join(',')}&api_key=${API_KEYS.STOCKDATA}`);
        
        if (!response.ok) {
            throw new Error(`שגיאת API בקבלת נתוני ETF: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            throw new Error('לא נמצאו נתונים ל-ETF');
        }
        
        // מציאת אי התאמות
        const opportunities = [];
        
        // עבור על כל הסקטורים הרלוונטיים
        Object.entries(CATEGORIES.ETF).forEach(([sectorKey, mapping]) => {
            if (sector !== 'all' && sectorKey !== sector) return;
            
            // חיפוש המדד והETF המתאימים
            const baseIndex = data.data.find(stock => stock.symbol === mapping.ticker);
            const bullETF = data.data.find(stock => stock.symbol === mapping.leverageBull);
            const bearETF = data.data.find(stock => stock.symbol === mapping.leverageBear);
            
            if (baseIndex && bullETF && bearETF) {
                const baseChange = baseIndex.change_percent || 0;
                const bullChange = bullETF.change_percent || 0;
                const bearChange = bearETF.change_percent || 0;
                
                // בדיקת הזדמנויות לעלייה - כאשר ה-ETF עם מינוף חיובי לא עלה מספיק
                const bullMismatch = (baseChange > 0) && (bullChange < baseChange * 3 - mismatchThreshold);
                
                // בדיקת הזדמנויות לירידה - כאשר ה-ETF עם מינוף שלילי לא עלה מספיק כשהמדד יורד
                const bearMismatch = (baseChange < 0) && (bearChange < Math.abs(baseChange) * 3 - mismatchThreshold);
                
                // הוספת הזדמנויות בהתאם לכיוון המבוקש
                if ((direction === 'up' || direction === 'both') && bullMismatch) {
                    opportunities.push({
                        sector: sectorKey,
                        sectorName: mapping.description,
                        symbol: bullETF.symbol,
                        name: bullETF.name || bullETF.symbol,
                        price: bullETF.price,
                        change_percent: bullETF.change_percent,
                        base_symbol: baseIndex.symbol,
                        base_change: baseIndex.change_percent,
                        expected_change: baseIndex.change_percent * 3,
                        actual_change: bullETF.change_percent,
                        mismatch: (baseIndex.change_percent * 3 - bullETF.change_percent).toFixed(2),
                        direction: 'up',
                        score: calculateOpportunityScore(baseIndex.change_percent * 3, bullETF.change_percent)
                    });
                }
                
                if ((direction === 'down' || direction === 'both') && bearMismatch) {
                    opportunities.push({
                        sector: sectorKey,
                        sectorName: mapping.description,
                        symbol: bearETF.symbol,
                        name: bearETF.name || bearETF.symbol,
                        price: bearETF.price,
                        change_percent: bearETF.change_percent,
                        base_symbol: baseIndex.symbol,
                        base_change: baseIndex.change_percent,
                        expected_change: Math.abs(baseIndex.change_percent) * 3,
                        actual_change: bearETF.change_percent,
                        mismatch: (Math.abs(baseIndex.change_percent) * 3 - bearETF.change_percent).toFixed(2),
                        direction: 'down',
                        score: calculateOpportunityScore(Math.abs(baseIndex.change_percent) * 3, bearETF.change_percent)
                    });
                }
            }
        });
        
        // מיון הזדמנויות לפי גודל אי ההתאמה (מהגדול לקטן)
        return opportunities.sort((a, b) => b.score - a.score);
    } catch (error) {
        console.error(`שגיאה במציאת הזדמנויות ETF:`, error);
        throw error;
    }
}

/**
 * חיפוש מניות עם מומנטום
 * @param {number} threshold - סף מומנטום באחוזים
 * @param {number} timeframe - תקופת זמן בימים
 * @param {number} profitTarget - יעד רווח באחוזים
 * @returns {Promise<Array>} - הבטחה עם רשימת מניות
 */
async function findMomentumStocks(threshold = 1.5, timeframe = 5, profitTarget = 2.0) {
    try {
        // נבדוק מניות פופולריות
        const allStocks = [
            ...CATEGORIES.POPULAR_STOCKS.tech,
            ...CATEGORIES.POPULAR_STOCKS.finance,
            ...CATEGORIES.POPULAR_STOCKS.pharma,
            ...CATEGORIES.POPULAR_STOCKS.retail,
            ...CATEGORIES.POPULAR_STOCKS.israel
        ];
        
        // הסרת כפילויות
        const uniqueStocks = [...new Set(allStocks)];
        
        // קבלת מידע על המניות
        const response = await fetch(`https://api.stockdata.org/v1/data/quote?symbols=${uniqueStocks.join(',')}&api_key=${API_KEYS.STOCKDATA}`);
        
        if (!response.ok) {
            throw new Error(`שגיאת API בחיפוש מומנטום: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            throw new Error('לא נמצאו נתונים למניות המבוקשות');
        }
        
        // סינון מניות לפי מומנטום
        const momentumStocks = data.data.filter(stock => {
            const stockMomentum = stock.change_percent || 0;
            return stockMomentum >= threshold;
        });
        
        // הוספת מידע נוסף
        return momentumStocks.map(stock => {
            const targetPrice = stock.price * (1 + profitTarget / 100);
            
            return {
                ...stock,
                momentum: stock.change_percent,
                target_price: targetPrice.toFixed(2),
                profit_target: profitTarget,
                score: calculateMomentumScore(stock.change_percent, threshold)
            };
        }).sort((a, b) => b.momentum - a.momentum);
    } catch (error) {
        console.error(`שגיאה בחיפוש מניות מומנטום:`, error);
        throw error;
    }
}

/**
 * חיפוש מניות לפי אינדיקטורים טכניים
 * @param {string} indicator - סוג האינדיקטור ('rsi', 'macd', 'moving_avg')
 * @param {string} condition - תנאי ('oversold', 'overbought', 'crossing')
 * @param {string} timeframe - מסגרת זמן ('daily', 'weekly', 'monthly')
 * @returns {Promise<Array>} - הבטחה עם רשימת מניות
 */
async function findTechnicalIndicatorStocks(indicator = 'rsi', condition = 'oversold', timeframe = 'daily') {
    try {
        // סימולציה של אינדיקטורים טכניים (במערכת אמיתית יהיה חיבור ל-API שמספק אינדיקטורים)
        // בדוגמה זו, אנחנו פשוט משתמשים בנתוני שינוי יומי כסימולציה
        
        // נבדוק מניות פופולריות
        const popularStocks = [
            ...CATEGORIES.POPULAR_STOCKS.tech,
            ...CATEGORIES.POPULAR_STOCKS.finance
        ];
        
        // קבלת נתוני מניות
        const response = await fetch(`https://api.stockdata.org/v1/data/quote?symbols=${popularStocks.join(',')}&api_key=${API_KEYS.STOCKDATA}`);
        
        if (!response.ok) {
            throw new Error(`שגיאת API בחיפוש אינדיקטורים טכניים: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            throw new Error('לא נמצאו נתונים למניות המבוקשות');
        }
        
        // סימולציה של סינון לפי אינדיקטורים
        let filteredStocks = [];
        
        if (indicator === 'rsi') {
            if (condition === 'oversold') {
                // בסימולציה, נחשיב מניות שירדו ביותר מ-2% כ-oversold
                filteredStocks = data.data.filter(stock => (stock.change_percent || 0) <= -2);
            } else if (condition === 'overbought') {
                // בסימולציה, נחשיב מניות שעלו ביותר מ-3% כ-overbought
                filteredStocks = data.data.filter(stock => (stock.change_percent || 0) >= 3);
            }
        } else if (indicator === 'macd') {
            // סימולציה פשוטה - מניות עם שינוי בין -1% ל-1% כאילו באיזור של חציית קווים
            if (condition === 'crossing') {
                filteredStocks = data.data.filter(stock => {
                    const change = stock.change_percent || 0;
                    return change > -1 && change < 1;
                });
            }
        } else if (indicator === 'moving_avg') {
            // סימולציה פשוטה - מניות שמחירן בין -5% ל+5% מהממוצע שלהן (לא אמיתי, רק להדגמה)
            filteredStocks = data.data.filter(stock => {
                const change = stock.change_percent || 0;
                return change > -5 && change < 5;
            });
        }
        
        // הוספת מידע על האינדיקטור (מסומלץ)
        return filteredStocks.map(stock => {
            let indicatorValue = 0;
            let indicatorText = '';
            
            if (indicator === 'rsi') {
                // סימולציה - מניות שירדו יותר מקבלות RSI נמוך יותר
                indicatorValue = 50 - (stock.change_percent || 0) * 5;
                indicatorText = `RSI: ${indicatorValue.toFixed(2)}`;
                
                if (indicatorValue < 30) {
                    indicatorText += ' (Oversold)';
                } else if (indicatorValue > 70) {
                    indicatorText += ' (Overbought)';
                }
            } else if (indicator === 'macd') {
                // סימולציה פשוטה
                indicatorValue = (stock.change_percent || 0) * 0.2;
                indicatorText = `MACD: ${indicatorValue.toFixed(2)}`;
            } else if (indicator === 'moving_avg') {
                // סימולציה פשוטה
                const avgDiff = (stock.change_percent || 0) * 0.5;
                indicatorText = `MA Diff: ${avgDiff.toFixed(2)}%`;
            }
            
            return {
                ...stock,
                indicator_type: indicator,
                indicator_value: indicatorValue,
                indicator_text: indicatorText,
                condition: condition,
                timeframe: timeframe
            };
        });
    } catch (error) {
        console.error(`שגיאה בחיפוש אינדיקטורים טכניים:`, error);
        throw error;
    }
}

/**
 * חישוב ציון למניה
 * @param {number} momentum - אחוז שינוי (מומנטום)
 * @param {number} pe - מכפיל רווח
 * @returns {number} - ציון בין 0 ל-10
 */
function calculateStockScore(momentum, pe) {
    // חישוב ציון מומנטום (0-10)
    let momentumScore = 5; // ציון בסיס
    
    if (momentum > 0) {
        momentumScore += Math.min(momentum * 2, 5); // מקסימום 10
    } else {
        momentumScore += Math.max(momentum * 2, -5); // מינימום 0
    }
    
    // חישוב ציון מכפיל רווח (0-10)
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
    
    // חישוב ציון משוקלל (60% מומנטום, 40% מכפיל רווח)
    return momentumScore * 0.6 + peScore * 0.4;
}

/**
 * חישוב ציון להזדמנות ETF
 * @param {number} expectedChange - שינוי צפוי
 * @param {number} actualChange - שינוי בפועל
 * @returns {number} - ציון בין 0 ל-10
 */
function calculateOpportunityScore(expectedChange, actualChange) {
    // חישוב גודל הפער
    const mismatch = expectedChange - actualChange;
    
    // ככל שהפער גדול יותר, כך הציון גבוה יותר
    // מקסימום 10 נקודות עבור פער של 5% ומעלה
    return Math.min(mismatch * 2, 10);
}

/**
 * חישוב ציון למניית מומנטום
 * @param {number} momentum - מומנטום (אחוז שינוי)
 * @param {number} threshold - סף מומנטום
 * @returns {number} - ציון בין 0 ל-10
 */
function calculateMomentumScore(momentum, threshold) {
    // חישוב כמה המומנטום גבוה מהסף
    const excess = momentum - threshold;
    
    // ציון בסיסי 5 + נקודות נוספות לפי העודף
    // מקסימום 10 נקודות עבור עודף של 5% ומעלה
    return Math.min(5 + excess * 2, 10);
}

/**
 * עדכון נתוני מניות חמות ו-ETF
 * מתבצע אוטומטית כל 5 דקות
 */
async function updateHotStocksAndETFs() {
    try {
        console.log('מעדכן נתוני מניות חמות ו-ETF...');
        
        // בדיקה אם מועד העדכון האחרון תקף
        if (cache.lastUpdate && isDataValid(cache.lastUpdate)) {
            console.log('הנתונים עדיין תקפים, אין צורך בעדכון');
            return;
        }
        
        // עדכון מניות חמות (מומנטום)
        cache.hotStocks = await findMomentumStocks(1.5, 5, 2.0);
        
        // עדכון הזדמנויות ETF
        cache.etfOpportunities = await findEtfOpportunities('all', 1.0, 'both');
        
        // עדכון זמן עדכון אחרון
        cache.lastUpdate = Date.now();
        
        console.log('עדכון נתונים הושלם');
    } catch (error) {
        console.error('שגיאה בעדכון נתונים:', error);
    }
}

// ייצוא הפונקציות הציבוריות
const StockAPI = {
    getStockData,
    getStockHistory,
    getStockNews,
    getRecommendations,
    findEtfOpportunities,
    findMomentumStocks,
    findTechnicalIndicatorStocks,
    normalizeSymbol,
    updateHotStocksAndETFs,
    
    // חשיפת המטמון למטרות ניפוי באגים
    getCache: () => ({ ...cache })
};

// ביצוע עדכון ראשוני בטעינה
updateHotStocksAndETFs();

// הגדר עדכון אוטומטי כל 5 דקות
setInterval(updateHotStocksAndETFs, 5 * 60 * 1000);