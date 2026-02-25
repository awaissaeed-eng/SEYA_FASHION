// Jest test setup for SEYA Fashion Backend
require('dotenv').config();

// Set test environment
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/seya_test';

// Increase timeout for database operations
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  generateTestEmail: () => `test-${Date.now()}@example.com`,
  generateTestPhone: () => `+92300${Math.floor(Math.random() * 10000000)}`,
  generateTestOrderId: () => `TEST-${Date.now()}-${Math.floor(Math.random() * 1000)}`
};

console.log('🧪 Test environment initialized');
console.log(`📊 Database: ${process.env.MONGO_URI}`);
console.log(`🔧 Node Environment: ${process.env.NODE_ENV}`);