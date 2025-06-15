const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const { verifyToken, requireFarmer, optionalAuth } = require('../middleware/auth');
const {
    createAIRateLimiter,
    trackAICost
} = require('../middleware/aiRateLimit');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');

// Supported languages for SaharaSprout platform
const SUPPORTED_LANGUAGES = {
    'en': 'English',
    'fr': 'French',
    'ha': 'Hausa',
    'ig': 'Igbo',
    'yo': 'Yoruba',
    'ff': 'Fulfulde',
    'sw': 'Swahili',
    'ar': 'Arabic',
    'am': 'Amharic',
    'wo': 'Wolof',
    'bm': 'Bambara'
};

// Agricultural terminology dictionary for accurate translations
const AGRICULTURAL_TERMS = {
    'irrigation': {
        'en': 'irrigation',
        'fr': 'irrigation',
        'ha': 'ban ruwa',
        'ig': 'ịgba mmiri',
        'yo': 'fifun omi',
        'ff': 'ndiyam',
        'sw': 'umwagiliaji',
        'ar': 'ري',
        'am': 'መስኖ',
        'wo': 'ngees',
        'bm': 'ji di'
    },
    'fertilizer': {
        'en': 'fertilizer',
        'fr': 'engrais',
        'ha': 'takin ƙasa',
        'ig': 'nri ala',
        'yo': 'ajile',
        'ff': 'kooyjuul',
        'sw': 'mbolea',
        'ar': 'سماد',
        'am': 'ፈሳሽ መድሃኒት',
        'wo': 'koom',
        'bm': 'dugukolo'
    },
    'harvest': {
        'en': 'harvest',
        'fr': 'récolte',
        'ha': 'girbi',
        'ig': 'owuwe ihe',
        'yo': 'ikore',
        'ff': 'heɓde',
        'sw': 'mavuno',
        'ar': 'حصاد',
        'am': 'መከር',
        'wo': 'ngànn',
        'bm': 'sènè'
    }
};

// Translate agricultural content with context awareness
router.post('/translate',
    optionalAuth,
    createAIRateLimiter('translation'),
    trackAICost('translation'),
    [
        body('text').notEmpty().withMessage('Text to translate is required'),
        body('target_language').optional().isIn(Object.keys(SUPPORTED_LANGUAGES)),
        body('targetLanguage').optional().isIn(Object.keys(SUPPORTED_LANGUAGES)),
        body('source_language').optional().isIn(Object.keys(SUPPORTED_LANGUAGES)),
        body('sourceLanguage').optional().isIn(Object.keys(SUPPORTED_LANGUAGES)),
        body('context').optional().isIn(['farming', 'agriculture', 'market', 'weather', 'general']),
        body('preserve_technical_terms').optional().isBoolean()
    ].concat([
        // At least one target language field must be provided
        body().custom((value, { req }) => {
            const targetLang = req.body.target_language || req.body.targetLanguage;
            if (!targetLang) {
                throw new Error('Target language is required');
            }
            if (!Object.keys(SUPPORTED_LANGUAGES).includes(targetLang)) {
                throw new Error('Unsupported target language');
            }
            return true;
        })
    ]),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { 
                text, 
                target_language, 
                targetLanguage,
                source_language = 'en', 
                sourceLanguage,
                context = 'general',
                preserve_technical_terms = true 
            } = req.body;

            // Use either camelCase or snake_case fields
            const finalTargetLang = target_language || targetLanguage;
            const finalSourceLang = source_language || sourceLanguage || 'en';

            const cacheKey = `translation:${Buffer.from(text).toString('base64').slice(0, 32)}:${finalSourceLang}:${finalTargetLang}:${context}`;
            
            let translation = await cache.get(cacheKey);

            if (!translation) {                // Perform intelligent agricultural translation
                translation = await performAgriculturalTranslation(
                    text,
                    finalSourceLang,
                    finalTargetLang,
                    context,
                    preserve_technical_terms
                );

                // Cache translation for 7 days
                await cache.set(cacheKey, JSON.stringify(translation), 604800);
            } else {
                translation = JSON.parse(translation);
            }

            res.json({
                success: true,
                data: translation
            });

        } catch (error) {
            logger.error('Error in translation endpoint:', error);
            res.status(500).json({
                success: false,
                message: 'Translation failed'
            });
        }
    }
);

// Get localized farming recommendations
router.get('/localized-recommendations',
    verifyToken,
    requireFarmer,
    createAIRateLimiter('localized_content'),
    trackAICost('localized_content'),
    [
        query('language').isIn(Object.keys(SUPPORTED_LANGUAGES)).withMessage('Unsupported language'),
        query('region').optional().isString(),
        query('crop_type').optional().isString(),
        query('recommendation_type').optional().isIn(['irrigation', 'fertilization', 'pest_control', 'harvest'])
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { language, region = 'West Africa', crop_type = 'mixed', recommendation_type = 'general' } = req.query;
            const cacheKey = `localized_recommendations:${language}:${region}:${crop_type}:${recommendation_type}`;
            
            let recommendations = await cache.get(cacheKey);

            if (!recommendations) {
                // Generate localized content based on language and region
                recommendations = await generateLocalizedRecommendations(
                    language, 
                    region, 
                    crop_type, 
                    recommendation_type
                );

                // Cache for 12 hours
                await cache.set(cacheKey, JSON.stringify(recommendations), 43200);
            } else {
                recommendations = JSON.parse(recommendations);
            }

            res.json({
                success: true,
                data: recommendations
            });

        } catch (error) {
            logger.error('Error in localized recommendations endpoint:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate localized recommendations'
            });
        }
    }
);

// Voice command processing for hands-free operation
router.post('/voice-command',
    verifyToken,
    requireFarmer,
    createAIRateLimiter('voice_processing'),
    trackAICost('voice_processing'),
    [
        body('audio_text').notEmpty().withMessage('Audio text is required'),
        body('language').isIn(Object.keys(SUPPORTED_LANGUAGES)).withMessage('Unsupported language'),
        body('farmId').notEmpty().withMessage('Farm ID is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { audio_text, language, farmId } = req.body;
            const userId = req.user.id;

            // Process voice command
            const commandProcessing = await processVoiceCommand(audio_text, language, farmId, userId);

            res.json({
                success: true,
                message: 'Voice command processed',
                data: commandProcessing
            });

        } catch (error) {
            logger.error('Error in voice command endpoint:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process voice command'
            });
        }
    }
);

// Cultural adaptation suggestions
router.get('/cultural-adaptation',
    optionalAuth,
    [
        query('language').isIn(Object.keys(SUPPORTED_LANGUAGES)).withMessage('Unsupported language'),
        query('region').optional().isString(),
        query('farming_practice').optional().isString()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { language, region = 'West Africa', farming_practice = 'general' } = req.query;
            const cacheKey = `cultural_adaptation:${language}:${region}:${farming_practice}`;
            
            let adaptations = await cache.get(cacheKey);

            if (!adaptations) {
                adaptations = await generateCulturalAdaptations(language, region, farming_practice);

                // Cache for 24 hours
                await cache.set(cacheKey, JSON.stringify(adaptations), 86400);
            } else {
                adaptations = JSON.parse(adaptations);
            }

            res.json({
                success: true,
                data: adaptations
            });

        } catch (error) {
            logger.error('Error in cultural adaptation endpoint:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate cultural adaptations'
            });
        }
    }
);

// Get supported languages and features
router.get('/languages',
    optionalAuth,
    (req, res) => {
        res.json({
            success: true,
            data: {
                supported_languages: SUPPORTED_LANGUAGES,
                features: {
                    text_translation: true,
                    voice_commands: true,
                    cultural_adaptation: true,
                    technical_term_preservation: true,
                    context_aware_translation: true,
                    localized_recommendations: true
                },
                regional_coverage: [
                    'West Africa',
                    'East Africa',
                    'Central Africa',
                    'North Africa',
                    'Southern Africa'
                ],
                agricultural_contexts: [
                    'irrigation',
                    'fertilization',
                    'pest_control',
                    'harvesting',
                    'market_analysis',
                    'weather_forecasting',
                    'crop_management'
                ]
            }
        });
    }
);

// Helper functions for language processing

async function performAgriculturalTranslation(text, sourceLang, targetLang, context, preserveTerms) {
    try {
        // Mock translation logic - in production, use professional translation API
        // with agricultural domain expertise
        
        let translatedText = await translateWithContext(text, sourceLang, targetLang, context);
        
        if (preserveTerms) {
            translatedText = preserveAgriculturalTerms(translatedText, targetLang);
        }

        return {
            original_text: text,
            translated_text: translatedText,
            source_language: sourceLang,
            target_language: targetLang,
            context: context,
            confidence_score: 0.92,
            preserved_terms: preserveTerms ? extractPreservedTerms(text, targetLang) : [],
            cultural_notes: getCulturalNotes(text, targetLang, context),
            pronunciation_guide: generatePronunciationGuide(translatedText, targetLang)
        };

    } catch (error) {
        logger.error('Error in agricultural translation:', error);
        throw error;
    }
}

async function translateWithContext(text, sourceLang, targetLang, context) {
    // Mock translation - in production, use context-aware translation service
    const contextualPhrases = {
        'farming': {
            'water the crops': {
                'ha': 'ban ruwa ga amfanin gona',
                'ig': 'gbaa ihe ọkụkụ mmiri',
                'yo': 'fun awọn irugbin ni omi',
                'fr': 'arroser les cultures'
            },
            'check soil moisture': {
                'ha': 'bincika danshi na ƙasa',
                'ig': 'lelee mmiri dị na ala',
                'yo': 'ṣayẹwo ọrọ ilẹ',
                'fr': 'vérifier l\'humidité du sol'
            }
        },
        'market': {
            'current price': {
                'ha': 'farashin yanzu',
                'ig': 'ọnụ ahịa ugbu a',
                'yo': 'owo lọwọlọwọ',
                'fr': 'prix actuel'
            }
        }
    };

    // Simple translation logic - would be replaced with actual API
    const phrases = contextualPhrases[context] || {};
    let translated = text;
    
    Object.keys(phrases).forEach(phrase => {
        if (text.toLowerCase().includes(phrase)) {
            translated = translated.replace(new RegExp(phrase, 'gi'), phrases[phrase][targetLang] || phrase);
        }
    });

    return translated;
}

function preserveAgriculturalTerms(translatedText, targetLang) {
    // Replace technical terms with localized versions
    Object.keys(AGRICULTURAL_TERMS).forEach(term => {
        const localTerm = AGRICULTURAL_TERMS[term][targetLang];
        if (localTerm) {
            translatedText = translatedText.replace(new RegExp(term, 'gi'), localTerm);
        }
    });
    
    return translatedText;
}

function extractPreservedTerms(text, targetLang) {
    const preservedTerms = [];
    
    Object.keys(AGRICULTURAL_TERMS).forEach(term => {
        if (text.toLowerCase().includes(term)) {
            preservedTerms.push({
                original: term,
                localized: AGRICULTURAL_TERMS[term][targetLang] || term,
                definition: getTermDefinition(term, targetLang)
            });
        }
    });
    
    return preservedTerms;
}

function getCulturalNotes(text, targetLang, context) {
    const culturalNotes = {
        'ha': ['Consider Islamic farming calendar', 'Respect for traditional practices'],
        'ig': ['Community-based farming approach', 'Market day considerations'],
        'yo': ['Traditional Yoruba farming wisdom', 'Seasonal festival timing'],
        'fr': ['Colonial influence in terminology', 'French agricultural standards']
    };
    
    return culturalNotes[targetLang] || [];
}

function generatePronunciationGuide(text, targetLang) {
    // Simplified pronunciation guide
    const pronunciationRules = {
        'ha': 'Tone marks indicate rising/falling pitch',
        'ig': 'Tonal language - pay attention to accent marks',
        'yo': 'Nasal vowels indicated by ṇ, ẹ marks',
        'fr': 'Standard French pronunciation rules apply'
    };
    
    return pronunciationRules[targetLang] || 'Standard pronunciation';
}

async function generateLocalizedRecommendations(language, region, cropType, recommendationType) {
    // Generate recommendations adapted to local context
    const localizedContent = {
        language: language,
        region: region,
        crop_type: cropType,
        recommendation_type: recommendationType,
        recommendations: await getLocalizedRecommendationsForContext(language, region, cropType, recommendationType),
        cultural_considerations: getCulturalConsiderations(language, region),
        local_practices: getLocalFarmingPractices(region, cropType),
        seasonal_calendar: getLocalSeasonalCalendar(region, language),
        traditional_knowledge: getTraditionalKnowledge(region, language, cropType),
        modern_adaptations: getModernAdaptations(region, recommendationType)
    };

    return localizedContent;
}

async function getLocalizedRecommendationsForContext(language, region, cropType, recommendationType) {
    // Mock localized recommendations
    const recommendations = {
        'irrigation': {
            'West Africa': {
                'en': 'Water early morning to reduce evaporation in hot climate',
                'ha': 'Ban ruwa da safe don rage ɓacewar ruwa a cikin zafi',
                'fr': 'Arroser tôt le matin pour réduire l\'évaporation'
            }
        },
        'fertilization': {
            'West Africa': {
                'en': 'Apply organic compost during rainy season for better absorption',
                'ha': 'Yi amfani da takin dawa a lokacin damina don ingantaccen sha',
                'fr': 'Appliquer du compost organique pendant la saison des pluies'
            }
        }
    };

    return recommendations[recommendationType]?.[region]?.[language] || 
           'Recommendation not available in this language';
}

function getCulturalConsiderations(language, region) {
    const considerations = {
        'ha': ['Respect prayer times', 'Consider Friday market schedules'],
        'ig': ['Community decision making', 'Traditional land tenure'],
        'yo': ['Extended family involvement', 'Traditional crop varieties'],
        'fr': ['Government regulations', 'Export standards']
    };
    
    return considerations[language] || [];
}

function getLocalFarmingPractices(region, cropType) {
    return [
        'Intercropping with traditional varieties',
        'Seasonal rotation based on rainfall',
        'Community labor sharing systems',
        'Traditional pest control methods'
    ];
}

function getLocalSeasonalCalendar(region, language) {
    return {
        wet_season: 'May - October',
        dry_season: 'November - April',
        planting_time: 'Early wet season',
        harvest_time: 'Late wet season',
        market_peaks: 'December - February'
    };
}

function getTraditionalKnowledge(region, language, cropType) {
    return [
        'Indigenous crop varieties suited to local climate',
        'Traditional weather prediction methods',
        'Community seed preservation techniques',
        'Local soil improvement practices'
    ];
}

function getModernAdaptations(region, recommendationType) {
    return [
        'Technology integration with traditional practices',
        'Climate-smart agriculture techniques',
        'Market linkage improvements',
        'Sustainable intensification methods'
    ];
}

async function processVoiceCommand(audioText, language, farmId, userId) {
    // Process voice commands in local languages
    const commands = {
        'irrigation': ['water', 'irrigate', 'ban ruwa', 'arroser'],
        'status': ['status', 'check', 'dubawa', 'vérifier'],
        'weather': ['weather', 'yanayi', 'temps'],
        'harvest': ['harvest', 'girbi', 'récolte']
    };

    const intent = detectIntent(audioText, commands);
    const action = await executeVoiceAction(intent, farmId, userId);

    return {
        recognized_text: audioText,
        language: language,
        detected_intent: intent,
        confidence: 0.89,
        action_taken: action,
        response_text: generateResponseText(action, language),
        follow_up_suggestions: getFollowUpSuggestions(intent, language)
    };
}

function detectIntent(text, commands) {
    const lowerText = text.toLowerCase();
    
    for (const [intent, keywords] of Object.entries(commands)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
            return intent;
        }
    }
    
    return 'unknown';
}

async function executeVoiceAction(intent, farmId, userId) {
    const actions = {
        'irrigation': 'Checked irrigation status',
        'status': 'Retrieved farm status',
        'weather': 'Fetched weather forecast',
        'harvest': 'Checked harvest readiness',
        'unknown': 'Command not recognized'
    };
    
    return actions[intent] || actions['unknown'];
}

function generateResponseText(action, language) {
    const responses = {
        'en': `Action completed: ${action}`,
        'ha': `An gama aiki: ${action}`,
        'fr': `Action terminée: ${action}`,
        'ig': `Ọrụ ewusiri: ${action}`,
        'yo': `Iṣẹ ti pari: ${action}`
    };
    
    return responses[language] || responses['en'];
}

function getFollowUpSuggestions(intent, language) {
    const suggestions = {
        'irrigation': {
            'en': ['Check soil moisture', 'Adjust irrigation schedule'],
            'ha': ['Bincika danshi na ƙasa', 'Gyara jadawalin ban ruwa'],
            'fr': ['Vérifier l\'humidité du sol', 'Ajuster le calendrier d\'irrigation']
        }
    };
    
    return suggestions[intent]?.[language] || [];
}

async function generateCulturalAdaptations(language, region, farmingPractice) {
    return {
        language: language,
        region: region,
        farming_practice: farmingPractice,
        ui_adaptations: {
            date_format: getLocalDateFormat(language),
            number_format: getLocalNumberFormat(language),
            currency_display: getLocalCurrency(region),
            measurement_units: getLocalUnits(region)
        },
        content_adaptations: {
            imagery: 'Local farmers and landscapes',
            color_preferences: getColorPreferences(language),
            iconography: 'Culturally appropriate symbols',
            typography: getPreferredFonts(language)
        },
        interaction_patterns: {
            navigation_style: getNavigationPreferences(language),
            input_methods: getInputMethodPreferences(language),
            information_hierarchy: getInformationHierarchy(language)
        },
        accessibility_features: {
            screen_reader_support: true,
            high_contrast_mode: true,
            font_size_adjustment: true,
            offline_capability: true
        }
    };
}

function getTermDefinition(term, language) {
    const definitions = {
        'irrigation': {
            'en': 'The artificial application of water to crops',
            'ha': 'Ba da ruwa ga amfanin gona ta hanyar hannu',
            'fr': 'L\'application artificielle d\'eau aux cultures'
        }
    };
    
    return definitions[term]?.[language] || 'Definition not available';
}

// Additional helper functions for localization would be implemented...

function getLocalDateFormat(language) {
    const formats = {
        'en': 'MM/DD/YYYY',
        'fr': 'DD/MM/YYYY',
        'ha': 'DD/MM/YYYY',
        'ar': 'DD/MM/YYYY'
    };
    return formats[language] || 'DD/MM/YYYY';
}

function getLocalNumberFormat(language) {
    const formats = {
        'en': '1,234.56',
        'fr': '1 234,56',
        'ha': '1,234.56',
        'ar': '١٢٣٤.٥٦'
    };
    return formats[language] || '1,234.56';
}

function getLocalCurrency(region) {
    const currencies = {
        'West Africa': ['XOF', 'NGN', 'GHS', 'SLL'],
        'East Africa': ['KES', 'UGX', 'TZS', 'ETB'],
        'Central Africa': ['XAF', 'CDF'],
        'North Africa': ['EGP', 'MAD', 'TND', 'DZD'],
        'Southern Africa': ['ZAR', 'BWP', 'ZMW']
    };
    return currencies[region] || ['USD'];
}

function getLocalUnits(region) {
    return {
        distance: 'kilometers',
        area: 'hectares',
        weight: 'kilograms',
        temperature: 'celsius',
        rainfall: 'millimeters'
    };
}

function getColorPreferences(language) {
    // Cultural color preferences for UI design
    const preferences = {
        'ha': ['green', 'white', 'blue'], // Islamic preferences
        'ig': ['green', 'red', 'black'], // Traditional colors
        'yo': ['green', 'yellow', 'red'], // Traditional colors
        'fr': ['blue', 'white', 'red'], // French influence
        'ar': ['green', 'white', 'gold'], // Islamic preferences
    };
    return preferences[language] || ['green', 'blue', 'white'];
}

function getPreferredFonts(language) {
    const fonts = {
        'en': 'Arial, Helvetica, sans-serif',
        'fr': 'Arial, Helvetica, sans-serif',
        'ha': 'Arial Unicode MS, sans-serif',
        'ar': 'Tahoma, Arial Unicode MS, sans-serif',
        'am': 'Nyala, Arial Unicode MS, sans-serif'
    };
    return fonts[language] || 'Arial, sans-serif';
}

function getNavigationPreferences(language) {
    const preferences = {
        'ar': 'right-to-left',
        'ha': 'left-to-right',
        'en': 'left-to-right',
        'fr': 'left-to-right'
    };
    return preferences[language] || 'left-to-right';
}

function getInputMethodPreferences(language) {
    return {
        keyboard_layout: language === 'ar' ? 'arabic' : 'qwerty',
        voice_input: true,
        gesture_support: true,
        predictive_text: true
    };
}

function getInformationHierarchy(language) {
    // How information should be prioritized based on cultural context
    return {
        primary: 'practical_actions',
        secondary: 'detailed_explanations',
        tertiary: 'background_information'
    };
}

module.exports = router;
