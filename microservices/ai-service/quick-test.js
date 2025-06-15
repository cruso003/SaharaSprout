#!/usr/bin/env node

const axios = require('axios');

// Test configuration
const API_GATEWAY_URL = 'http://localhost:3009';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MThlNTg3Ni01Zjc0LTQxZGItOTAzZS00NmU0YmQ1NjczZWMiLCJlbWFpbCI6ImFkbWluQHNhaGFyYXNwcm91dC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDk5NDk3NzksImV4cCI6MTc1MDAzNjE3OX0.TQb6L95EtRnrvWEOw2Vk627GCOxyVMX_4_ogrMhLO28';

async function testToken() {
  console.log('🔑 Testing JWT Token...');
  
  // Decode token to check expiry
  const tokenParts = AUTH_TOKEN.split('.');
  const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
  const expiry = new Date(payload.exp * 1000);
  const now = new Date();
  
  console.log(`Token expires: ${expiry}`);
  console.log(`Current time: ${now}`);
  console.log(`Token valid: ${expiry > now ? '✅' : '❌'}`);
  
  if (expiry <= now) {
    console.log('❌ Token is expired! Need a new token.');
    return;
  }
  
  // Test health endpoint
  try {
    console.log('\n🏥 Testing Health...');
    const healthResponse = await axios.get(`${API_GATEWAY_URL}/api/ai/health`);
    console.log('✅ Health check passed:', healthResponse.status);
  } catch (error) {
    console.log('❌ Health check failed:', error.response?.status, error.response?.data);
  }
  
  // Test authenticated endpoint
  try {
    console.log('\n🔐 Testing Authenticated Endpoint...');
    const authResponse = await axios.get(`${API_GATEWAY_URL}/api/ai/irrigation/analytics/efficiency?farmId=123e4567-e89b-12d3-a456-426614174000&period=7d`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Auth test passed:', authResponse.status);
    console.log('Response:', authResponse.data);
  } catch (error) {
    console.log('❌ Auth test failed:', error.response?.status);
    console.log('Error details:', error.response?.data);
  }
  
  // Test ESP32 endpoints with correct field names
  try {
    console.log('\n🌡️ Testing ESP32 Data Ingestion...');
    
    // Test irrigation data
    const irrigationData = {
      farmId: '123e4567-e89b-12d3-a456-426614174000',
      zoneId: 'zone_1',
      deviceId: 'ESP32_001',
      moistureLevel: 35.8,
      waterFlowRate: 2.5,
      durationMinutes: 30,
      temperature: 25.4,
      humidity: 65.0,
      pumpStatus: 'on',
      valveStatus: 'open',
      timestamp: new Date().toISOString()
    };
    
    const irrigationResponse = await axios.post(`${API_GATEWAY_URL}/api/ai/data/esp32/irrigation-data`, irrigationData);
    console.log('✅ ESP32 Irrigation test passed:', irrigationResponse.status);
    console.log('Response:', irrigationResponse.data);
    
    // Test NPK data
    const npkData = {
      farmId: '123e4567-e89b-12d3-a456-426614174000',
      zoneId: 'zone_1',
      deviceId: 'ESP32_001',
      nitrogenLevel: 45.2,
      phosphorusLevel: 12.8,
      potassiumLevel: 38.5,
      phLevel: 6.8,
      moistureLevel: 35.2,
      temperature: 22.5,
      conductivity: 0.5,
      timestamp: new Date().toISOString()
    };
    
    const npkResponse = await axios.post(`${API_GATEWAY_URL}/api/ai/data/esp32/npk-data`, npkData);
    console.log('✅ ESP32 NPK test passed:', npkResponse.status);
    console.log('Response:', npkResponse.data);
    
    // Test heartbeat
    const heartbeatData = {
      farmId: '123e4567-e89b-12d3-a456-426614174000',
      deviceId: 'ESP32_001',
      status: 'online',
      batteryLevel: 85,
      signalStrength: 75,
      memoryUsage: 45,
      cpuTemperature: 42.3,
      firmwareVersion: '1.2.3',
      timestamp: new Date().toISOString()
    };
    
    const heartbeatResponse = await axios.post(`${API_GATEWAY_URL}/api/ai/data/esp32/heartbeat`, heartbeatData);
    console.log('✅ ESP32 Heartbeat test passed:', heartbeatResponse.status);
    console.log('Response:', heartbeatResponse.data);
    
  } catch (error) {
    console.log('❌ ESP32 test failed:', error.response?.status);
    console.log('Error details:', error.response?.data);
  }
}

testToken().catch(console.error);
