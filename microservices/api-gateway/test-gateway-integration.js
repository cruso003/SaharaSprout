#!/usr/bin/env node

/**
 * API Gateway Integration Test
 * 
 * Tests the API Gateway routing to the Product Service
 * to ensure proper microservice communication.
 */

const axios = require('axios');
const colors = require('colors');

// Configuration
const GATEWAY_URL = 'http://localhost:3009';
const DIRECT_PRODUCT_URL = 'http://localhost:3011';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Utility functions
const log = {
    info: (msg) => console.log(colors.blue('ℹ '), msg),
    success: (msg) => console.log(colors.green('✓'), msg),
    error: (msg) => console.log(colors.red('✗'), msg),
    warning: (msg) => console.log(colors.yellow('⚠'), msg),
    section: (msg) => console.log(colors.cyan('\n' + '='.repeat(60) + '\n' + msg + '\n' + '='.repeat(60)))
};

// Test framework
async function runTest(testName, testFunction) {
    totalTests++;
    try {
        log.info(`Running: ${testName}`);
        await testFunction();
        passedTests++;
        log.success(`PASSED: ${testName}`);
        return true;
    } catch (error) {
        failedTests++;
        log.error(`FAILED: ${testName}`);
        log.error(`Error: ${error.message}`);
        if (error.response && error.response.data) {
            log.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
        }
        return false;
    }
}

// HTTP client with timeout
const createClient = (baseURL) => axios.create({
    baseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SaharaSprout-Gateway-Test/1.0'
    }
});

const gatewayClient = createClient(GATEWAY_URL);
const directClient = createClient(DIRECT_PRODUCT_URL);

// Test helper functions
function expectStatus(response, expectedStatus) {
    if (response.status !== expectedStatus) {
        throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);
    }
}

function expectSameResponse(gatewayResponse, directResponse) {
    // Create copies without timestamp and uptime for comparison
    const gatewayData = { ...gatewayResponse.data };
    const directData = { ...directResponse.data };
    
    // Remove timestamp and uptime fields that will always differ
    delete gatewayData.timestamp;
    delete gatewayData.uptime;
    delete directData.timestamp;
    delete directData.uptime;
    
    if (JSON.stringify(gatewayData) !== JSON.stringify(directData)) {
        throw new Error('Gateway and direct responses differ');
    }
}

// Test suites
async function testGatewayHealth() {
    log.section('Testing API Gateway Health');

    await runTest('Gateway Health Check', async () => {
        const response = await gatewayClient.get('/health');
        expectStatus(response, 200);
        if (!response.data.status || response.data.status !== 'healthy') {
            throw new Error('Gateway health check failed');
        }
    });

    await runTest('Gateway Service Info', async () => {
        const response = await gatewayClient.get('/api');
        expectStatus(response, 200);
        if (!response.data.services || !response.data.services.includes('products')) {
            throw new Error('Product service not listed in gateway services');
        }
    });
}

async function testProductServiceRouting() {
    log.section('Testing Product Service Routing');

    await runTest('Gateway → Product Service: Health Check', async () => {
        const gatewayResponse = await gatewayClient.get('/api/products/health');
        const directResponse = await directClient.get('/health');
        
        expectStatus(gatewayResponse, 200);
        expectStatus(directResponse, 200);
        expectSameResponse(gatewayResponse, directResponse);
    });

    await runTest('Gateway → Product Service: Get Products', async () => {
        const gatewayResponse = await gatewayClient.get('/api/products');
        const directResponse = await directClient.get('/api/products');
        
        expectStatus(gatewayResponse, 200);
        expectStatus(directResponse, 200);
        expectSameResponse(gatewayResponse, directResponse);
    });

    await runTest('Gateway → Product Service: Get Categories', async () => {
        const gatewayResponse = await gatewayClient.get('/api/categories');
        const directResponse = await directClient.get('/api/categories');
        
        expectStatus(gatewayResponse, 200);
        expectStatus(directResponse, 200);
        expectSameResponse(gatewayResponse, directResponse);
    });

    await runTest('Gateway → Product Service: Search Products', async () => {
        const gatewayResponse = await gatewayClient.get('/api/products/search?q=tomato');
        const directResponse = await directClient.get('/api/products/search?q=tomato');
        
        expectStatus(gatewayResponse, 200);
        expectStatus(directResponse, 200);
        expectSameResponse(gatewayResponse, directResponse);
    });
}

async function testErrorHandling() {
    log.section('Testing Error Handling');

    await runTest('Gateway → Product Service: 404 Error', async () => {
        try {
            await gatewayClient.get('/api/products/definitely/nonexistent/route');
            throw new Error('Should have returned 404');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return; // Expected
            }
            throw error;
        }
    });

    await runTest('Gateway → Product Service: Invalid Product ID', async () => {
        try {
            await gatewayClient.get('/api/products/invalid-id');
            throw new Error('Should have returned 400');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                return; // Expected
            }
            throw error;
        }
    });
}

async function testResponseHeaders() {
    log.section('Testing Response Headers');

    await runTest('Gateway Headers: CORS', async () => {
        const response = await gatewayClient.get('/api/products');
        expectStatus(response, 200);
        
        // Check for basic CORS headers (these might be added by the gateway)
        if (!response.headers['content-type'].includes('application/json')) {
            throw new Error('Content-Type should be application/json');
        }
    });

    await runTest('Gateway Headers: Response Time', async () => {
        const start = Date.now();
        const response = await gatewayClient.get('/api/products');
        const responseTime = Date.now() - start;
        
        expectStatus(response, 200);
        if (responseTime > 5000) { // 5 seconds
            throw new Error(`Response time too slow: ${responseTime}ms`);
        }
        log.info(`Response time: ${responseTime}ms`);
    });
}

async function testCategoryRouting() {
    log.section('Testing Category Service Routing');

    await runTest('Gateway → Category Hierarchy', async () => {
        const response = await gatewayClient.get('/api/categories/hierarchy');
        expectStatus(response, 200);
        if (!response.data.success) {
            throw new Error('Category hierarchy request failed');
        }
    });

    await runTest('Gateway → Popular Categories', async () => {
        const response = await gatewayClient.get('/api/categories/popular');
        expectStatus(response, 200);
        if (!response.data.success) {
            throw new Error('Popular categories request failed');
        }
    });
}

// Main test runner
async function runAllTests() {
    console.log(colors.cyan(`
╔══════════════════════════════════════════════════════════════╗
║                 API Gateway Integration Test                 ║
║            Product Service Routing Verification             ║
╚══════════════════════════════════════════════════════════════╝
    `));

    const startTime = Date.now();

    try {
        // Test suites
        await testGatewayHealth();
        await testProductServiceRouting();
        await testCategoryRouting();
        await testErrorHandling();
        await testResponseHeaders();

    } catch (error) {
        log.error(`Test suite failed: ${error.message}`);
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Print final results
    console.log(colors.cyan('\n' + '='.repeat(60)));
    console.log(colors.cyan('INTEGRATION TEST RESULTS'));
    console.log(colors.cyan('='.repeat(60)));
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(colors.green(`Passed: ${passedTests}`));
    console.log(colors.red(`Failed: ${failedTests}`));
    console.log(`Duration: ${duration}s`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests === 0) {
        console.log(colors.green('\n🎉 All tests passed! API Gateway is working perfectly with Product Service.'));
    } else if (passedTests > failedTests) {
        console.log(colors.yellow('\n⚠️  Some tests failed. Please check the errors above.'));
    } else {
        console.log(colors.red('\n❌ Many tests failed. Gateway integration needs attention.'));
    }

    console.log(colors.cyan('\n' + '='.repeat(60)));

    // Exit with appropriate code
    process.exit(failedTests > 0 ? 1 : 0);
}

// Handle script execution
if (require.main === module) {
    // Check if services are running
    Promise.all([
        gatewayClient.get('/health').catch(() => null),
        directClient.get('/health').catch(() => null)
    ]).then(([gatewayHealth, productHealth]) => {
        if (!gatewayHealth) {
            log.error('API Gateway is not responding!');
            log.error('Please ensure the gateway is running on http://localhost:3009');
            process.exit(1);
        }
        
        if (!productHealth) {
            log.error('Product Service is not responding!');
            log.error('Please ensure the product service is running on http://localhost:3011');
            process.exit(1);
        }

        log.success('Both API Gateway and Product Service are running. Starting integration tests...\n');
        runAllTests();
    }).catch((error) => {
        log.error('Failed to connect to services:');
        log.error(error.message);
        process.exit(1);
    });
}

module.exports = {
    runAllTests,
    testGatewayHealth,
    testProductServiceRouting,
    testCategoryRouting
};
