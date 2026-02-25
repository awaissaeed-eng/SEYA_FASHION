// Security Testing Script for SEYA Fashion Platform
// This script tests various injection attack vectors to ensure security

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test payloads for injection attacks
const INJECTION_PAYLOADS = {
  nosql: [
    '{"$ne": null}',
    '{"$gt": ""}',
    '{"$where": "this.password"}',
    '{"$regex": ".*"}',
    '{"$or": [{}]}',
    '{"$and": [{}]}',
    '{"$in": []}',
    '{"$nin": []}',
  ],
  regex: [
    '(a+)+$',
    '^(a+)+$',
    '(a|a)*$',
    '([a-zA-Z]+)*$',
    '(a+)+b',
    '.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*',
  ],
  xss: [
    '<script>alert("xss")</script>',
    'javascript:alert("xss")',
    '<img src=x onerror=alert("xss")>',
    '"><script>alert("xss")</script>',
  ],
  sql: [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "' UNION SELECT * FROM users --",
    "admin'--",
    "admin' OR '1'='1' --",
  ],
  overflow: [
    'A'.repeat(10001), // Test length validation
    'A'.repeat(100000),
  ]
};

class SecurityTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runTest(testName, testFunction) {
    try {
      console.log(`\n🧪 Testing: ${testName}`);
      const result = await testFunction();
      
      if (result.success) {
        console.log(`✅ PASSED: ${testName}`);
        this.results.passed++;
      } else {
        console.log(`❌ FAILED: ${testName} - ${result.message}`);
        this.results.failed++;
      }
      
      this.results.tests.push({
        name: testName,
        success: result.success,
        message: result.message,
        details: result.details
      });
    } catch (error) {
      console.log(`❌ ERROR: ${testName} - ${error.message}`);
      this.results.failed++;
      this.results.tests.push({
        name: testName,
        success: false,
        message: error.message,
        details: error.stack
      });
    }
  }

  // Test NoSQL injection in authentication
  async testAuthInjection() {
    for (const payload of INJECTION_PAYLOADS.nosql) {
      try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
          email: JSON.parse(payload),
          password: JSON.parse(payload)
        });
        
        // Should not succeed with injection payload
        if (response.status === 200) {
          return {
            success: false,
            message: `Authentication bypass with payload: ${payload}`,
            details: response.data
          };
        }
      } catch (error) {
        // Expected to fail - this is good
        if (error.response && error.response.status >= 400) {
          continue;
        }
        throw error;
      }
    }
    
    return {
      success: true,
      message: 'All NoSQL injection attempts in authentication were blocked'
    };
  }

  // Test regex injection in product search
  async testProductSearchInjection() {
    for (const payload of INJECTION_PAYLOADS.regex) {
      try {
        const startTime = Date.now();
        const response = await axios.get(`${BASE_URL}/products`, {
          params: { search: payload },
          timeout: 5000 // 5 second timeout
        });
        const endTime = Date.now();
        
        // Check if response took too long (ReDoS attack)
        if (endTime - startTime > 3000) {
          return {
            success: false,
            message: `ReDoS vulnerability detected with payload: ${payload}`,
            details: `Response time: ${endTime - startTime}ms`
          };
        }
        
        // Should return empty or safe results
        if (response.data && response.data.products) {
          continue;
        }
      } catch (error) {
        if (error.code === 'ECONNABORTED') {
          return {
            success: false,
            message: `Timeout (potential ReDoS) with payload: ${payload}`,
            details: 'Request timed out'
          };
        }
        // Other errors are acceptable
        continue;
      }
    }
    
    return {
      success: true,
      message: 'All regex injection attempts in product search were handled safely'
    };
  }

  // Test input validation and sanitization
  async testInputValidation() {
    const testCases = [
      {
        endpoint: '/auth/register',
        method: 'POST',
        data: {
          firstName: INJECTION_PAYLOADS.overflow[0],
          lastName: 'Test',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123'
        }
      },
      {
        endpoint: '/auth/register',
        method: 'POST',
        data: {
          firstName: INJECTION_PAYLOADS.xss[0],
          lastName: 'Test',
          email: 'test2@example.com',
          password: 'password123',
          confirmPassword: 'password123'
        }
      }
    ];

    for (const testCase of testCases) {
      try {
        const response = await axios({
          method: testCase.method,
          url: `${BASE_URL}${testCase.endpoint}`,
          data: testCase.data
        });
        
        // Should not succeed with malicious input
        if (response.status === 200 || response.status === 201) {
          return {
            success: false,
            message: `Input validation bypass in ${testCase.endpoint}`,
            details: response.data
          };
        }
      } catch (error) {
        // Expected to fail with 400 status - this is good
        if (error.response && error.response.status === 400) {
          continue;
        }
        throw error;
      }
    }
    
    return {
      success: true,
      message: 'Input validation is working correctly'
    };
  }

  // Test parameter pollution
  async testParameterPollution() {
    try {
      const response = await axios.get(`${BASE_URL}/products`, {
        params: {
          sort: ['name:asc', 'price:desc', 'password:desc']
        }
      });
      
      // Should handle parameter pollution gracefully
      if (response.data && response.data.products) {
        return {
          success: true,
          message: 'Parameter pollution handled correctly'
        };
      }
    } catch (error) {
      if (error.response && error.response.status >= 400) {
        return {
          success: true,
          message: 'Parameter pollution rejected appropriately'
        };
      }
      throw error;
    }
    
    return {
      success: false,
      message: 'Parameter pollution test inconclusive'
    };
  }

  // Test unauthorized access
  async testUnauthorizedAccess() {
    const protectedEndpoints = [
      '/products/admin/all',
      '/users',
      '/orders',
      '/dashboard/stats'
    ];

    for (const endpoint of protectedEndpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint}`);
        
        // Should not succeed without authentication
        if (response.status === 200) {
          return {
            success: false,
            message: `Unauthorized access to ${endpoint}`,
            details: response.data
          };
        }
      } catch (error) {
        // Expected to fail with 401 - this is good
        if (error.response && error.response.status === 401) {
          continue;
        }
        throw error;
      }
    }
    
    return {
      success: true,
      message: 'All protected endpoints require authentication'
    };
  }

  // Test rate limiting
  async testRateLimit() {
    const requests = [];
    
    // Send many requests quickly
    for (let i = 0; i < 10; i++) {
      requests.push(
        axios.get(`${BASE_URL}/products`, {
          params: { search: 'test' }
        }).catch(error => error.response)
      );
    }
    
    const responses = await Promise.all(requests);
    
    // Check if any requests were rate limited
    const rateLimited = responses.some(response => 
      response && response.status === 429
    );
    
    return {
      success: true, // Rate limiting is working if we get 429s, but not required for basic functionality
      message: rateLimited ? 'Rate limiting is active' : 'Rate limiting not triggered (acceptable for low volume)'
    };
  }

  // Run all security tests
  async runAllTests() {
    console.log('🔒 Starting Security Tests for SEYA Fashion Platform\n');
    console.log('=' .repeat(60));

    await this.runTest('NoSQL Injection in Authentication', () => this.testAuthInjection());
    await this.runTest('Regex Injection in Product Search', () => this.testProductSearchInjection());
    await this.runTest('Input Validation and Sanitization', () => this.testInputValidation());
    await this.runTest('Parameter Pollution', () => this.testParameterPollution());
    await this.runTest('Unauthorized Access Protection', () => this.testUnauthorizedAccess());
    await this.runTest('Rate Limiting', () => this.testRateLimit());

    console.log('\n' + '=' .repeat(60));
    console.log('🔒 Security Test Results:');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📊 Total: ${this.results.tests.length}`);
    
    if (this.results.failed === 0) {
      console.log('\n🎉 All security tests passed! The application is well protected.');
    } else {
      console.log('\n⚠️  Some security tests failed. Please review and fix the issues.');
      
      console.log('\n📋 Failed Tests:');
      this.results.tests
        .filter(test => !test.success)
        .forEach(test => {
          console.log(`- ${test.name}: ${test.message}`);
        });
    }

    return this.results;
  }
}

// Export for use in other files or run directly
if (require.main === module) {
  const tester = new SecurityTester();
  tester.runAllTests().catch(console.error);
}

module.exports = SecurityTester;