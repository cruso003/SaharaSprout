const axios = require('axios');
const moment = require('moment');
const { getPool } = require('../config/database');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');

// Initialize Perplexity Sonar for market intelligence
let perplexity;

const initializeMarketService = async () => {
    try {
        if (process.env.PERPLEXITY_API_KEY) {
            perplexity = {
                apiKey: process.env.PERPLEXITY_API_KEY,
                baseURL: 'https://api.perplexity.ai'
            };
            logger.info('Market Service with Perplexity Sonar initialized successfully');
        } else {
            logger.warn('Perplexity API key not provided for market service');
        }
    } catch (error) {
        logger.error('Error initializing market service:', error);
        throw error;
    }
};

// Call Perplexity Sonar for market intelligence
const callPerplexitySonar = async (prompt, model = 'sonar') => {
    try {
        const response = await axios.post(
            `${perplexity.baseURL}/chat/completions`,
            {
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert agricultural market analyst and meteorological specialist with comprehensive knowledge of African agricultural markets, weather patterns, and farming systems.

                        Your expertise includes:
                        - Real-time commodity pricing and market dynamics
                        - Local and regional agricultural value chains
                        - Weather forecasting and agricultural implications
                        - Seasonal market trends and harvest calendars
                        - Export market opportunities and trade requirements
                        - Government policies affecting agriculture
                        - Currency and economic factors affecting farming
                        - Cross-border trade opportunities
                        - Climate-smart agriculture recommendations
                        
                        Always provide current, accurate, and location-specific data with actionable insights. Include specific prices, dates, and reliable sources when available.`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            },
            {
                headers: {
                    'Authorization': `Bearer ${perplexity.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 45000
            }
        );

        return {
            content: response.data.choices[0].message.content,
            citations: response.data.citations || [],
            usage: response.data.usage,
            model: response.data.model,
            search_mode: model
        };

    } catch (error) {
        logger.error('Error calling Perplexity Sonar for market data:', error);
        throw error;
    }
};

// Start comprehensive market analysis for specific location
const startMarketAnalysis = async (farmLocation, crops = []) => {
    const startTime = Date.now();
    
    try {
        logger.info(`Starting market intelligence analysis for ${farmLocation}...`);
        
        const analysisResults = {
            location: farmLocation,
            crops_analyzed: crops.length,
            market_insights: 0,
            weather_reports: 0,
            trade_opportunities: 0,
            price_alerts: 0,
            processing_time: 0
        };

        // Run comprehensive location-based analysis
        const [
            marketIntelligence,
            weatherIntelligence,
            priceIntelligence,
            tradeOpportunities
        ] = await Promise.all([
            generateMarketIntelligence(farmLocation, crops),
            generateWeatherIntelligence(farmLocation, crops),
            generatePriceIntelligence(farmLocation, crops),
            identifyTradeOpportunities(farmLocation, crops)
        ]);

        // Compile results
        analysisResults.market_insights = marketIntelligence.insights_count || 0;
        analysisResults.weather_reports = weatherIntelligence.reports_count || 0;
        analysisResults.trade_opportunities = tradeOpportunities.opportunities_count || 0;
        analysisResults.price_alerts = priceIntelligence.alerts_count || 0;
        analysisResults.processing_time = Date.now() - startTime;

        // Store analysis results
        const analysisData = {
            location: farmLocation,
            market_intelligence: marketIntelligence,
            weather_intelligence: weatherIntelligence,
            price_intelligence: priceIntelligence,
            trade_opportunities: tradeOpportunities,
            generated_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() // 6 hours
        };

        await storeMarketAnalysis(farmLocation, analysisData);

        logger.logMarketAnalysis(analysisResults, analysisResults.processing_time);
        
        return {
            success: true,
            data: analysisData,
            summary: analysisResults
        };

    } catch (error) {
        logger.error('Error in market analysis:', error);
        throw error;
    }
};

// Generate comprehensive market intelligence for location
const generateMarketIntelligence = async (farmLocation, crops = []) => {
    try {
        const cacheKey = `market_intelligence:${farmLocation}:${moment().format('YYYY-MM-DD-HH')}`;
        const cached = await cache.getMarketAnalysis(cacheKey);
        if (cached) {
            return cached;
        }

        const cropsText = crops.length > 0 ? crops.join(', ') : 'major agricultural crops';
        
        const marketPrompt = `Provide comprehensive market intelligence for agricultural products in ${farmLocation}:

        MARKET OVERVIEW for ${cropsText}:
        1. Current market conditions and recent developments
        2. Local wholesale and retail prices in major markets
        3. Supply and demand dynamics
        4. Market accessibility and transportation costs
        
        SEASONAL AND TREND ANALYSIS:
        5. Seasonal price patterns and upcoming seasonal influences
        6. Recent price trends and volatility
        7. Production forecasts for current season
        8. Storage and post-harvest considerations
        
        TRADE AND OPPORTUNITIES:
        9. Export opportunities and international demand
        10. Cross-border trade potential with neighboring countries
        11. Value-addition opportunities and processing potential
        12. Quality standards and certification requirements
        
        CHALLENGES AND SOLUTIONS:
        13. Current market challenges and barriers
        14. Government policies and support programs
        15. Infrastructure and logistics considerations
        16. Recommended market strategies for farmers

        Focus on actionable insights with specific data points, prices, and timing recommendations for farmers in ${farmLocation}.`;

        const response = await callPerplexitySonar(marketPrompt, 'sonar');

        const result = {
            location: farmLocation,
            crops: crops,
            analysis: response.content,
            sources: response.citations,
            insights_count: extractInsightCount(response.content),
            confidence_score: 0.92,
            generated_at: new Date().toISOString()
        };

        // Cache for 4 hours
        await cache.setMarketAnalysis(cacheKey, result, 14400);

        return result;

    } catch (error) {
        logger.error('Error generating market intelligence:', error);
        return {
            location: farmLocation,
            error: 'Market intelligence unavailable',
            insights_count: 0
        };
    }
};

// Generate weather intelligence for farming operations
const generateWeatherIntelligence = async (farmLocation, crops = []) => {
    try {
        const cacheKey = `weather_intelligence:${farmLocation}:${moment().format('YYYY-MM-DD-HH')}`;
        const cached = await cache.getMarketAnalysis(cacheKey);
        if (cached) {
            return cached;
        }

        const cropsText = crops.length > 0 ? `for ${crops.join(', ')} cultivation` : 'for agricultural operations';

        const weatherPrompt = `Provide comprehensive weather intelligence and agricultural forecast for ${farmLocation} ${cropsText}:

        CURRENT CONDITIONS:
        1. Current weather patterns and recent climate data
        2. Soil moisture conditions and rainfall amounts
        3. Temperature trends and extremes in past 30 days
        4. Humidity levels and atmospheric conditions
        
        FORECASTS AND OUTLOOKS:
        5. Detailed weather forecast for next 14 days
        6. Seasonal outlook and long-range predictions (3-6 months)
        7. Rainfall predictions and patterns
        8. Temperature forecasts and agricultural implications
        
        AGRICULTURAL IMPACTS:
        9. Growing condition assessment for current season
        10. Optimal planting and harvesting windows
        11. Irrigation requirements and water management
        12. Pest and disease pressure forecasts based on weather
        
        RISK ASSESSMENT AND RECOMMENDATIONS:
        13. Climate risks and extreme weather warnings
        14. Drought, flood, or storm risk assessments
        15. Recommended farming adjustments based on weather
        16. Climate adaptation strategies for the region
        
        PRACTICAL ACTIONS:
        17. Immediate actions needed based on weather forecast
        18. Equipment and infrastructure preparations
        19. Crop protection measures recommended
        20. Marketing timing considerations based on weather

        Include specific meteorological data, farmer advisories, and actionable recommendations with dates and timing.`;

        const response = await callPerplexitySonar(weatherPrompt, 'sonar');

        const result = {
            location: farmLocation,
            crops: crops,
            weather_analysis: response.content,
            sources: response.citations,
            reports_count: extractWeatherReportCount(response.content),
            alerts: extractWeatherAlerts(response.content),
            confidence_score: 0.88,
            generated_at: new Date().toISOString(),
            next_update: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
        };

        // Cache for 3 hours (weather changes more frequently)
        await cache.setMarketAnalysis(cacheKey, result, 10800);

        return result;

    } catch (error) {
        logger.error('Error generating weather intelligence:', error);
        return {
            location: farmLocation,
            error: 'Weather intelligence unavailable',
            reports_count: 0
        };
    }
};

// Generate price intelligence and alerts
const generatePriceIntelligence = async (farmLocation, crops = []) => {
    try {
        const cacheKey = `price_intelligence:${farmLocation}:${moment().format('YYYY-MM-DD')}`;
        const cached = await cache.getMarketAnalysis(cacheKey);
        if (cached) {
            return cached;
        }

        const cropsText = crops.length > 0 ? crops.join(', ') : 'major agricultural commodities';

        const pricePrompt = `Provide detailed price intelligence and market analysis for ${cropsText} in ${farmLocation}:

        CURRENT PRICING:
        1. Today's wholesale and retail prices in local markets
        2. Farm gate prices vs consumer prices
        3. Regional price variations within the country
        4. Comparison with neighboring countries' prices
        
        PRICE TRENDS AND ANALYSIS:
        5. Daily, weekly, and monthly price movements
        6. Year-over-year price comparisons
        7. Seasonal price patterns and cycles
        8. Price volatility indicators and risk factors
        
        MARKET FORCES:
        9. Supply-side factors influencing current prices
        10. Demand drivers and consumer behavior
        11. Government interventions and price policies
        12. Currency exchange rate impacts on pricing
        
        FORECASTING AND OPPORTUNITIES:
        13. Short-term price outlook (next 30 days)
        14. Medium-term projections (3-6 months)
        15. Optimal selling timing recommendations
        16. Price risk management strategies
        
        ACTIONABLE INTELLIGENCE:
        17. Price alerts and threshold recommendations
        18. Market timing strategies for farmers
        19. Value-addition opportunities for better pricing
        20. Export market pricing comparisons

        Include specific price points, percentage changes, currency values, and market timing recommendations.`;

        const response = await callPerplexitySonar(pricePrompt, 'sonar-reasoning-pro', 'high');

        const result = {
            location: farmLocation,
            crops: crops,
            price_analysis: response.content,
            sources: response.citations,
            alerts_count: extractPriceAlerts(response.content).length,
            price_alerts: extractPriceAlerts(response.content),
            confidence_score: 0.85,
            generated_at: new Date().toISOString(),
            next_update: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
        };

        // Cache for 2 hours (prices change frequently)
        await cache.setMarketAnalysis(cacheKey, result, 7200);

        return result;

    } catch (error) {
        logger.error('Error generating price intelligence:', error);
        return {
            location: farmLocation,
            error: 'Price intelligence unavailable',
            alerts_count: 0
        };
    }
};

// Identify trade opportunities for location
const identifyTradeOpportunities = async (farmLocation, crops = []) => {
    try {
        const cacheKey = `trade_opportunities:${farmLocation}:${moment().format('YYYY-MM-DD')}`;
        const cached = await cache.getMarketAnalysis(cacheKey);
        if (cached) {
            return cached;
        }

        const cropsText = crops.length > 0 ? crops.join(', ') : 'agricultural products';

        const tradePrompt = `Identify trade and export opportunities for ${cropsText} from ${farmLocation}:

        EXPORT OPPORTUNITIES:
        1. International markets with high demand for products from ${farmLocation}
        2. Export requirements and documentation needed
        3. Quality standards and certifications required
        4. Export prices vs local market prices
        
        REGIONAL TRADE:
        5. Cross-border trade opportunities with neighboring countries
        6. Regional economic community trade agreements and benefits
        7. Transportation routes and logistics options
        8. Border procedures and trade facilitation
        
        VALUE ADDITION:
        9. Processing opportunities to increase value
        10. Packaging and branding requirements for export
        11. Storage and preservation technologies needed
        12. Investment requirements for value addition
        
        MARKET ACCESS:
        13. Distribution channels and buyer networks
        14. Trade fairs and market linkage opportunities
        15. Digital marketing and e-commerce possibilities
        16. Partnership opportunities with exporters/processors
        
        SUPPORT AND FINANCING:
        17. Government export promotion programs
        18. Trade finance and credit facilities available
        19. Technical assistance and capacity building programs
        20. Insurance and risk mitigation options

        Focus on practical, actionable opportunities with specific contacts, requirements, and implementation steps.`;

        const response = await callPerplexitySonar(tradePrompt, 'sonar');

        const result = {
            location: farmLocation,
            crops: crops,
            trade_analysis: response.content,
            sources: response.citations,
            opportunities_count: extractOpportunityCount(response.content),
            opportunities: extractTradeOpportunities(response.content),
            confidence_score: 0.80,
            generated_at: new Date().toISOString()
        };

        // Cache for 12 hours
        await cache.setMarketAnalysis(cacheKey, result, 43200);

        return result;

    } catch (error) {
        logger.error('Error identifying trade opportunities:', error);
        return {
            location: farmLocation,
            error: 'Trade opportunity analysis unavailable',
            opportunities_count: 0
        };
    }
};

// Helper functions to extract structured data
const extractInsightCount = (content) => {
    const insights = content.match(/\d+\./g);
    return insights ? insights.length : 0;
};

const extractWeatherReportCount = (content) => {
    const reports = content.toLowerCase().match(/(forecast|outlook|prediction|warning)/g);
    return reports ? reports.length : 0;
};

const extractWeatherAlerts = (content) => {
    const alerts = [];
    const alertPatterns = [
        { pattern: /drought|dry/i, type: 'drought_risk', severity: 'medium' },
        { pattern: /flood|heavy.rain/i, type: 'flood_risk', severity: 'high' },
        { pattern: /storm|cyclone/i, type: 'storm_warning', severity: 'high' },
        { pattern: /extreme.temperature/i, type: 'temperature_extreme', severity: 'medium' },
        { pattern: /pest.outbreak/i, type: 'pest_risk', severity: 'medium' }
    ];

    alertPatterns.forEach(({ pattern, type, severity }) => {
        if (pattern.test(content)) {
            alerts.push({ type, severity, detected: true });
        }
    });

    return alerts;
};

const extractPriceAlerts = (content) => {
    const alerts = [];
    const pricePatterns = [
        { pattern: /price.increase|rising.price/i, type: 'price_increase', trend: 'bullish' },
        { pattern: /price.decrease|falling.price/i, type: 'price_decrease', trend: 'bearish' },
        { pattern: /volatile|volatility/i, type: 'high_volatility', trend: 'unstable' },
        { pattern: /shortage|scarcity/i, type: 'supply_shortage', trend: 'bullish' },
        { pattern: /surplus|oversupply/i, type: 'supply_surplus', trend: 'bearish' }
    ];

    pricePatterns.forEach(({ pattern, type, trend }) => {
        if (pattern.test(content)) {
            alerts.push({ type, trend, detected: true });
        }
    });

    return alerts;
};

const extractOpportunityCount = (content) => {
    const opportunities = content.match(/opportunit(y|ies)|market|export|trade/gi);
    return opportunities ? Math.min(opportunities.length, 20) : 0;
};

const extractTradeOpportunities = (content) => {
    // Extract specific opportunities from content
    const opportunities = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
        if (line.match(/\d+\./)) {
            opportunities.push({
                description: line.replace(/^\d+\.\s*/, '').trim(),
                type: 'trade_opportunity'
            });
        }
    });

    return opportunities.slice(0, 10); // Limit to top 10
};

// Store market analysis in database
const storeMarketAnalysis = async (location, analysisData) => {
    try {
        const query = `
            INSERT INTO market_intelligence (
                location, analysis_data, generated_at, expires_at
            ) VALUES ($1, $2, $3, $4)
            ON CONFLICT (location, DATE(generated_at)) 
            DO UPDATE SET 
                analysis_data = EXCLUDED.analysis_data,
                expires_at = EXCLUDED.expires_at
        `;

        await getPool().query(query, [
            location,
            JSON.stringify(analysisData),
            analysisData.generated_at,
            analysisData.expires_at
        ]);

        logger.info(`Stored market intelligence for ${location}`);
    } catch (error) {
        logger.error('Error storing market analysis:', error);
    }
};

// Fetch products from product service (unchanged)
const fetchProductsFromService = async () => {
    try {
        const productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3011';
        const response = await axios.get(`${productServiceUrl}/api/products?limit=100&is_active=true`);
        
        return response.data.data || [];
    } catch (error) {
        logger.error('Error fetching products from service:', error);
        return [];
    }
};

// Get cached market analysis
const getCachedMarketAnalysis = async (location) => {
    try {
        const cacheKey = `market_analysis:${location}:${moment().format('YYYY-MM-DD')}`;
        return await cache.getMarketAnalysis(cacheKey);
    } catch (error) {
        logger.error('Error getting cached analysis:', error);
        return null;
    }
};

module.exports = {
    initializeMarketService,
    startMarketAnalysis,
    generateMarketIntelligence,
    generateWeatherIntelligence,
    generatePriceIntelligence,
    identifyTradeOpportunities,
    getCachedMarketAnalysis,
    callPerplexitySonar
};
