// stockApi.js - מודול מעודכן לניהול קריאות API ונתוני מניות באמצעות Stockdio API

// מפתח API
const API_KEY = '7AE8EC3A9B0140D4835C74E5899E348F'; // מפתח דוגמה מהתמונות, החלף במפתח האמיתי שלך

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
 * קבלת נתוני מניה מה-API של Stockdio
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
        
        // קריאה ל-API מה-Stockdio לקבלת מידע על החברה
        const url = `https://api.stockdio.com/data/financial/info/v1/GetCompanyInfo?app-key=${API_KEY}&symbol=${normalizedSymbol}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`שגיאת API: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.data || !data.data.symbol) {
            throw new Error(`לא נמצאו נתונים עבור הסמל: ${normalizedSymbol}`);
        }
        
        // עיבוד נתונים - התאמה לפורמט הקודם
        const processedData = {
            symbol: data.data.symbol,
            name: data.data.company,
            price: parseFloat(data.data.exchangeClosingPrice),
            day_change: parseFloat(data.data.dayChange) || 0,
            change_percent: parseFloat(data.data.changePercentage) || 0,
            volume: parseInt(data.data.volume || 0),
            market_cap: parseFloat(data.data.marketCap || 0),
            pe: parseFloat(data.data.priceToEarningsRatio || 0),
            currency: data.data.currency
        };
        
        // שמירה במטמון
        cache.stockData[normalizedSymbol] = {
            data: processedData,
            timestamp: Date.now()
        };
        
        return processedData;
    } catch (error) {
        console.error(`שגיאה בקבלת נתוני מניה ${symbol}:`, error);
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
        
        // המרת טווח לימים עבור ה-API של Stockdio
        let days;
        switch (range) {
            case '1d': days = 1; break;
            case '5d': days = 5; break;
            case '1m': days = 30; break;
            case '3m': days = 90; break;
            case '1y': days = 365; break;
            case '5y': days = 1825; break;
            default: days = 30;
        }
        
        // יצירת URL עם פרמטרים מתאימים
        const url = `https://api.stockdio.com/data/financial/prices/v1/GetHistoricalPrices?app-key=${API_KEY}&symbol=${normalizedSymbol}&days=${days}&addVolume=true`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`שגיאת API בקבלת נתוני היסטוריה: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.data || !data.data.quotes || data.data.quotes.length === 0) {
            throw new Error(`לא נמצאו נתוני היסטוריה עבור ${normalizedSymbol}`);
        }
        
        // עיבוד נתונים לפורמט המתאים לגרף
        return data.data.quotes.map(item => ({
            date: item.date,
            open: parseFloat(item.open),
            high: parseFloat(item.high),
            low: parseFloat(item.low),
            close: parseFloat(item.close),
            volume: parseInt(item.volume || 0)
        }));
    } catch (error) {
        console.error(`שגיאה בקבלת נתוני היסטוריה:`, error);
        throw error;
    }
}

/**
 * קבלת חדשות עבור מניה
 * @param {string} symbol - סמל המניה
 * @returns {Promise<Object>} - הבטחה עם חדשות
 */
async function getStockNews(symbol) {
    try {
        const normalizedSymbol = normalizeSymbol(symbol);
        
        // יצירת מקורות חדשות ריקים
        const result = {
            stockdata: [],
            finnhub: []
        };
        
        try {
            // קריאה ל-API של Stockdio לקבלת חדשות
            const url = `https://api.stockdio.com/data/financial/news/v1/GetNewsBySymbol?app-key=${API_KEY}&symbol=${normalizedSymbol}&count=10`;
            
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                
                if (data && data.data && data.data.news) {
                    // עיבוד נתונים לפורמט המתאים
                    result.stockdata = data.data.news.map(item => ({
                        title: item.title,
                        url: item.url,
                        published_at: item.date,
                        source: item.source
                    }));
                    
                    // העתקת נתונים גם למקור finnhub כדי לתמוך בממשק הקיים
                    result.finnhub = data.data.news.map(item => ({
                        headline: item.title,
                        url: item.url,
                        datetime: new Date(item.date).getTime() / 1000,
                        source: item.source
                    }));
                }
            }
        } catch (error) {
            console.error('שגיאה בקבלת חדשות:', error);
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
        const stocksToCheck = budget === 'low' 
            ? [...CATEGORIES.POPULAR_STOCKS.tech.slice(0, 3), ...CATEGORIES.POPULAR_STOCKS.israel.slice(0, 3)]
            : [...CATEGORIES.POPULAR_STOCKS.tech.slice(3), ...CATEGORIES.POPULAR_STOCKS.finance.slice(0, 3)];
        
        // קבלת מידע על כל המניות
        const recommendations = [];
        
        for (const symbol of stocksToCheck) {
            try {
                const stockData = await getStockData(symbol);
                
                // חישוב ציון אלגוריתמי פשוט
                const momentum = stockData.change_percent || 0;
                const pe = stockData.pe || 20;
                const score = calculateStockScore(momentum, pe);
                
                recommendations.push({
                    ...stockData,
                    score,
                    recommendation: score >= 6 ? 'קניה' : score <= 3 ? 'מכירה' : 'המתנה'
                });
            } catch (error) {
                console.warn(`לא ניתן לקבל נתונים עבור ${symbol}:`, error);
            }
        }
        
        // מיון לפי ציון, מהגבוה לנמוך
        return recommendations.sort((a, b) => b.score - a.score);
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
        let symbolPairs = [];
        
        if (sector === 'all') {
            // כל הסקטורים
            Object.entries(CATEGORIES.ETF).forEach(([key, mapping]) => {
                symbolPairs.push({
                    sector: key,
                    sectorName: mapping.description,
                    baseSymbol: mapping.ticker,
                    bullSymbol: mapping.leverageBull,
                    bearSymbol: mapping.leverageBear
                });
            });
        } else if (CATEGORIES.ETF[sector]) {
            // סקטור ספציפי
            const mapping = CATEGORIES.ETF[sector];
            symbolPairs.push({
                sector,
                sectorName: mapping.description,
                baseSymbol: mapping.ticker,
                bullSymbol: mapping.leverageBull,
                bearSymbol: mapping.leverageBear
            });
        } else {
            throw new Error(`סקטור לא חוקי: ${sector}`);
        }
        
        // מציאת אי התאמות
        const opportunities = [];
        
        for (const pair of symbolPairs) {
            try {
                // קבלת נתונים על הבסיס וה-ETFs
                const baseData = await getStockData(pair.baseSymbol);
                const bullData = await getStockData(pair.bullSymbol);
                const bearData = await getStockData(pair.bearSymbol);
                
                if (baseData && bullData && bearData) {
                    const baseChange = baseData.change_percent || 0;
                    const bullChange = bullData.change_percent || 0;
                    const bearChange = bearData.change_percent || 0;
                    
                    // בדיקת הזדמנויות לעלייה
                    if ((direction === 'up' || direction === 'both') && baseChange > 0) {
                        const expectedBull = baseChange * 3;
                        const bullMismatch = expectedBull - bullChange;
                        
                        if (bullMismatch > mismatchThreshold) {
                            opportunities.push({
                                sector: pair.sector,
                                sectorName: pair.sectorName,
                                symbol: pair.bullSymbol,
                                name: bullData.name || pair.bullSymbol,
                                price: bullData.price,
                                change_percent: bullChange,
                                base_symbol: baseData.symbol,
                                base_change: baseChange,
                                expected_change: expectedBull,
                                actual_change: bullChange,
                                mismatch: bullMismatch.toFixed(2),
                                direction: 'up',
                                score: calculateOpportunityScore(expectedBull, bullChange)
                            });
                        }
                    }
                    
                    // בדיקת הזדמנויות לירידה
                    if ((direction === 'down' || direction === 'both') && baseChange < 0) {
                        const expectedBear = Math.abs(baseChange) * 3;
                        const bearMismatch = expectedBear - bearChange;
                        
                        if (bearMismatch > mismatchThreshold) {
                            opportunities.push({
                                sector: pair.sector,
                                sectorName: pair.sectorName,
                                symbol: pair.bearSymbol,
                                name: bearData.name || pair.bearSymbol,
                                price: bearData.price,
                                change_percent: bearChange,
                                base_symbol: baseData.symbol,
                                base_change: baseChange,
                                expected_change: expectedBear,
                                actual_change: bearChange,
                                mismatch: bearMismatch.toFixed(2),
                                direction: 'down',
                                score: calculateOpportunityScore(expectedBear, bearChange)
                            });
                        }
                    }
                }
            } catch (error) {
                console.warn(`שגיאה בבדיקת הזדמנויות לסקטור ${pair.sector}:`, error);
            }
        }
        
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
        // רשימת מניות לבדיקה
        const allStocks = [
            ...CATEGORIES.POPULAR_STOCKS.tech,
            ...CATEGORIES.POPULAR_STOCKS.finance,
            ...CATEGORIES.POPULAR_STOCKS.pharma.slice(0, 3),
            ...CATEGORIES.POPULAR_STOCKS.israel
        ];
        
        // הסרת כפילויות
        const uniqueStocks = [...new Set(allStocks)];
        
        // בדיקת מומנטום לכל מניה
        const momentumStocks = [];
        
        for (const symbol of uniqueStocks) {
            try {
                // קבלת נתוני היסטוריה
                const historyData = await getStockHistory(symbol, timeframe === 5 ? '5d' : timeframe === 30 ? '1m' : '3m');
                
                if (historyData && historyData.length >= 2) {
                    // חישוב שינוי באחוזים
                    const oldestPrice = historyData[0].close;
                    const currentPrice = historyData[historyData.length - 1].close;
                    const changePercent = ((currentPrice - oldestPrice) / oldestPrice) * 100;
                    
                    // בדיקה אם יש מומנטום מספיק
                    if (changePercent >= threshold) {
                        // קבלת פרטי מניה נוספים
                        const stockData = await getStockData(symbol);
                        const targetPrice = stockData.price * (1 + profitTarget / 100);
                        
                        momentumStocks.push({
                            ...stockData,
                            momentum: changePercent,
                            target_price: targetPrice.toFixed(2),
                            profit_target: profitTarget,
                            score: calculateMomentumScore(changePercent, threshold)
                        });
                    }
                }
            } catch (error) {
                console.warn(`לא ניתן לבדוק מומנטום עבור ${symbol}:`, error);
            }
        }
        
        // מיון לפי גודל המומנטום
        return momentumStocks.sort((a, b) => b.momentum - a.momentum);
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
        // המרת timeframe למספר ימים
        let days;
        switch (timeframe) {
            case 'daily': days = 30; break;
            case 'weekly': days = 90; break;
            case 'monthly': days = 365; break;
            default: days = 30;
        }
        
        // רשימת מניות לבדיקה
        const popularStocks = [
            ...CATEGORIES.POPULAR_STOCKS.tech,
            ...CATEGORIES.POPULAR_STOCKS.finance.slice(0, 3),
            ...CATEGORIES.POPULAR_STOCKS.israel.slice(0, 3)
        ];
        
        // הסרת כפילויות
        const uniqueStocks = [...new Set(popularStocks)];
        
        // תוצאות המתאימות לקריטריון
        const matchingStocks = [];
        
        for (const symbol of uniqueStocks) {
            try {
                // קבלת נתוני היסטוריה
                const historyData = await getStockHistory(symbol, days === 30 ? '1m' : days === 90 ? '3m' : '1y');
                
                if (!historyData || historyData.length < 14) continue;
                
                // חישוב אינדיקטור טכני
                let indicatorValue = 0;
                let indicatorText = '';
                let isMatch = false;
                
                if (indicator === 'rsi') {
                    // חישוב RSI פשוט
                    indicatorValue = calculateSimpleRSI(historyData);
                    indicatorText = `RSI: ${indicatorValue.toFixed(2)}`;
                    
                    if (condition === 'oversold' && indicatorValue < 30) {
                        isMatch = true;
                        indicatorText += ' (Oversold)';
                    } else if (condition === 'overbought' && indicatorValue > 70) {
                        isMatch = true;
                        indicatorText += ' (Overbought)';
                    }
                } else if (indicator === 'macd') {
                    // חישוב MACD פשוט (הפרש בין ממוצעים)
                    const macdData = calculateSimpleMACD(historyData);
                    indicatorValue = macdData.signal;
                    indicatorText = `MACD: ${macdData.macd.toFixed(2)}, Signal: ${macdData.signal.toFixed(2)}`;
                    
                    if (condition === 'crossing' && Math.abs(macdData.macd - macdData.signal) < 0.1) {
                        isMatch = true;
                        indicatorText += ' (Crossing)';
                    }
                } else if (indicator === 'moving_avg') {
                    // חישוב חציית ממוצעים נעים
                    const maData = calculateMovingAverages(historyData);
                    indicatorValue = maData.shortTerm - maData.longTerm;
                    indicatorText = `MA Diff: ${indicatorValue.toFixed(2)}`;
                    
                    if (condition === 'crossing' && Math.abs(indicatorValue) < 0.5) {
                        isMatch = true;
                        indicatorText += ' (Crossing)';
                    }
                }
                
                // אם מתאים לקריטריון, הוסף לתוצאות
                if (isMatch) {
                    const stockData = await getStockData(symbol);
                    
                    matchingStocks.push({
                        ...stockData,
                        indicator_type: indicator,
                        indicator_value: indicatorValue,
                        indicator_text: indicatorText,
                        condition: condition,
                        timeframe: timeframe
                    });
                }
            } catch (error) {
                console.warn(`לא ניתן לחשב אינדיקטורים עבור ${symbol}:`, error);
            }
        }
        
        return matchingStocks;
    } catch (error) {
        console.error(`שגיאה בחיפוש אינדיקטורים טכניים:`, error);
        throw error;
    }
}

// פונקציות עזר לחישוב אינדיקטורים טכניים
function calculateSimpleRSI(historyData) {
    // חישוב פשוט של RSI
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i < historyData.length; i++) {
        const change = historyData[i].close - historyData[i-1].close;
        if (change > 0) {
            gains += change;
        } else {
            losses += Math.abs(change);
        }
    }
    
    const avgGain = gains / (historyData.length - 1);
    const avgLoss = losses / (historyData.length - 1);
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

function calculateSimpleMACD(historyData) {
    // חישוב פשוט של MACD (ללא חישוב מדויק)
    const closePrices = historyData.map(item => item.close);
    
    // חישוב ממוצע נע קצר (12 ימים)
    const shortTermEMA = calculateEMA(closePrices, 12);
    
    // חישוב ממוצע נע ארוך (26 ימים)
    const longTermEMA = calculateEMA(closePrices, 26);
    
    // חישוב MACD
    const macd = shortTermEMA - longTermEMA;
    
    // חישוב קו איתות (9 ימים)
    const signal = calculateEMA([...Array(17).fill(0), macd], 9);
    
    return { macd, signal };
}

function calculateMovingAverages(historyData) {
    const closePrices = historyData.map(item => item.close);
    
    // חישוב ממוצע נע קצר (20 ימים)
    const shortTerm = calculateSMA(closePrices, 20);
    
    // חישוב ממוצע נע ארוך (50 ימים)
    const longTerm = calculateSMA(closePrices, 50);
    
    return { shortTerm, longTerm };
}

function calculateSMA(prices, period) {
    if (prices.length < period) return prices.reduce((a, b) => a + b, 0) / prices.length;
    
    const slice = prices.slice(prices.length - period);
    return slice.reduce((a, b) => a + b, 0) / period;
}

function calculateEMA(prices, period) {
    if (prices.length < period) return calculateSMA(prices, prices.length);
    
    const k = 2 / (period + 1);
    let ema = calculateSMA(prices.slice(0, period), period);
    
    for (let i = period; i < prices.length; i++) {
        ema = prices[i] * k + ema * (1 - k);
    }
    
    return ema;
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