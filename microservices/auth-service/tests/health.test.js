const request = require('supertest');
const app = require('../src/index');

describe('Auth Service Health Check', () => {
  test('GET /health should return service status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('service', 'auth-service');
    expect(response.body).toHaveProperty('timestamp');
  });
});

describe('Auth API Health Check', () => {
  test('GET /api/auth/health should return auth service status', async () => {
    const response = await request(app)
      .get('/api/auth/health')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('service', 'auth-service');
    expect(response.body).toHaveProperty('status', 'healthy');
  });
});
