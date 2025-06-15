const { GoogleGenerativeAI } = require('@google/generative-ai');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const logger = require('../utils/logger');
const { cache } = require('../config/redis');

// Initialize AI services
let gemini;
let perplexity;

const initializeAI = async () => {
    try {
        // Initialize Gemini
        if (process.env.GEMINI_API_KEY) {
            gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            logger.info('Gemini AI initialized successfully');
        } else {
            logger.warn('Gemini API key not provided');
        }

        // Initialize Perplexity
        if (process.env.PERPLEXITY_API_KEY) {
            perplexity = {
                apiKey: process.env.PERPLEXITY_API_KEY,
                baseURL: 'https://api.perplexity.ai'
            };
            logger.info('Perplexity Sonar initialized successfully');
        } else {
            logger.warn('Perplexity API key not provided');
        }

        // Initialize Cloudinary
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET
            });
            logger.info('Cloudinary initialized successfully');
        } else {
            logger.warn('Cloudinary credentials not provided');
        }

    } catch (error) {
        logger.error('Error initializing AI services:', error);
        throw error;
    }
};

// Generate product descriptions using Gemini AI
const generateProductDescription = async (productData) => {
    try {
        const { name, category, origin, isOrganic, harvestDate, features } = productData;
        
        const cacheKey = `product_description:${JSON.stringify(productData)}`;
        const cached = await cache.getAIContent(cacheKey);
        if (cached) {
            return cached;
        }

        const prompt = `Create a compelling, professional product description for an agricultural marketplace in West Africa. 

Product Details:
- Name: ${name}
- Category: ${category}
- Origin: ${origin || 'West Africa'}
- Organic: ${isOrganic ? 'Yes' : 'No'}
- Harvest Date: ${harvestDate || 'Recent'}
- Special Features: ${features || 'High quality, fresh produce'}

Requirements:
1. Write in clear, simple English suitable for international buyers
2. Highlight freshness, quality, and origin
3. Include nutritional benefits if applicable
4. Mention any certifications or special handling
5. Keep it between 100-200 words
6. Make it appealing for both local and export markets
7. Include storage and handling recommendations

You are an expert agricultural marketing specialist creating product descriptions for an African agricultural marketplace. Focus on quality, freshness, and market appeal.

Write a description that would convince buyers to purchase this product:`;

        const startTime = Date.now();
        
        // Use Gemini 2.0 Flash for text generation
        const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const description = response.text();

        const duration = Date.now() - startTime;

        const finalResult = {
            description,
            model: 'gemini-2.0-flash',
            usage: {
                total_tokens: Math.ceil(description.length / 4), // Approximate token count
                prompt_tokens: Math.ceil(prompt.length / 4),
                completion_tokens: Math.ceil(description.length / 4)
            },
            cost: calculateGeminiCost(description.length),
            generated_at: new Date().toISOString()
        };

        // Cache for 24 hours
        await cache.setAIContent(cacheKey, finalResult, 86400);

        logger.logAIOperation('product_description_generation', {
            product_name: name,
            tokens_used: finalResult.usage.total_tokens,
            cost: finalResult.cost
        }, duration);

        return finalResult;

    } catch (error) {
        logger.error('Error generating product description:', error);
        throw error;
    }
};

// Generate marketing copy for products using Gemini
const generateMarketingCopy = async (productData, copyType = 'social_media') => {
    try {
        const { name, category, benefits, targetAudience } = productData;
        
        const cacheKey = `marketing_copy:${copyType}:${JSON.stringify(productData)}`;
        const cached = await cache.getAIContent(cacheKey);
        if (cached) {
            return cached;
        }

        let prompt;
        
        switch (copyType) {
            case 'social_media':
                prompt = `Create engaging social media posts for ${name}, a ${category} from West Africa. 
                Benefits: ${benefits}
                Target Audience: ${targetAudience || 'Health-conscious consumers and restaurants'}
                
                Create 3 different posts:
                1. Instagram caption with relevant hashtags
                2. Facebook post for business page
                3. Twitter/X post
                
                Make them engaging, include call-to-action, and highlight quality and origin.`;
                break;
                
            case 'email_campaign':
                prompt = `Create an email marketing campaign for ${name}. Include:
                1. Subject line
                2. Email body (200-300 words)
                3. Call-to-action
                
                Focus on quality, freshness, and benefits for buyers.`;
                break;
                
            case 'product_listing':
                prompt = `Create an optimized product listing title and bullet points for ${name}:
                1. SEO-optimized title (under 60 characters)
                2. 5 key bullet points highlighting benefits
                3. Tags for searchability
                
                Optimize for agricultural marketplace search.`;
                break;
                
            default:
                prompt = `Create marketing copy for ${name}, focusing on its benefits and appeal to ${targetAudience}.`;
        }

        const startTime = Date.now();
        
        // Use Gemini 2.0 Flash for marketing copy generation
        const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });
        
        const fullPrompt = `You are an expert marketing copywriter specializing in agricultural products and African markets. Create compelling, culturally appropriate marketing content.

${prompt}`;

        const result_gemini = await model.generateContent(fullPrompt);
        const response = await result_gemini.response;
        const marketingCopy = response.text().trim();

        const duration = Date.now() - startTime;

        // Estimate token usage for cost calculation
        const estimatedTokens = Math.ceil((fullPrompt.length + marketingCopy.length) / 4);

        const result = {
            copy: marketingCopy,
            type: copyType,
            model: 'gemini-2.0-flash',
            usage: {
                prompt_tokens: Math.ceil(fullPrompt.length / 4),
                completion_tokens: Math.ceil(marketingCopy.length / 4),
                total_tokens: estimatedTokens
            },
            cost: calculateGeminiCost(estimatedTokens),
            generated_at: new Date().toISOString()
        };

        // Cache for 12 hours
        await cache.setAIContent(cacheKey, result, 43200);

        logger.logAIOperation('marketing_copy_generation', {
            product_name: name,
            copy_type: copyType,
            tokens_used: result.usage.total_tokens,
            cost: result.cost
        }, duration);

        return result;

    } catch (error) {
        logger.error('Error generating marketing copy:', error);
        throw error;
    }
};

// Generate high-quality product images using Gemini 2.0 Flash
const generateProductImage = async (imageRequest, userTier = 'free') => {
    try {
        const { productName, category, style = 'professional', background = 'clean white' } = imageRequest;
        
        const cacheKey = `product_image:${JSON.stringify(imageRequest)}:${userTier}`;
        const cached = await cache.getAIContent(cacheKey);
        if (cached) {
            return cached;
        }

        const startTime = Date.now();

        let result;

        // For free and basic users, use stock photos from Unsplash
        if (userTier === 'free' || userTier === 'basic') {
            result = await getStockPhoto(productName, category);
        } else {
            // For premium and enterprise users, use Gemini 2.0 Flash for image generation
            result = await generateAIImage(imageRequest);
        }

        const duration = Date.now() - startTime;

        // Cache for 7 days
        await cache.setAIContent(cacheKey, result, 604800);

        logger.logAIOperation('product_image_generation', {
            product_name: productName,
            user_tier: userTier,
            method: userTier === 'free' || userTier === 'basic' ? 'stock_photo' : 'ai_generation',
            processing_time: duration
        }, duration);

        return result;

    } catch (error) {
        logger.error('Error generating product image:', error);
        return {
            success: false,
            error: error.message,
            generated_at: new Date().toISOString()
        };
    }
};

// Get stock photos from Unsplash API (free tier)
const getStockPhoto = async (productName, category) => {
    try {
        const searchQuery = `${productName} ${category} agriculture food fresh`;
        
        const response = await axios.get('https://api.unsplash.com/search/photos', {
            params: {
                query: searchQuery,
                per_page: 5,
                orientation: 'landscape'
            },
            headers: {
                'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
            }
        });

        if (response.data.results && response.data.results.length > 0) {
            const photo = response.data.results[0];
            
            return {
                success: true,
                image_url: photo.urls.regular,
                high_res_url: photo.urls.full,
                thumbnail_url: photo.urls.thumb,
                source: 'unsplash',
                photographer: photo.user.name,
                attribution_url: photo.links.html,
                description: photo.description || photo.alt_description,
                cost: 0, // Free tier
                generated_at: new Date().toISOString()
            };
        } else {
            // Fallback to placeholder if no results
            return {
                success: true,
                image_url: `https://via.placeholder.com/800x600/4CAF50/white?text=${encodeURIComponent(productName)}`,
                source: 'placeholder',
                cost: 0,
                generated_at: new Date().toISOString()
            };
        }

    } catch (error) {
        logger.error('Error fetching stock photo:', error);
        throw error;
    }
};

// Generate AI images using Gemini 2.0 Flash (premium tier)
const generateAIImage = async (imageRequest) => {
    try {
        const { productName, category, style = 'professional', background = 'clean white' } = imageRequest;

        const prompt = `Professional food photography of ${productName}, ${category} from West Africa. 
        Style: ${style} product photography
        Background: ${background}
        Lighting: Natural, bright lighting that highlights freshness and quality
        Composition: Well-arranged, appetizing presentation suitable for e-commerce
        Quality: High resolution, sharp focus, vibrant colors
        Setting: Clean, modern, commercial food photography setup
        
        Create an image that would be perfect for an agricultural marketplace listing, emphasizing freshness, quality, and appeal to potential buyers.`;

        // Use Gemini 2.0 Flash for image generation
        const model = gemini.getGenerativeModel({ 
            model: 'gemini-2.0-flash-exp' // Experimental model with image generation
        });

        const result = await model.generateContent({
            contents: [{ 
                role: 'user', 
                parts: [{ text: prompt }] 
            }],
            generationConfig: {
                responseModalities: ['Text', 'Image']
            }
        });

        const response = await result.response;
        
        // Extract image data if available
        const candidates = response.candidates;
        if (candidates && candidates[0] && candidates[0].content) {
            const parts = candidates[0].content.parts;
            const imagePart = parts.find(part => part.inlineData);
            
            if (imagePart && imagePart.inlineData) {
                // Upload to Cloudinary for hosting
                const uploadResult = await cloudinary.uploader.upload(
                    `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
                    {
                        folder: 'ai_generated_products',
                        public_id: `${productName.replace(/\s+/g, '_')}_${Date.now()}`
                    }
                );

                return {
                    success: true,
                    image_url: uploadResult.secure_url,
                    thumbnail_url: uploadResult.eager?.[0]?.secure_url || uploadResult.secure_url,
                    source: 'gemini-2.0-flash',
                    prompt_used: prompt,
                    model: 'gemini-2.0-flash-exp',
                    cost: 0.10, // Estimated cost for AI generation
                    generated_at: new Date().toISOString()
                };
            }
        }
        
        // Fallback to stock photo if AI generation fails
        return await getStockPhoto(productName, category);

    } catch (error) {
        logger.error('Error generating AI image:', error);
        // Fallback to stock photo on error
        return await getStockPhoto(productName, category);
    }
};

// Analyze crop images for health and quality assessment using Gemini Vision
const analyzeCropImage = async (imageUrl, analysisType = 'general') => {
    try {
        const cacheKey = `crop_analysis:${imageUrl}:${analysisType}`;
        const cached = await cache.getImageAnalysis(cacheKey);
        if (cached) {
            return cached;
        }

        let prompt;
        
        switch (analysisType) {
            case 'health':
                prompt = `Analyze this crop image for plant health. Identify:
                1. Overall plant health status (healthy, stressed, diseased)
                2. Any visible diseases or pest damage
                3. Nutritional deficiencies (if apparent)
                4. Growth stage assessment
                5. Recommendations for improvement
                Provide specific, actionable advice for farmers in West Africa.`;
                break;
                
            case 'quality':
                prompt = `Assess the quality of this agricultural product. Evaluate:
                1. Ripeness level
                2. Size and uniformity
                3. Color and appearance
                4. Any visible defects or damage
                5. Market grade estimation (A, B, C grade)
                6. Storage and handling recommendations
                Provide quality score (1-10) and market advice for West African farmers.`;
                break;
                
            case 'pest':
                prompt = `Analyze this image for pest and disease identification:
                1. Identify any pests or pest damage
                2. Recognize disease symptoms
                3. Assess severity level (low, medium, high)
                4. Recommend treatment options suitable for West Africa
                5. Prevention strategies
                Focus on common West African agricultural pests and diseases.`;
                break;
                
            case 'market_research':
                prompt = `Analyze this agricultural product for market potential using current web data:
                1. Current market demand and pricing trends
                2. Seasonal factors affecting price
                3. Export potential and international markets
                4. Quality standards for premium markets
                5. Marketing and positioning recommendations
                Provide actionable insights for West African farmers looking to maximize profits.`;
                break;
                
            default:
                prompt = `Analyze this agricultural image and provide comprehensive insights about crop condition, quality, and any recommendations for the farmer in West Africa.`;
        }

        const startTime = Date.now();

        // For market research, use Perplexity Sonar for real-time web data
        if (analysisType === 'market_research') {
            const marketData = await getMarketResearch(imageUrl, prompt);
            
            // Combine with Gemini vision analysis for complete assessment
            const visionAnalysis = await analyzeImageWithGemini(imageUrl, prompt);
            
            const result = {
                analysis_type: analysisType,
                vision_analysis: visionAnalysis,
                market_research: marketData,
                confidence_score: 0.90,
                model_used: 'gemini-2.0-flash + perplexity-sonar',
                processing_time: Date.now() - startTime,
                analyzed_at: new Date().toISOString()
            };

            // Cache for 4 hours (market data changes frequently)
            await cache.setImageAnalysis(cacheKey, result, 14400);
            return result;
        } else {
            // Use Gemini vision for other analysis types
            const analysis = await analyzeImageWithGemini(imageUrl, prompt);
            
            const result = {
                analysis_type: analysisType,
                raw_analysis: analysis.text,
                structured_results: parseAnalysisResults(analysis.text, analysisType),
                confidence_score: 0.85,
                recommendations: extractRecommendations(analysis.text),
                model_used: 'gemini-2.0-flash',
                processing_time: Date.now() - startTime,
                analyzed_at: new Date().toISOString()
            };

            // Cache for 2 hours
            await cache.setImageAnalysis(cacheKey, result, 7200);

            logger.logAIOperation('crop_image_analysis', {
                analysis_type: analysisType,
                image_url: imageUrl,
                processing_time: result.processing_time
            }, result.processing_time);

            return result;
        }

    } catch (error) {
        logger.error('Error analyzing crop image:', error);
        throw error;
    }
};

// Analyze image with Gemini Vision
const analyzeImageWithGemini = async (imageUrl, prompt) => {
    try {
        const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const systemPrompt = `You are an expert agricultural scientist and crop consultant with extensive knowledge of West African farming conditions, climate, soil types, and agricultural practices. You have 20+ years of experience in crop diagnostics, plant pathology, and agricultural extension services across sub-Saharan Africa.

Your analysis should be:
- Practical and actionable for smallholder farmers
- Culturally and climatically appropriate for West Africa
- Cost-effective and accessible
- Based on sustainable farming practices
- Considerate of local resource availability

${prompt}`;

        // Fetch image and convert to base64
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBase64 = Buffer.from(imageResponse.data).toString('base64');
        const mimeType = imageResponse.headers['content-type'] || 'image/jpeg';

        const result = await model.generateContent([
            { text: systemPrompt },
            {
                inlineData: {
                    data: imageBase64,
                    mimeType: mimeType
                }
            }
        ]);

        const response = await result.response;
        return {
            text: response.text(),
            usage: response.usageMetadata
        };

    } catch (error) {
        logger.error('Error analyzing image with Gemini:', error);
        throw error;
    }
};

// Get market research using Perplexity Sonar
const getMarketResearch = async (imageUrl, basePrompt) => {
    try {
        // First, analyze the image to identify the crop
        const identificationPrompt = "Identify the main agricultural crop or product in this image. Provide just the name of the crop/product.";
        const identification = await analyzeImageWithGemini(imageUrl, identificationPrompt);
        const cropName = identification.text.trim();

        // Create cache key for market research
        const cacheKey = `market_research:${cropName}:${Buffer.from(basePrompt).toString('base64').slice(0, 50)}`;
        const cached = await cache.getMarketAnalysis(cacheKey);
        if (cached) {
            logger.debug(`Cache hit for market research: ${cropName}`);
            return cached;
        }

        // Use Perplexity Sonar for market research
        const marketPrompt = `Research current market information for ${cropName} in West Africa:
        1. Current wholesale and retail prices in major West African markets
        2. Seasonal price trends and peak demand periods
        3. Export opportunities and international demand
        4. Quality standards and certifications that command premium prices
        5. Storage and post-harvest handling best practices
        6. Main buyers and distribution channels
        7. Government policies or subsidies affecting this crop
        8. Recent market trends and price forecasts

        Focus on actionable insights for farmers in countries like Nigeria, Ghana, Senegal, and Côte d'Ivoire.`;

        const startTime = Date.now();
        
        const response = await axios.post(
            `${perplexity.baseURL}/chat/completions`,
            {
                model: 'sonar',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an agricultural market analyst specializing in West African commodity markets. Provide accurate, current market data with specific prices when possible.'
                    },
                    {
                        role: 'user',
                        content: marketPrompt
                    }
                ]
            },
            {
                headers: {
                    'Authorization': `Bearer ${perplexity.apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const duration = Date.now() - startTime;

        const result = {
            crop_identified: cropName,
            market_analysis: response.data.choices[0].message.content,
            sources: response.data.citations || [],
            model: 'sonar',
            cost: calculatePerplexityCost(),
            processing_time: duration,
            retrieved_at: new Date().toISOString()
        };

        // Cache for 1 hour (market data changes frequently)
        await cache.setMarketAnalysis(cacheKey, result, 3600);

        logger.logAIOperation('market_research', {
            crop_name: cropName,
            cost: result.cost,
            processing_time: duration
        }, duration);

        return result;

    } catch (error) {
        logger.error('Error getting market research:', error);
        return {
            error: 'Market research unavailable',
            fallback_advice: 'Check local agricultural extension services for current market prices and trends.',
            retrieved_at: new Date().toISOString()
        };
    }
};

// Calculate cost based on Gemini pricing
const calculateGeminiCost = (tokens) => {
    if (!tokens) return 0;
    
    // Gemini 2.0 Flash pricing (approximate, check current rates)
    // Input: $0.075 per 1M tokens, Output: $0.30 per 1M tokens
    const inputCost = (tokens * 0.5) * (0.075 / 1000000); // Assuming 50% input
    const outputCost = (tokens * 0.5) * (0.30 / 1000000); // Assuming 50% output
    
    return Number((inputCost + outputCost).toFixed(6));
};

// Calculate cost for Perplexity Sonar
const calculatePerplexityCost = () => {
    // Sonar model pricing (approximate)
    return 0.005; // $5 per 1000 requests
};

// Helper function to parse analysis results into structured format
const parseAnalysisResults = (analysis, type) => {
    try {
        // Extract structured data using regex patterns
        const healthMatch = analysis.match(/health[:\s]*([^.\n]+)/i);
        const qualityMatch = analysis.match(/quality[:\s]*([^.\n]+)/i);
        const scoreMatch = analysis.match(/score[:\s]*(\d+(?:\.\d+)?)/i);
        const gradeMatch = analysis.match(/grade[:\s]*([A-C])/i);
        
        return {
            health_status: healthMatch ? healthMatch[1].trim() : 'assessment needed',
            quality_score: scoreMatch ? parseFloat(scoreMatch[1]) : null,
            market_grade: gradeMatch ? gradeMatch[1] : null,
            issues_detected: extractIssues(analysis),
            growth_stage: extractGrowthStage(analysis)
        };
    } catch (error) {
        logger.error('Error parsing analysis results:', error);
        return {
            health_status: 'analysis_error',
            quality_score: null,
            issues_detected: [],
            growth_stage: 'unknown'
        };
    }
};

// Helper function to extract issues from analysis
const extractIssues = (analysis) => {
    const issues = [];
    const issuePatterns = [
        /pest[s]?[:\s]*([^.\n]+)/i,
        /disease[s]?[:\s]*([^.\n]+)/i,
        /deficiency[:\s]*([^.\n]+)/i,
        /damage[:\s]*([^.\n]+)/i
    ];
    
    issuePatterns.forEach(pattern => {
        const match = analysis.match(pattern);
        if (match && match[1]) {
            issues.push(match[1].trim());
        }
    });
    
    return issues;
};

// Helper function to extract growth stage
const extractGrowthStage = (analysis) => {
    const stagePatterns = [
        /seedling/i,
        /vegetative/i,
        /flowering/i,
        /fruiting/i,
        /mature/i,
        /harvest/i
    ];
    
    for (const pattern of stagePatterns) {
        if (pattern.test(analysis)) {
            return pattern.source.replace(/[\/\\^$.*+?()[\]{}|]/g, '');
        }
    }
    
    return 'undetermined';
};

// Helper function to extract recommendations
const extractRecommendations = (analysis) => {
    const recommendations = [];
    
    // Split analysis into sentences and look for action words
    const sentences = analysis.split(/[.!?]+/);
    const actionWords = ['apply', 'use', 'spray', 'water', 'fertilize', 'prune', 'harvest', 'treat', 'monitor', 'ensure'];
    
    sentences.forEach(sentence => {
        const lowerSentence = sentence.toLowerCase();
        if (actionWords.some(word => lowerSentence.includes(word))) {
            recommendations.push(sentence.trim());
        }
    });
    
    return recommendations.slice(0, 5); // Limit to top 5 recommendations
};

module.exports = {
    initializeAI,
    generateProductDescription,
    generateMarketingCopy,
    generateProductImage,
    analyzeCropImage,
    calculateGeminiCost,
    calculatePerplexityCost
};
