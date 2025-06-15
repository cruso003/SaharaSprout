# AI Service Test Suite

This directory contains comprehensive tests for the SaharaSprout AI Service to ensure all functionality works correctly through the API Gateway.

## Overview

The test suite validates:
- ✅ Health endpoints (Gateway + AI Service)
- 🌡️ ESP32 data ingestion (irrigation, NPK, water flow, heartbeat)
- 💧 Irrigation intelligence (optimization, prediction, scheduling)
- 🌱 Crop management (health analysis, growth prediction, harvest timing)
- 🌤️ Weather integration (insights, alerts)
- 🌍 Multi-language support (translation, localized content)
- 📊 Farm analytics (performance, yield prediction)
- 💰 Market intelligence (analysis, price prediction)

## Prerequisites

Before running the tests, ensure:

1. **AI Service is running** on port 3016
   ```bash
   cd /Users/henrique/SaharaSprout/microservices/ai-service
   npm start
   ```

2. **API Gateway is running** on port 3009
   ```bash
   cd /Users/henrique/SaharaSprout/microservices/api-gateway
   npm start
   ```

3. **Database is accessible** (PostgreSQL on port 5433)
4. **Redis is running** (port 6379)

## Running Tests

### Option 1: Full Test Suite with Automated Checks
```bash
npm run test:integration
```
This will:
- Check if services are running
- Install dependencies if needed
- Run all tests
- Generate detailed results

### Option 2: Direct Test Execution
```bash
npm run test:ai
```
or
```bash
node test-ai-endpoints.js
```

### Option 3: Manual Script Execution
```bash
./run-tests.sh
```

## Test Results

After running tests, you'll get:

1. **Console Output**: Real-time test results with color-coded status
2. **test-results.json**: Detailed JSON report with all test data
3. **Exit Code**: 0 for success, 1 for failures

## Expected Output

```
🚀 Starting AI Service Comprehensive Test Suite
Gateway URL: http://localhost:3009
AI Service URL: http://localhost:3016
============================================================

🏥 Testing Health Endpoints
✅ API Gateway Health Check
✅ AI Service Health (via Gateway)
✅ AI Service Health (Direct)

🌡️ Testing ESP32 Data Ingestion
✅ ESP32 Irrigation Data Ingestion
✅ ESP32 NPK Data Ingestion
✅ ESP32 Water Flow Data Ingestion
✅ ESP32 Device Heartbeat

💧 Testing Irrigation Intelligence
✅ Irrigation Optimization
✅ Water Requirement Prediction
✅ Irrigation Schedule Generation

🌱 Testing Crop Management
✅ Crop Health Analysis
✅ Growth Stage Prediction
✅ Harvest Timing Prediction

🌤️ Testing Weather Integration
✅ Weather Insights Generation
✅ Weather Alerts

🌍 Testing Multi-Language Support
✅ Text Translation
✅ Localized Content Generation

📊 Testing Farm Analytics
✅ Farm Performance Analytics
✅ Yield Prediction

💰 Testing Market Intelligence
✅ Market Analysis
✅ Price Prediction

📋 Test Summary
==================================================
Total Tests: 20
Passed: 20
Failed: 0
Success Rate: 100.0%

🎯 Recommendations:
✅ All tests passed! AI service is ready for production.
✅ You can proceed with product service implementation.
```

## Test Data

The tests use predefined test data:
- **Farm ID**: `123e4567-e89b-12d3-a456-426614174000`
- **Device ID**: `ESP32_001`
- **Location**: Kenya (Nairobi coordinates)
- **Crop Type**: Maize (hybrid variety)
- **Growth Stage**: Flowering

## Troubleshooting

### Common Issues

1. **Services Not Running**
   ```
   ⚠️ AI Service is not running on port 3016
   ```
   **Solution**: Start the AI service first

2. **Connection Refused**
   ```
   ❌ Error: connect ECONNREFUSED
   ```
   **Solution**: Check if PostgreSQL and Redis are running

3. **Database Errors**
   ```
   ❌ Database connection failed
   ```
   **Solution**: Verify database credentials in .env file

4. **API Gateway Proxy Issues**
   ```
   ❌ 502 Bad Gateway
   ```
   **Solution**: Restart API Gateway service

### Debugging

Enable detailed logging by setting:
```bash
export LOG_LEVEL=debug
```

### Test Specific Endpoints

To test specific functionality, modify the test file or use curl:

```bash
# Test health endpoint
curl http://localhost:3009/api/ai/health

# Test irrigation data
curl -X POST http://localhost:3009/api/ai/data/esp32/irrigation-data \
  -H "Content-Type: application/json" \
  -d '{"device_id":"ESP32_001","farm_id":"123e4567-e89b-12d3-a456-426614174000","irrigation_amount":25.5}'
```

## Integration with CI/CD

This test suite can be integrated into CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Test AI Service
  run: |
    cd microservices/ai-service
    npm run test:integration
```

## Contributing

When adding new AI endpoints:
1. Add corresponding tests to `test-ai-endpoints.js`
2. Update the test data if needed
3. Run the full test suite to ensure compatibility
4. Update this README with new test categories

## Files

- `test-ai-endpoints.js` - Main test suite
- `run-tests.sh` - Automated test runner with service checks
- `test-results.json` - Generated test results (after running tests)
- `TEST_SUITE.md` - This documentation
