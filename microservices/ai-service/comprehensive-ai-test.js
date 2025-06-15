#!/usr/bin/env node

/**
 * Comprehensive AI Service Test Suite
 * Tests all AI endpoints systematically to identify and fix issues
 */

const axios = require('axios');
const fs = require('fs');

// Configuration
const API_GATEWAY_URL = 'http://localhost:3009';
const AI_SERVICE_DIRECT_URL = 'http://localhost:3016';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MThlNTg3Ni01Zjc0LTQxZGItOTAzZS00NmU0YmQ1NjczZWMiLCJlbWFpbCI6ImFkbWluQHNhaGFyYXNwcm91dC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDk5NDk3NzksImV4cCI6MTc1MDAzNjE3OX0.TQb6L95EtRnrvWEOw2Vk627GCOxyVMX_4_ogrMhLO28';

// Test data
const TEST_DATA = {
  farm: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Farm',
    location: 'Margibi',
    country: 'Liberia'
  },
  device: {
    id: 'ESP32_001',
    farm_id: '123e4567-e89b-12d3-a456-426614174000'
  },
  crop: {
    id: 'crop_001',
    type: 'maize',
    variety: 'hybrid',
    stage: 'flowering'
  },
  weather: {
    latitude: -1.2921,
    longitude: 36.8219
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logSection(message) {
  log(`\n🔍 ${message}`, 'cyan');
}

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  results: [],
  errors: []
};

async function makeRequest(method, endpoint, data = null, useGateway = true) {
  const baseUrl = useGateway ? API_GATEWAY_URL : AI_SERVICE_DIRECT_URL;
  const url = `${baseUrl}${endpoint}`;
  
  try {
    const config = {
      method,
      url,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.data = data;
    }
    
    const response = await axios(config);
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 0,
      data: error.response?.data || { message: error.message },
      error: error.message
    };
  }
}

function recordTestResult(testName, success, details = {}) {
  testResults.totalTests++;
  if (success) {
    testResults.passedTests++;
    logSuccess(`${testName}`);
  } else {
    testResults.failedTests++;
    logError(`${testName}`);
    testResults.errors.push({
      testName,
      ...details
    });
  }
  
  testResults.results.push({
    testName,
    success,
    timestamp: new Date().toISOString(),
    ...details
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testHealthEndpoints() {
  logSection('Testing Health Endpoints');
  
  // Test API Gateway health
  const gatewayHealth = await makeRequest('GET', '/health', null, true);
  recordTestResult(
    'API Gateway Health Check',
    gatewayHealth.success,
    { endpoint: '/health', response: gatewayHealth }
  );
  
  // Test AI Service health through gateway  
  const aiHealthGateway = await makeRequest('GET', '/api/ai/health', null, true);
  recordTestResult(
    'AI Service Health (via Gateway)',
    aiHealthGateway.success,
    { endpoint: '/api/ai/health', response: aiHealthGateway }
  );
  
  // Test AI Service health directly
  const aiHealthDirect = await makeRequest('GET', '/health', null, false);
  recordTestResult(
    'AI Service Health (Direct)',
    aiHealthDirect.success,
    { endpoint: '/health', response: aiHealthDirect }
  );
}

async function testESP32DataIngestion() {
  logSection('Testing ESP32 Data Ingestion');
  
  // Test irrigation data ingestion
  const irrigationData = {
    farmId: TEST_DATA.farm.id,
    zoneId: 'zone_1',
    deviceId: TEST_DATA.device.id,
    moistureLevel: 35.8,
    waterFlowRate: 2.5,
    durationMinutes: 30,
    temperature: 25.4,
    humidity: 65.0,
    pumpStatus: 'on',
    valveStatus: 'open',
    timestamp: new Date().toISOString()
  };
  
  const irrigationTest = await makeRequest('POST', '/api/ai/data/esp32/irrigation-data', irrigationData);
  recordTestResult(
    'ESP32 Irrigation Data Ingestion',
    irrigationTest.success && [200, 201].includes(irrigationTest.status),
    { endpoint: '/api/ai/data/esp32/irrigation-data', response: irrigationTest }
  );
  
  // Test NPK data ingestion
  const npkData = {
    farmId: TEST_DATA.farm.id,
    zoneId: 'zone_1',
    deviceId: TEST_DATA.device.id,
    nitrogenLevel: 45.2,
    phosphorusLevel: 12.8,
    potassiumLevel: 38.5,
    phLevel: 6.8,
    moistureLevel: 35.2,
    temperature: 22.5,
    conductivity: 0.5,
    timestamp: new Date().toISOString()
  };
  
  const npkTest = await makeRequest('POST', '/api/ai/data/esp32/npk-data', npkData);
  recordTestResult(
    'ESP32 NPK Data Ingestion',
    npkTest.success && [200, 201].includes(npkTest.status),
    { endpoint: '/api/ai/data/esp32/npk-data', response: npkTest }
  );
  
  // Test device heartbeat
  const heartbeatData = {
    farmId: TEST_DATA.farm.id,
    deviceId: TEST_DATA.device.id,
    status: 'online',
    batteryLevel: 85,
    signalStrength: 75,
    memoryUsage: 45,
    cpuTemperature: 42.3,
    firmwareVersion: '1.2.3',
    timestamp: new Date().toISOString()
  };
  
  const heartbeatTest = await makeRequest('POST', '/api/ai/data/esp32/heartbeat', heartbeatData);
  recordTestResult(
    'ESP32 Device Heartbeat',
    heartbeatTest.success && [200, 201].includes(heartbeatTest.status),
    { endpoint: '/api/ai/data/esp32/heartbeat', response: heartbeatTest }
  );
  
  await delay(1000); // Rate limit buffer
}

async function testIrrigationIntelligence() {
  logSection('Testing Irrigation Intelligence');
  
  // Test irrigation efficiency analytics
  const efficiencyTest = await makeRequest(
    'GET', 
    `/api/ai/irrigation/analytics/efficiency?farmId=${TEST_DATA.farm.id}&period=7d`
  );
  recordTestResult(
    'Irrigation Efficiency Analytics',
    efficiencyTest.success && efficiencyTest.status === 200,
    { endpoint: '/api/ai/irrigation/analytics/efficiency', response: efficiencyTest }
  );
  
  // Test soil health analytics
  const soilHealthTest = await makeRequest(
    'GET',
    `/api/ai/irrigation/analytics/soil-health?farmId=${TEST_DATA.farm.id}&zoneId=zone_1`
  );
  recordTestResult(
    'Soil Health Analytics',
    soilHealthTest.success && soilHealthTest.status === 200,
    { endpoint: '/api/ai/irrigation/analytics/soil-health', response: soilHealthTest }
  );
  
  // Test water usage predictions
  const waterPredictionTest = await makeRequest(
    'GET',
    `/api/ai/irrigation/predictions/water-usage?farmId=${TEST_DATA.farm.id}&cropType=${TEST_DATA.crop.type}&days=7`
  );
  recordTestResult(
    'Water Usage Predictions',
    waterPredictionTest.success && waterPredictionTest.status === 200,
    { endpoint: '/api/ai/irrigation/predictions/water-usage', response: waterPredictionTest }
  );
  
  // Test irrigation schedule optimization
  const scheduleOptimizationData = {
    farmId: TEST_DATA.farm.id,
    zoneId: 'zone_1',
    cropType: TEST_DATA.crop.type,
    soilType: 'loamy',
    currentMoisture: 30,
    weatherForecast: '7day'
  };
  
  const scheduleTest = await makeRequest('POST', '/api/ai/irrigation/optimize/irrigation-schedule', scheduleOptimizationData);
  recordTestResult(
    'Irrigation Schedule Optimization',
    scheduleTest.success && scheduleTest.status === 200,
    { endpoint: '/api/ai/irrigation/optimize/irrigation-schedule', response: scheduleTest }
  );
  
  await delay(2000); // Rate limit buffer
}

async function testCropManagement() {
  logSection('Testing Crop Management');
  
  // Test crop recommendations
  const cropRecommendationsTest = await makeRequest(
    'GET',
    `/api/ai/crops/recommendations?farmId=${TEST_DATA.farm.id}&soilType=loamy&season=dry`
  );
  recordTestResult(
    'Crop Recommendations',
    cropRecommendationsTest.success && cropRecommendationsTest.status === 200,
    { endpoint: '/api/ai/crops/recommendations', response: cropRecommendationsTest }
  );
  
  // Test crop growth tracking
  const growthTrackingData = {
    farmId: TEST_DATA.farm.id,
    cropId: TEST_DATA.crop.id,
    growthStage: TEST_DATA.crop.stage,
    environmentalData: {
      temperature: 28,
      humidity: 65,
      soilMoisture: 35
    }
  };
  
  const growthTrackingTest = await makeRequest('POST', '/api/ai/crops/growth/track', growthTrackingData);
  recordTestResult(
    'Crop Growth Tracking',
    growthTrackingTest.success && growthTrackingTest.status === 200,
    { endpoint: '/api/ai/crops/growth/track', response: growthTrackingTest }
  );
  
  // Test pest and disease analysis
  const pestAnalysisData = {
    farmId: TEST_DATA.farm.id,
    cropType: TEST_DATA.crop.type,
    symptoms: ['yellow_leaves', 'brown_spots'],
    environmentalConditions: {
      temperature: 30,
      humidity: 80,
      rainfall: 'moderate'
    }
  };
  
  const pestAnalysisTest = await makeRequest('POST', '/api/ai/crops/pest-disease/analyze', pestAnalysisData);
  recordTestResult(
    'Pest and Disease Analysis',
    pestAnalysisTest.success && pestAnalysisTest.status === 200,
    { endpoint: '/api/ai/crops/pest-disease/analyze', response: pestAnalysisTest }
  );
  
  await delay(2000); // Rate limit buffer
}

async function testWeatherIntegration() {
  logSection('Testing Weather Integration');
  
  // Test weather farming recommendations
  const weatherRecommendationsTest = await makeRequest(
    'GET',
    `/api/ai/weather/farming-recommendations?latitude=${TEST_DATA.weather.latitude}&longitude=${TEST_DATA.weather.longitude}&cropType=${TEST_DATA.crop.type}`
  );
  recordTestResult(
    'Weather Farming Recommendations',
    weatherRecommendationsTest.success && weatherRecommendationsTest.status === 200,
    { endpoint: '/api/ai/weather/farming-recommendations', response: weatherRecommendationsTest }
  );
  
  await delay(3000); // Longer delay for weather API
}

async function testMarketIntelligence() {
  logSection('Testing Market Intelligence');
  
  // Test market analysis
  const marketAnalysisData = {
    farmId: TEST_DATA.farm.id,
    cropType: TEST_DATA.crop.type,
    region: TEST_DATA.farm.country,
    analysisType: 'price_prediction'
  };
  
  const marketTest = await makeRequest('POST', '/api/ai/market/analysis', marketAnalysisData);
  recordTestResult(
    'Market Analysis',
    marketTest.success && marketTest.status === 200,
    { endpoint: '/api/ai/market/analysis', response: marketTest }
  );
  
  await delay(3000); // Longer delay for market API
}

async function testLanguageSupport() {
  logSection('Testing Multi-Language Support');
  
  // Test text translation
  const translationData = {
    text: 'Your crops need water',
    sourceLanguage: 'en',
    targetLanguage: 'sw',
    context: 'agriculture'
  };
  
  const translationTest = await makeRequest('POST', '/api/ai/language/translate', translationData);
  recordTestResult(
    'Text Translation',
    translationTest.success && translationTest.status === 200,
    { endpoint: '/api/ai/language/translate', response: translationTest }
  );
  
  await delay(2000); // Rate limit buffer
}

async function runComprehensiveTests() {
  log('🚀 Starting Comprehensive AI Service Test Suite', 'cyan');
  log(`Gateway URL: ${API_GATEWAY_URL}`, 'blue');
  log(`AI Service URL: ${AI_SERVICE_DIRECT_URL}`, 'blue');
  log('============================================================', 'cyan');
  
  try {
    // Run all test categories
    await testHealthEndpoints();
    await testESP32DataIngestion();
    await testIrrigationIntelligence();
    await testCropManagement();
    await testWeatherIntegration();
    await testMarketIntelligence();
    await testLanguageSupport();
    
    // Save results
    fs.writeFileSync(
      '/Users/henrique/SaharaSprout/microservices/ai-service/comprehensive-test-results.json',
      JSON.stringify(testResults, null, 2)
    );
    
    // Print summary
    log('\n📋 Comprehensive Test Summary', 'cyan');
    log('==================================================', 'cyan');
    log(`Total Tests: ${testResults.totalTests}`, 'blue');
    log(`Passed: ${testResults.passedTests}`, 'green');
    log(`Failed: ${testResults.failedTests}`, 'red');
    log(`Success Rate: ${((testResults.passedTests / testResults.totalTests) * 100).toFixed(1)}%`, 'blue');
    
    if (testResults.errors.length > 0) {
      log('\n❌ Failed Tests:', 'red');
      testResults.errors.forEach((error, index) => {
        log(`${index + 1}. ${error.testName}`, 'red');
        if (error.response) {
          log(`   Status: ${error.response.status}`, 'yellow');
          if (error.response.data) {
            log(`   Details: ${JSON.stringify(error.response.data, null, 2)}`, 'yellow');
          }
        }
      });
    }
    
    // Recommendations
    log('\n🎯 Recommendations:', 'cyan');
    if (testResults.failedTests === 0) {
      logSuccess('All tests passed! AI service is fully functional.');
      logInfo('Ready to proceed with product service implementation.');
    } else if (testResults.failedTests < testResults.totalTests / 2) {
      log('Most tests passed. Fix remaining issues before proceeding.', 'yellow');
    } else {
      log('Many tests failed. Significant AI service fixes needed.', 'red');
    }
    
  } catch (error) {
    logError(`Test suite failed: ${error.message}`);
  }
}

// Run the comprehensive test suite
runComprehensiveTests().catch(console.error);
