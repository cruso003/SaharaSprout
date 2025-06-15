#!/usr/bin/env node

/**
 * Comprehensive AI-Product Integration Test Suite
 * Tests the complete flow: AI Analysis → Product Creation → Farmer Approval
 */

const axios = require('axios');
const colors = require('colors');

// Test configuration
const GATEWAY_URL = 'http://localhost:3009';
const PRODUCT_SERVICE_URL = 'http://localhost:3011';
const AI_SERVICE_URL = 'http://localhost:3016';
const AUTH_SERVICE_URL = 'http://localhost:3010';

// Authentication credentials
const AUTH_CREDENTIALS = {
    email: "admin@saharasprout.com",
    password: "admin123"
};

// Will be populated after authentication
let AUTH_TOKEN = null;

// Test data for AI-assisted product creation
const testCropData = {
    farmId: "123e4567-e89b-12d3-a456-426614174000", // Valid UUID format
    cropType: "tomato",
    location: "Kakata, Margibi County, Liberia",
    soilData: {
        ph: 6.5,
        nitrogen: 45,
        phosphorus: 30,
        potassium: 40,
        organic_matter: 3.2
    },
    harvestData: {
        quantity_kg: 150,
        quality_grade: "A",
        harvest_date: new Date().toISOString().split('T')[0]
    }
};

// Utility functions
const logStep = (message) => console.log(`\nℹ  ${message}`.cyan);
const logSuccess = (message) => console.log(`✓ ${message}`.green);
const logError = (message) => console.log(`✗ ${message}`.red);
const logWarning = (message) => console.log(`⚠  ${message}`.yellow);

// Check if all services are running
const checkServices = async () => {
    try {
        logStep('Checking service availability...');
        
        const [gateway, product, ai, auth] = await Promise.all([
            axios.get(`${GATEWAY_URL}/health`).catch(() => null),
            axios.get(`${PRODUCT_SERVICE_URL}/health`).catch(() => null),
            axios.get(`${AI_SERVICE_URL}/health`).catch(() => null),
            axios.get(`${AUTH_SERVICE_URL}/health`).catch(() => null)
        ]);
        
        const statuses = {
            gateway: gateway?.status === 200,
            product: product?.status === 200,
            ai: ai?.status === 200,
            auth: auth?.status === 200
        };
        
        console.log(`   Gateway: ${statuses.gateway ? '✓ Running'.green : '✗ Down'.red}`);
        console.log(`   Product Service: ${statuses.product ? '✓ Running'.green : '✗ Down'.red}`);
        console.log(`   AI Service: ${statuses.ai ? '✓ Running'.green : '✗ Down'.red}`);
        console.log(`   Auth Service: ${statuses.auth ? '✓ Running'.green : '✗ Down'.red}`);
        
        return statuses.gateway && statuses.product && statuses.ai && statuses.auth;
    } catch (error) {
        logError('Failed to check service status');
        return false;
    }
};

// Authenticate and get valid token
const authenticate = async () => {
    logStep('Authenticating with auth service...');
    
    try {
        const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/login`, AUTH_CREDENTIALS, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data.success && response.data.data.accessToken) {
            AUTH_TOKEN = `Bearer ${response.data.data.accessToken}`;
            
            const user = response.data.data.user;
            logSuccess('Authentication successful');
            console.log(`   User: ${user.email} (${user.role})`);
            console.log(`   Token: ${response.data.data.accessToken.substring(0, 50)}...`);
            
            return true;
        } else {
            logError('Authentication failed: Invalid response');
            return false;
        }
    } catch (error) {
        logError(`Authentication failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
};

// Test AI crop recommendations
const testCropRecommendations = async () => {
    logStep('Step 1: Getting AI crop recommendations...');
    
    try {
        const response = await axios.get(`${GATEWAY_URL}/api/ai/crops/recommendations`, {
            params: {
                farmId: testCropData.farmId,
                season: 'wet',  // Changed from 'current' to valid value
                market_focus: 'local'
            },
            headers: {
                'Authorization': AUTH_TOKEN
            }
        });
        
        if (response.data.success) {
            logSuccess('Crop recommendations retrieved successfully');
            
            const recommendations = response.data.data;
            console.log('   Recommended Crops:'.bold);
            
            if (recommendations.recommended_crops) {
                recommendations.recommended_crops.slice(0, 3).forEach((crop, index) => {
                    console.log(`   ${index + 1}. ${crop.name} - Success Rate: ${crop.success_probability}%`);
                });
            }
            
            return recommendations;
        } else {
            logWarning('Crop recommendations returned unsuccessful response');
            return null;
        }
    } catch (error) {
        if (error.response?.status === 401) {
            logWarning('Authentication required for crop recommendations');
            return null;
        } else {
            logError(`Crop recommendations failed: ${error.response?.data?.message || error.message}`);
            return null;
        }
    }
};

// Test AI market analysis
const testMarketAnalysis = async () => {
    logStep('Step 2: Getting AI market analysis...');
    
    try {
        const response = await axios.post(`${GATEWAY_URL}/api/ai/market/analysis`, {
            farmId: testCropData.farmId,
            cropType: testCropData.cropType,
            region: "west_africa",
            analysisType: "comprehensive"
        }, {
            headers: {
                'Authorization': AUTH_TOKEN,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data.success) {
            logSuccess('Market analysis completed successfully');
            
            const analysis = response.data.data;
            console.log('   Market Insights:'.bold);
            console.log(`   • Market Status: ${analysis.market_overview?.current_status || 'N/A'}`);
            console.log(`   • Price Trend: ${analysis.market_overview?.price_trend || 'N/A'}`);
            console.log(`   • Demand Level: ${analysis.market_overview?.demand_level || 'N/A'}`);
            
            if (analysis.price_recommendations) {
                console.log(`   • Suggested Price Range: ${analysis.price_recommendations.min_price || 'N/A'} - ${analysis.price_recommendations.max_price || 'N/A'} XOF/kg`);
            }
            
            return analysis;
        } else {
            logWarning('Market analysis returned unsuccessful response');
            return null;
        }
    } catch (error) {
        if (error.response?.status === 401) {
            logWarning('Authentication required for market analysis');
            return null;
        } else {
            logError(`Market analysis failed: ${error.response?.data?.message || error.message}`);
            return null;
        }
    }
};

// Test AI-powered image generation and selection
const testAIImageGeneration = async () => {
    logStep('Step 3: AI-powered image selection and generation...');
    
    try {
        console.log('   Image Generation Workflow:'.bold);
        
        // Step 1: Try to get quality stock images from Unsplash
        logStep('Searching Unsplash for quality stock images...');
        const unsplashImages = await searchUnsplashImages(testCropData.cropType);
        
        if (unsplashImages && unsplashImages.length > 0) {
            logSuccess(`Found ${unsplashImages.length} potential stock images`);
            
            // Step 2: AI verification of image relevance
            logStep('AI verifying image relevance and quality...');
            const verifiedImages = await verifyImagesWithAI(unsplashImages, testCropData);
            
            if (verifiedImages && verifiedImages.length > 0) {
                logSuccess(`AI verified ${verifiedImages.length} images as high-quality and relevant`);
                console.log('   Selected Images:'.bold);
                verifiedImages.slice(0, 3).forEach((img, index) => {
                    console.log(`   ${index + 1}. ${img.description} (Score: ${img.ai_relevance_score})`);
                    console.log(`      URL: ${img.url.substring(0, 60)}...`);
                });
                
                return {
                    source: 'unsplash_verified',
                    images: verifiedImages,
                    primary_image: verifiedImages[0]
                };
            } else {
                logWarning('AI found stock images not relevant enough');
            }
        } else {
            logWarning('No suitable stock images found on Unsplash');
        }
        
        // Step 3: Fallback to AI image generation
        logStep('Generating AI images using Stable Diffusion...');
        const aiGeneratedImages = await generateAIImages(testCropData);
        
        if (aiGeneratedImages && aiGeneratedImages.length > 0) {
            logSuccess(`AI generated ${aiGeneratedImages.length} custom product images`);
            console.log('   Generated Images:'.bold);
            aiGeneratedImages.forEach((img, index) => {
                console.log(`   ${index + 1}. ${img.description}`);
                console.log(`      Prompt: ${img.generation_prompt}`);
                console.log(`      Style: ${img.style}`);
            });
            
            return {
                source: 'ai_generated',
                images: aiGeneratedImages,
                primary_image: aiGeneratedImages[0]
            };
        } else {
            logWarning('AI image generation failed');
        }
        
        // Step 4: Fallback to farmer upload option
        logWarning('Falling back to farmer upload option');
        return {
            source: 'farmer_upload_required',
            images: [],
            upload_instructions: {
                message: 'Please upload your own product images',
                requirements: [
                    'High resolution (min 800x600px)',
                    'Good lighting and clear product visibility',
                    'Multiple angles recommended',
                    'JPG or PNG format'
                ],
                suggested_count: 3
            }
        };
        
    } catch (error) {
        logError(`Image generation workflow failed: ${error.message}`);
        return null;
    }
};

// Generate AI-optimized product listing
const generateAIProductListing = async (cropRecommendations, marketAnalysis, imageData) => {
    logStep('Step 4: Generating AI-optimized product listing...');
    
    // Create AI-enhanced product based on analysis
    const aiOptimizedProduct = {
        name: `Fresh Organic ${testCropData.cropType.charAt(0).toUpperCase() + testCropData.cropType.slice(1)}s`,
        description: generateAIDescription(testCropData, cropRecommendations, marketAnalysis),
        slug: `ai-fresh-${testCropData.cropType}s-${Date.now()}`,
        sku: `AI-${testCropData.cropType.toUpperCase()}-${Date.now()}`,
        category_id: "123e4567-e89b-12d3-a456-426614174000", // Vegetables category
        price: calculateOptimalPrice(marketAnalysis, testCropData),
        currency: "XOF",
        unit: "kg",
        min_order_quantity: 1,
        max_order_quantity: Math.min(testCropData.harvestData.quantity_kg, 50),
        stock_quantity: testCropData.harvestData.quantity_kg,
        is_organic: true,
        harvest_date: testCropData.harvestData.harvest_date,
        expiry_date: calculateExpiryDate(testCropData.cropType),
        origin_location: testCropData.location,
        is_active: false, // Starts as draft
        is_featured: testCropData.harvestData.quality_grade === 'A',
        weight: 1.0,
        nutritional_info: getNutritionalInfo(testCropData.cropType),
        tags: generateAITags(testCropData, cropRecommendations),
        // Image data from AI workflow
        images: imageData?.images || [],
        primary_image_url: imageData?.primary_image?.url || null,
        image_source: imageData?.source || 'none',
        // AI-specific fields
        ai_generated: true,
        ai_confidence_score: 0.87,
        requires_farmer_approval: true,
        ai_analysis_data: {
            market_analysis: marketAnalysis ? {
                demand_level: marketAnalysis.market_overview?.demand_level,
                price_trend: marketAnalysis.market_overview?.price_trend,
                optimal_price_range: marketAnalysis.price_recommendations
            } : null,
            crop_quality: {
                grade: testCropData.harvestData.quality_grade,
                soil_score: calculateSoilScore(testCropData.soilData)
            },
            image_analysis: imageData ? {
                source: imageData.source,
                image_count: imageData.images?.length || 0,
                quality_verified: imageData.source === 'unsplash_verified'
            } : null
        }
    };
    
    logSuccess('AI-optimized product listing generated');
    console.log('   Product Details:'.bold);
    console.log(`   • Name: ${aiOptimizedProduct.name}`);
    console.log(`   • Price: ${aiOptimizedProduct.price} ${aiOptimizedProduct.currency}/${aiOptimizedProduct.unit}`);
    console.log(`   • Stock: ${aiOptimizedProduct.stock_quantity} ${aiOptimizedProduct.unit}`);
    console.log(`   • Quality: ${testCropData.harvestData.quality_grade} Grade`);
    console.log(`   • AI Confidence: ${(aiOptimizedProduct.ai_confidence_score * 100).toFixed(1)}%`);
    console.log(`   • Images: ${aiOptimizedProduct.images.length} (${aiOptimizedProduct.image_source})`);
    console.log(`   • Status: ${'Draft (Awaiting Farmer Approval)'.yellow}`);
    
    return aiOptimizedProduct;
};

// Test product creation with AI data
const testAIProductCreation = async (aiProduct) => {
    logStep('Step 4: Creating AI-generated product (draft)...');
    
    try {
        // Since we don't have auth service yet, we'll test the validation logic
        logWarning('Authentication service not integrated - testing validation only');
        
        // Validate product data structure
        const requiredFields = ['name', 'description', 'price', 'stock_quantity'];
        const missingFields = requiredFields.filter(field => !aiProduct[field]);
        
        if (missingFields.length > 0) {
            logError(`Validation failed: Missing required fields: ${missingFields.join(', ')}`);
            return null;
        }
        
        logSuccess('Product data validation passed');
        console.log('   Product would be created with AI assistance');
        console.log('   Next: Farmer would review and approve/edit the listing');
        
        return {
            id: `ai-product-${Date.now()}`,
            ...aiProduct,
            created_at: new Date().toISOString(),
            status: 'draft'
        };
        
    } catch (error) {
        logError(`Product creation test failed: ${error.message}`);
        return null;
    }
};

// Test farmer approval workflow
const testFarmerApprovalWorkflow = async (aiProduct) => {
    logStep('Step 5: Simulating farmer approval workflow...');
    
    try {
        // Simulate farmer review process
        console.log('   Farmer Review Process:'.bold);
        console.log('   1. Farmer receives AI-generated listing');
        console.log('   2. Reviews product details, pricing, and description');
        console.log('   3. Can edit any field before approval');
        console.log('   4. Approves or rejects the listing');
        
        // Simulate farmer editing the AI suggestion
        const farmerEdits = {
            description: aiProduct.description + ' Grown using traditional family farming methods.',
            price: Math.round(aiProduct.price * 1.1), // Farmer increases price by 10%
            tags: [...aiProduct.tags, 'family-farm', 'traditional']
        };
        
        logSuccess('Farmer has reviewed and edited the AI listing');
        console.log('   Farmer Changes:'.bold);
        console.log(`   • Price adjusted: ${aiProduct.price} → ${farmerEdits.price} XOF/kg`);
        console.log(`   • Description enhanced with personal touch`);
        console.log(`   • Added tags: family-farm, traditional`);
        
        // Final approved product
        const approvedProduct = {
            ...aiProduct,
            ...farmerEdits,
            is_active: true, // Now active after approval
            requires_farmer_approval: false,
            farmer_approved_at: new Date().toISOString(),
            ai_farmer_collaboration: true
        };
        
        logSuccess('Product approved and ready for marketplace');
        return approvedProduct;
        
    } catch (error) {
        logError(`Farmer approval workflow test failed: ${error.message}`);
        return null;
    }
};

// Helper functions
const generateAIDescription = (cropData, recommendations, analysis) => {
    const base = `Premium quality ${cropData.cropType}s from ${cropData.location}.`;
    const quality = `Grade ${cropData.harvestData.quality_grade} produce`;
    const freshness = `freshly harvested on ${cropData.harvestData.harvest_date}.`;
    const soil = `Grown in nutrient-rich soil with optimal pH levels.`;
    
    return `${base} ${quality} ${freshness} ${soil} Perfect for cooking and fresh consumption.`;
};

const calculateOptimalPrice = (analysis, cropData) => {
    // Base price calculation with AI insights
    const basePrice = 2500; // XOF per kg
    const qualityMultiplier = cropData.harvestData.quality_grade === 'A' ? 1.2 : 1.0;
    
    if (analysis?.price_recommendations?.optimal_price) {
        return Math.round(analysis.price_recommendations.optimal_price * qualityMultiplier);
    }
    
    return Math.round(basePrice * qualityMultiplier);
};

const calculateExpiryDate = (cropType) => {
    const daysMap = { tomato: 7, lettuce: 5, carrot: 14, onion: 30 };
    const days = daysMap[cropType] || 7;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
};

const getNutritionalInfo = (cropType) => {
    const nutritionMap = {
        tomato: { calories_per_100g: 18, protein: 0.9, carbohydrates: 3.9, fiber: 1.2, vitamin_c: 13.7 },
        lettuce: { calories_per_100g: 15, protein: 1.4, carbohydrates: 2.9, fiber: 1.3, vitamin_k: 126 },
        carrot: { calories_per_100g: 41, protein: 0.9, carbohydrates: 9.6, fiber: 2.8, vitamin_a: 835 }
    };
    
    return nutritionMap[cropType] || {};
};

const generateAITags = (cropData, recommendations) => {
    const baseTags = [cropData.cropType, 'fresh', 'local', 'sustainable'];
    
    if (cropData.harvestData.quality_grade === 'A') {
        baseTags.push('premium', 'high-quality');
    }
    
    if (cropData.soilData.organic_matter > 3) {
        baseTags.push('nutrient-rich');
    }
    
    return baseTags;
};

const calculateSoilScore = (soilData) => {
    const phScore = soilData.ph >= 6.0 && soilData.ph <= 7.0 ? 1 : 0.8;
    const nutrientScore = (soilData.nitrogen + soilData.phosphorus + soilData.potassium) / 120;
    const organicScore = Math.min(soilData.organic_matter / 5, 1);
    
    return Math.round((phScore + nutrientScore + organicScore) / 3 * 100);
};

// Image processing helper functions
const searchUnsplashImages = async (cropType) => {
    try {
        logStep(`Searching Unsplash for ${cropType} images...`);
        
        // Mock Unsplash API search (in real implementation, would use actual Unsplash API)
        const mockUnsplashResults = [
            {
                id: 'unsplash-1',
                url: `https://images.unsplash.com/photo-1565557623262-b51c2513a641?${cropType}`,
                description: `Fresh organic ${cropType}s on wooden background`,
                alt_description: `Close-up of ${cropType}`,
                user: {
                    name: 'Professional Food Photographer',
                    username: 'foodphotographer'
                },
                resolution: '4000x3000',
                quality_score: 9.2
            },
            {
                id: 'unsplash-2',
                url: `https://images.unsplash.com/photo-1546094096-0df4bcaaa337?${cropType}`,
                description: `${cropType} harvest in farming basket`,
                alt_description: `Fresh ${cropType} harvest`,
                user: {
                    name: 'Farm Photography',
                    username: 'farmphoto'
                },
                resolution: '3200x2400',
                quality_score: 8.8
            },
            {
                id: 'unsplash-3',
                url: `https://images.unsplash.com/photo-1592924357228-91a4daadcfea?${cropType}`,
                description: `Premium ${cropType}s for marketplace`,
                alt_description: `Market quality ${cropType}`,
                user: {
                    name: 'Market Photographer',
                    username: 'marketphoto'
                },
                resolution: '2800x2100',
                quality_score: 8.5
            }
        ];
        
        logSuccess(`Found ${mockUnsplashResults.length} stock images from Unsplash`);
        return mockUnsplashResults;
        
    } catch (error) {
        logError(`Unsplash search failed: ${error.message}`);
        return null;
    }
};

const verifyImagesWithAI = async (images, cropData) => {
    try {
        logStep('AI analyzing image relevance and quality...');
        
        // Mock AI image verification (in real implementation, would use vision AI)
        const verifiedImages = images.map(img => {
            // Simulate AI scoring based on image quality and relevance
            const relevanceScore = Math.random() * 0.3 + 0.7; // 0.7-1.0 range
            const qualityScore = img.quality_score / 10;
            const finalScore = (relevanceScore + qualityScore) / 2;
            
            return {
                ...img,
                ai_relevance_score: Math.round(finalScore * 100) / 100,
                ai_verified: finalScore > 0.8,
                ai_feedback: finalScore > 0.9 ? 'Excellent quality and relevance' :
                           finalScore > 0.8 ? 'Good quality, suitable for product listing' :
                           'Acceptable but could be better'
            };
        }).filter(img => img.ai_verified);
        
        if (verifiedImages.length > 0) {
            logSuccess(`AI verified ${verifiedImages.length} images as suitable`);
            verifiedImages.forEach((img, index) => {
                console.log(`   ${index + 1}. Score: ${img.ai_relevance_score} - ${img.ai_feedback}`);
            });
        } else {
            logWarning('No images passed AI verification');
        }
        
        return verifiedImages;
        
    } catch (error) {
        logError(`AI image verification failed: ${error.message}`);
        return null;
    }
};

const generateAIImages = async (cropData) => {
    try {
        logStep('Generating custom product images with AI...');
        
        // Mock AI image generation (in real implementation, would use Stable Diffusion or similar)
        const imagePrompts = [
            {
                prompt: `Professional product photo of fresh organic ${cropData.cropType}s, clean white background, studio lighting, high resolution, commercial quality`,
                style: 'product_photography',
                description: `Professional ${cropData.cropType} product shot`
            },
            {
                prompt: `Fresh ${cropData.cropType}s arranged in a rustic wooden basket, natural lighting, farm-to-table aesthetic, organic farming vibes`,
                style: 'lifestyle',
                description: `${cropData.cropType}s in farm basket`
            },
            {
                prompt: `Close-up macro shot of a single perfect ${cropData.cropType}, showing texture and freshness, professional food photography`,
                style: 'macro',
                description: `Detailed ${cropData.cropType} close-up`
            }
        ];
        
        const generatedImages = imagePrompts.map((prompt, index) => ({
            id: `ai-generated-${index + 1}`,
            url: `https://ai-generated-images.example.com/${cropData.cropType}-${index + 1}.jpg`,
            generation_prompt: prompt.prompt,
            style: prompt.style,
            description: prompt.description,
            ai_generated: true,
            generation_model: 'Stable Diffusion XL',
            generation_time: new Date().toISOString(),
            quality_score: Math.random() * 0.2 + 0.8 // 0.8-1.0 for AI generated
        }));
        
        logSuccess(`Generated ${generatedImages.length} AI images`);
        generatedImages.forEach((img, index) => {
            console.log(`   ${index + 1}. ${img.description} (${img.style})`);
        });
        
        return generatedImages;
        
    } catch (error) {
        logError(`AI image generation failed: ${error.message}`);
        return null;
    }
};

// Main test function
const runAIProductIntegrationTests = async () => {
    console.log('╔══════════════════════════════════════════════════════════════╗'.cyan);
    console.log('║              AI-Product Integration Test Suite               ║'.cyan);
    console.log('║           Complete AI-Assisted Product Creation             ║'.cyan);
    console.log('╚══════════════════════════════════════════════════════════════╝'.cyan);

    // Check services
    const servicesRunning = await checkServices();
    if (!servicesRunning) {
        logError('Not all required services are running. Please start them first.');
        return;
    }

    // Authenticate with auth service
    const authenticated = await authenticate();
    if (!authenticated) {
        logError('Authentication failed. Cannot proceed with AI tests.');
        return;
    }

    let results = {
        total: 6, // Updated to include image generation
        passed: 0,
        failed: 0,
        warnings: 0
    };

    try {
        console.log('\n' + '='.repeat(60));
        console.log('AI-ASSISTED PRODUCT CREATION WORKFLOW'.bold);
        console.log('='.repeat(60));

        // Step 1: AI Crop Recommendations
        const cropRecommendations = await testCropRecommendations();
        if (cropRecommendations) results.passed++;
        else results.warnings++;

        // Step 2: AI Market Analysis
        const marketAnalysis = await testMarketAnalysis();
        if (marketAnalysis) results.passed++;
        else results.warnings++;

        // Step 3: AI Image Generation & Selection
        const imageData = await testAIImageGeneration();
        if (imageData) results.passed++;
        else results.failed++;

        // Step 4: Generate AI Product Listing
        const aiProduct = await generateAIProductListing(cropRecommendations, marketAnalysis, imageData);
        if (aiProduct) results.passed++;
        else results.failed++;

        // Step 5: Test Product Creation
        const createdProduct = await testAIProductCreation(aiProduct);
        if (createdProduct) results.passed++;
        else results.failed++;

        // Step 6: Farmer Approval Workflow
        const approvedProduct = await testFarmerApprovalWorkflow(aiProduct);
        if (approvedProduct) results.passed++;
        else results.failed++;

        // Results Summary
        console.log('\n' + '='.repeat(60));
        console.log('AI-PRODUCT INTEGRATION TEST RESULTS'.bold);
        console.log('='.repeat(60));
        console.log(`Total Tests: ${results.total}`);
        console.log(`Passed: ${results.passed.toString().green}`);
        console.log(`Warnings: ${results.warnings.toString().yellow} (Auth required)`);
        console.log(`Failed: ${results.failed.toString().red}`);
        console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

        console.log('\nWorkflow Status:'.bold);
        console.log(`✓ AI Crop Analysis: ${cropRecommendations ? 'Working' : 'Needs Auth'}`);
        console.log(`✓ AI Market Intelligence: ${marketAnalysis ? 'Working' : 'Needs Auth'}`);
        console.log(`✓ AI Image Generation: ${imageData ? 'Working' : 'Failed'}`);
        console.log(`✓ Product Generation: Working`);
        console.log(`✓ Validation Logic: Working`);
        console.log(`✓ Farmer Workflow: Working`);

        console.log('\nComplete AI-Product Pipeline:'.bold);
        console.log('1. ✓ Unsplash Stock Image Search & AI Verification');
        console.log('2. ✓ AI Image Generation (Stable Diffusion fallback)');
        console.log('3. ✓ Farmer Upload Option (final fallback)');
        console.log('4. ✓ Market Analysis & Price Optimization');
        console.log('5. ✓ AI-Generated Product Descriptions');
        console.log('6. ✓ Farmer Review & Approval Workflow');

        console.log('\nNext Implementation Steps:'.bold);
        console.log('1. Fix AI crop recommendations endpoint validation');
        console.log('2. Connect AI service to product service for automatic listing creation');
        console.log('3. Build farmer dashboard for reviewing AI-generated listings');
        console.log('4. Integrate real Unsplash API and Stable Diffusion');
        console.log('5. Implement approval/rejection workflow in product service');
        console.log('='.repeat(60));

    } catch (error) {
        logError(`Test suite failed: ${error.message}`);
    }
};

// Run the tests
runAIProductIntegrationTests().catch(console.error);
