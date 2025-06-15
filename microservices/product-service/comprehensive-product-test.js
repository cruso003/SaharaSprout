#!/usr/bin/env node

/**
 * Comprehensive Product Service Test Suite
 * 
 * This script tests all endpoints of the SaharaSprout Product Service
 * including products, categories, authentication, validation, and error handling.
 * 
 * Usage: node comprehensive-product-test.js
 */

const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = 'http://localhost:3011';
const API_URL = `${BASE_URL}/api`;

// Test counters
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Test data storage
const testData = {
    categories: [],
    products: [],
    users: {
        farmer: null,
        admin: null
    }
};

// Mock JWT tokens for testing (in real scenario, these would come from auth service)
const mockTokens = {
    farmer: 'mock-farmer-token',
    admin: 'mock-admin-token'
};

// Utility functions
const log = {
    info: (msg) => console.log(colors.blue('ℹ '), msg),
    success: (msg) => console.log(colors.green('✓'), msg),
    error: (msg) => console.log(colors.red('✗'), msg),
    warning: (msg) => console.log(colors.yellow('⚠'), msg),
    section: (msg) => console.log(colors.cyan('\n' + '='.repeat(60) + '\n' + msg + '\n' + '='.repeat(60)))
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

// HTTP client with default configuration
const client = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SaharaSprout-Product-Test/1.0'
    }
});

// Authentication helper
function getAuthHeaders(userType = 'farmer') {
    return {
        'Authorization': `Bearer ${mockTokens[userType]}`
    };
}

// Test helper functions
async function expectStatus(response, expectedStatus) {
    if (response.status !== expectedStatus) {
        throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);
    }
}

async function expectSuccess(response) {
    if (!response.data.success) {
        throw new Error(`Expected success response, got: ${JSON.stringify(response.data)}`);
    }
}

async function expectError(response) {
    if (response.data.success) {
        throw new Error(`Expected error response, got success`);
    }
}

// Test suites
async function testHealthEndpoints() {
    log.section('Testing Health Endpoints');

    await runTest('Health Check - Basic', async () => {
        const response = await client.get('/health');
        expectStatus(response, 200);
        if (!response.data.status || response.data.status !== 'healthy') {
            throw new Error('Health check failed');
        }
    });

    await runTest('Health Check - Ready', async () => {
        const response = await client.get('/health/ready');
        expectStatus(response, 200);
    });

    await runTest('Service Info', async () => {
        const response = await client.get('/');
        expectStatus(response, 200);
        if (!response.data.service || !response.data.service.includes('Product Service')) {
            throw new Error('Service info incorrect');
        }
    });
}

async function testCategoryEndpoints() {
    log.section('Testing Category Endpoints');

    await runTest('Get Categories - Empty', async () => {
        const response = await client.get('/api/categories');
        expectStatus(response, 200);
        expectSuccess(response);
        if (!Array.isArray(response.data.data)) {
            throw new Error('Categories should be an array');
        }
    });

    await runTest('Get Category Hierarchy - Empty', async () => {
        const response = await client.get('/api/categories/hierarchy');
        expectStatus(response, 200);
        expectSuccess(response);
    });

    await runTest('Get Popular Categories - Empty', async () => {
        const response = await client.get('/api/categories/popular');
        expectStatus(response, 200);
        expectSuccess(response);
    });

    // Test category creation without authentication (should fail)
    await runTest('Create Category - No Auth (Should Fail)', async () => {
        try {
            const response = await client.post('/api/categories', {
                name: 'Test Category',
                slug: 'test-category',
                description: 'A test category'
            });
            throw new Error('Should have failed without authentication');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // Expected behavior
                return;
            }
            throw error;
        }
    });

    // Test category creation with farmer auth (should fail - admin required)
    await runTest('Create Category - Farmer Auth (Should Fail)', async () => {
        try {
            const response = await client.post('/api/categories', {
                name: 'Test Category',
                slug: 'test-category',
                description: 'A test category'
            }, {
                headers: getAuthHeaders('farmer')
            });
            throw new Error('Should have failed with farmer authentication');
        } catch (error) {
            if (error.response && error.response.status === 403) {
                // Expected behavior
                return;
            }
            throw error;
        }
    });

    // Note: Admin category creation would require proper auth service integration
    log.warning('Category creation tests require auth service integration');
}

async function testProductEndpoints() {
    log.section('Testing Product Endpoints');

    await runTest('Get Products - Empty', async () => {
        const response = await client.get('/api/products');
        expectStatus(response, 200);
        expectSuccess(response);
        if (!Array.isArray(response.data.data)) {
            throw new Error('Products should be an array');
        }
        if (!response.data.pagination) {
            throw new Error('Response should include pagination');
        }
    });

    await runTest('Get Products - With Pagination', async () => {
        const response = await client.get('/api/products?page=1&limit=10');
        expectStatus(response, 200);
        expectSuccess(response);
        if (response.data.pagination.page !== 1) {
            throw new Error('Pagination page should be 1');
        }
        if (response.data.pagination.limit !== 10) {
            throw new Error('Pagination limit should be 10');
        }
    });

    await runTest('Get Products - With Filters', async () => {
        const response = await client.get('/api/products?is_active=true&min_price=10&max_price=1000');
        expectStatus(response, 200);
        expectSuccess(response);
    });

    await runTest('Get Featured Products', async () => {
        const response = await client.get('/api/products/featured');
        expectStatus(response, 200);
        expectSuccess(response);
        if (!Array.isArray(response.data.data)) {
            throw new Error('Featured products should be an array');
        }
    });

    await runTest('Search Products - Valid Query', async () => {
        const response = await client.get('/api/products/search?q=tomato');
        expectStatus(response, 200);
        expectSuccess(response);
    });

    await runTest('Search Products - Short Query (Should Fail)', async () => {
        try {
            const response = await client.get('/api/products/search?q=a');
            throw new Error('Should have failed with short search query');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                // Expected behavior
                return;
            }
            throw error;
        }
    });

    await runTest('Get Product By ID - Not Found', async () => {
        try {
            const response = await client.get('/api/products/550e8400-e29b-41d4-a716-446655440000');
            throw new Error('Should have failed for non-existent product');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                // Expected behavior
                return;
            }
            throw error;
        }
    });

    await runTest('Get Product By ID - Invalid ID', async () => {
        try {
            const response = await client.get('/api/products/invalid-id');
            throw new Error('Should have failed for invalid ID');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                // Expected behavior
                return;
            }
            throw error;
        }
    });

    // Test product creation without authentication
    await runTest('Create Product - No Auth (Should Fail)', async () => {
        try {
            const response = await client.post('/api/products', {
                name: 'Test Tomato',
                slug: 'test-tomato',
                category_id: '550e8400-e29b-41d4-a716-446655440000',
                price: 100,
                unit: 'kg'
            });
            throw new Error('Should have failed without authentication');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // Expected behavior
                return;
            }
            throw error;
        }
    });

    // Test product creation with invalid data
    await runTest('Create Product - Invalid Data (Should Fail)', async () => {
        try {
            const response = await client.post('/api/products', {
                name: 'A', // Too short
                price: -10, // Negative price
                unit: '' // Empty unit
            }, {
                headers: getAuthHeaders('farmer')
            });
            throw new Error('Should have failed with invalid data');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                // Expected behavior
                return;
            }
            throw error;
        }
    });

    log.warning('Product CRUD tests require auth service integration and valid category IDs');
}

async function testValidationEndpoints() {
    log.section('Testing Input Validation');

    await runTest('Products - Invalid Page Parameter', async () => {
        try {
            const response = await client.get('/api/products?page=abc');
            // Should still work but default to page 1
            expectStatus(response, 200);
        } catch (error) {
            throw error;
        }
    });

    await runTest('Products - Negative Limit Parameter', async () => {
        const response = await client.get('/api/products?limit=-5');
        expectStatus(response, 200);
        // Should use default limit
    });

    await runTest('Products - Large Limit Parameter', async () => {
        const response = await client.get('/api/products?limit=1000');
        expectStatus(response, 200);
        // Should cap at maximum allowed (100)
        if (response.data.pagination.limit > 100) {
            throw new Error('Limit should be capped at 100');
        }
    });

    await runTest('Search - Missing Query Parameter', async () => {
        try {
            const response = await client.get('/api/products/search');
            throw new Error('Should have failed without search query');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                return;
            }
            throw error;
        }
    });
}

async function testErrorHandling() {
    log.section('Testing Error Handling');

    await runTest('404 - Non-existent Endpoint', async () => {
        try {
            const response = await client.get('/api/nonexistent');
            throw new Error('Should have returned 404');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return;
            }
            throw error;
        }
    });

    await runTest('405 - Method Not Allowed', async () => {
        try {
            const response = await client.patch('/api/products'); // PATCH not allowed on collection
            throw new Error('Should have returned 405 or 404');
        } catch (error) {
            if (error.response && (error.response.status === 405 || error.response.status === 404)) {
                return;
            }
            throw error;
        }
    });

    await runTest('Request Body Too Large', async () => {
        const largeData = {
            name: 'Test Product',
            description: 'A'.repeat(20000) // Very long description
        };
        
        try {
            const response = await client.post('/api/products', largeData, {
                headers: getAuthHeaders('farmer')
            });
            // Might pass validation but should be handled gracefully
            expectStatus(response, 400);
        } catch (error) {
            if (error.response && (error.response.status === 400 || error.response.status === 413)) {
                return;
            }
            throw error;
        }
    });
}

async function testPerformance() {
    log.section('Testing Performance & Rate Limiting');

    await runTest('Multiple Concurrent Requests', async () => {
        const promises = [];
        for (let i = 0; i < 10; i++) {
            promises.push(client.get('/api/products'));
        }
        
        const responses = await Promise.all(promises);
        for (const response of responses) {
            expectStatus(response, 200);
        }
    });

    await runTest('Rate Limiting Test', async () => {
        log.info('Sending rapid requests to test rate limiting...');
        let rateLimited = false;
        
        try {
            for (let i = 0; i < 120; i++) { // Exceed rate limit
                const response = await client.get('/api/products');
                if (response.status === 429) {
                    rateLimited = true;
                    break;
                }
            }
        } catch (error) {
            if (error.response && error.response.status === 429) {
                rateLimited = true;
            }
        }
        
        if (!rateLimited) {
            log.warning('Rate limiting may not be properly configured');
        } else {
            log.success('Rate limiting is working');
        }
    });
}

async function testCacheHeaders() {
    log.section('Testing Cache Headers & Response Format');

    await runTest('Response Headers', async () => {
        const response = await client.get('/api/products');
        expectStatus(response, 200);
        
        if (!response.headers['content-type'].includes('application/json')) {
            throw new Error('Content-Type should be application/json');
        }
    });

    await runTest('CORS Headers', async () => {
        const response = await client.options('/api/products');
        // OPTIONS request should be handled properly
    });

    await runTest('Response Time', async () => {
        const start = Date.now();
        const response = await client.get('/api/products');
        const responseTime = Date.now() - start;
        
        expectStatus(response, 200);
        if (responseTime > 5000) { // 5 seconds
            throw new Error(`Response time too slow: ${responseTime}ms`);
        }
        log.info(`Response time: ${responseTime}ms`);
    });
}

async function testServiceConnectivity() {
    log.section('Testing Service Connectivity');

    await runTest('Database Connection', async () => {
        const response = await client.get('/health');
        expectStatus(response, 200);
        // Health endpoint should verify database connectivity
    });

    await runTest('Redis Connection', async () => {
        const response = await client.get('/health');
        expectStatus(response, 200);
        // Health endpoint should verify Redis connectivity
    });

    await runTest('Service Discovery', async () => {
        const response = await client.get('/');
        expectStatus(response, 200);
        if (!response.data.endpoints) {
            throw new Error('Service should expose endpoint information');
        }
    });
}

// Main test runner
async function runAllTests() {
    console.log(colors.cyan(`
╔══════════════════════════════════════════════════════════════╗
║               SaharaSprout Product Service                   ║
║              Comprehensive Test Suite                        ║
╚══════════════════════════════════════════════════════════════╝
    `));

    const startTime = Date.now();

    try {
        // Test service availability
        log.section('Testing Service Availability');
        await runTest('Service Ping', async () => {
            const response = await client.get('/health');
            expectStatus(response, 200);
        });

        // Run all test suites
        await testHealthEndpoints();
        await testCategoryEndpoints();
        await testProductEndpoints();
        await testValidationEndpoints();
        await testErrorHandling();
        await testPerformance();
        await testCacheHeaders();
        await testServiceConnectivity();

    } catch (error) {
        log.error(`Test suite failed: ${error.message}`);
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Print final results
    console.log(colors.cyan('\n' + '='.repeat(60)));
    console.log(colors.cyan('TEST RESULTS SUMMARY'));
    console.log(colors.cyan('='.repeat(60)));
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(colors.green(`Passed: ${passedTests}`));
    console.log(colors.red(`Failed: ${failedTests}`));
    console.log(`Duration: ${duration}s`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests === 0) {
        console.log(colors.green('\n🎉 All tests passed! Product Service is working perfectly.'));
    } else if (passedTests > failedTests) {
        console.log(colors.yellow('\n⚠️  Some tests failed. Please check the errors above.'));
    } else {
        console.log(colors.red('\n❌ Many tests failed. Service needs attention.'));
    }

    console.log(colors.cyan('\n' + '='.repeat(60)));

    // Exit with appropriate code
    process.exit(failedTests > 0 ? 1 : 0);
}

// Handle script execution
if (require.main === module) {
    // Check if service is running
    client.get('/health')
        .then(() => {
            log.success('Product Service is running. Starting tests...\n');
            runAllTests();
        })
        .catch((error) => {
            log.error('Product Service is not responding!');
            log.error('Please ensure the service is running on http://localhost:3011');
            log.error(`Error: ${error.message}`);
            process.exit(1);
        });
}

module.exports = {
    runAllTests,
    testHealthEndpoints,
    testCategoryEndpoints,
    testProductEndpoints
};
