/**
 * Quick Test Script for Order Validation
 * Run with: node tests/test-order-validation.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testValidation() {
  log('\n🧪 Testing Order Validation\n', 'blue');
  
  let passed = 0;
  let failed = 0;

  // ═══════════════════════════════════════════════════════════════
  // TEST 1: Missing Email
  // ═══════════════════════════════════════════════════════════════
  try {
    log('Test 1: Missing Email...', 'yellow');
    await axios.post(`${API_URL}/orders`, {
      customerInfo: {
        firstName: 'Test',
        phone: '03001234567'
      },
      products: [{
        product: '507f1f77bcf86cd799439011',
        quantity: 1,
        price: 1500
      }],
      subtotal: 1500,
      totalAmount: 1500,
      shippingAddress: {
        name: 'Test',
        street: '123 Test Street',
        city: 'Karachi',
        state: 'Sindh',
        zipCode: '75500',
        country: 'Pakistan',
        phone: '03001234567'
      },
      paymentMethod: 'card'
    });
    
    log('❌ FAILED: Should have rejected missing email', 'red');
    failed++;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('✅ PASSED: Rejected missing email', 'green');
      passed++;
    } else {
      log(`❌ FAILED: Wrong error - ${error.message}`, 'red');
      failed++;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // TEST 2: Invalid Email Format
  // ═══════════════════════════════════════════════════════════════
  try {
    log('Test 2: Invalid Email Format...', 'yellow');
    await axios.post(`${API_URL}/orders`, {
      customerInfo: {
        firstName: 'Test',
        email: 'not-an-email',
        phone: '03001234567'
      },
      products: [{
        product: '507f1f77bcf86cd799439011',
        quantity: 1,
        price: 1500
      }],
      subtotal: 1500,
      totalAmount: 1500,
      shippingAddress: {
        name: 'Test',
        street: '123 Test Street',
        city: 'Karachi',
        state: 'Sindh',
        zipCode: '75500',
        country: 'Pakistan',
        phone: '03001234567'
      },
      paymentMethod: 'card'
    });
    
    log('❌ FAILED: Should have rejected invalid email', 'red');
    failed++;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('✅ PASSED: Rejected invalid email format', 'green');
      passed++;
    } else {
      log(`❌ FAILED: Wrong error - ${error.message}`, 'red');
      failed++;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // TEST 3: Negative Price
  // ═══════════════════════════════════════════════════════════════
  try {
    log('Test 3: Negative Price...', 'yellow');
    await axios.post(`${API_URL}/orders`, {
      customerInfo: {
        firstName: 'Test',
        email: 'test@example.com',
        phone: '03001234567'
      },
      products: [{
        product: '507f1f77bcf86cd799439011',
        quantity: 1,
        price: -1500
      }],
      subtotal: -1500,
      totalAmount: -1500,
      shippingAddress: {
        name: 'Test',
        street: '123 Test Street',
        city: 'Karachi',
        state: 'Sindh',
        zipCode: '75500',
        country: 'Pakistan',
        phone: '03001234567'
      },
      paymentMethod: 'card'
    });
    
    log('❌ FAILED: Should have rejected negative price', 'red');
    failed++;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('✅ PASSED: Rejected negative price', 'green');
      passed++;
    } else {
      log(`❌ FAILED: Wrong error - ${error.message}`, 'red');
      failed++;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // TEST 4: Invalid Product ID
  // ═══════════════════════════════════════════════════════════════
  try {
    log('Test 4: Invalid Product ID...', 'yellow');
    await axios.post(`${API_URL}/orders`, {
      customerInfo: {
        firstName: 'Test',
        email: 'test@example.com',
        phone: '03001234567'
      },
      products: [{
        product: 'fake-product-id',
        quantity: 1,
        price: 1500
      }],
      subtotal: 1500,
      totalAmount: 1500,
      shippingAddress: {
        name: 'Test',
        street: '123 Test Street',
        city: 'Karachi',
        state: 'Sindh',
        zipCode: '75500',
        country: 'Pakistan',
        phone: '03001234567'
      },
      paymentMethod: 'card'
    });
    
    log('❌ FAILED: Should have rejected invalid product ID', 'red');
    failed++;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('✅ PASSED: Rejected invalid product ID', 'green');
      passed++;
    } else {
      log(`❌ FAILED: Wrong error - ${error.message}`, 'red');
      failed++;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // TEST 5: Quantity Out of Range
  // ═══════════════════════════════════════════════════════════════
  try {
    log('Test 5: Quantity Out of Range...', 'yellow');
    await axios.post(`${API_URL}/orders`, {
      customerInfo: {
        firstName: 'Test',
        email: 'test@example.com',
        phone: '03001234567'
      },
      products: [{
        product: '507f1f77bcf86cd799439011',
        quantity: 100,
        price: 1500
      }],
      subtotal: 150000,
      totalAmount: 150000,
      shippingAddress: {
        name: 'Test',
        street: '123 Test Street',
        city: 'Karachi',
        state: 'Sindh',
        zipCode: '75500',
        country: 'Pakistan',
        phone: '03001234567'
      },
      paymentMethod: 'card'
    });
    
    log('❌ FAILED: Should have rejected quantity > 20', 'red');
    failed++;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('✅ PASSED: Rejected quantity out of range', 'green');
      passed++;
    } else {
      log(`❌ FAILED: Wrong error - ${error.message}`, 'red');
      failed++;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // TEST 6: Empty Products Array
  // ═══════════════════════════════════════════════════════════════
  try {
    log('Test 6: Empty Products Array...', 'yellow');
    await axios.post(`${API_URL}/orders`, {
      customerInfo: {
        firstName: 'Test',
        email: 'test@example.com',
        phone: '03001234567'
      },
      products: [],
      subtotal: 0,
      totalAmount: 0,
      shippingAddress: {
        name: 'Test',
        street: '123 Test Street',
        city: 'Karachi',
        state: 'Sindh',
        zipCode: '75500',
        country: 'Pakistan',
        phone: '03001234567'
      },
      paymentMethod: 'card'
    });
    
    log('❌ FAILED: Should have rejected empty products', 'red');
    failed++;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('✅ PASSED: Rejected empty products array', 'green');
      passed++;
    } else {
      log(`❌ FAILED: Wrong error - ${error.message}`, 'red');
      failed++;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // TEST 7: Invalid Payment Method
  // ═══════════════════════════════════════════════════════════════
  try {
    log('Test 7: Invalid Payment Method...', 'yellow');
    await axios.post(`${API_URL}/orders`, {
      customerInfo: {
        firstName: 'Test',
        email: 'test@example.com',
        phone: '03001234567'
      },
      products: [{
        product: '507f1f77bcf86cd799439011',
        quantity: 1,
        price: 1500
      }],
      subtotal: 1500,
      totalAmount: 1500,
      shippingAddress: {
        name: 'Test',
        street: '123 Test Street',
        city: 'Karachi',
        state: 'Sindh',
        zipCode: '75500',
        country: 'Pakistan',
        phone: '03001234567'
      },
      paymentMethod: 'bitcoin'
    });
    
    log('❌ FAILED: Should have rejected invalid payment method', 'red');
    failed++;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('✅ PASSED: Rejected invalid payment method', 'green');
      passed++;
    } else {
      log(`❌ FAILED: Wrong error - ${error.message}`, 'red');
      failed++;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // TEST 8: Invalid Phone Format
  // ═══════════════════════════════════════════════════════════════
  try {
    log('Test 8: Invalid Phone Format...', 'yellow');
    await axios.post(`${API_URL}/orders`, {
      customerInfo: {
        firstName: 'Test',
        email: 'test@example.com',
        phone: '123'
      },
      products: [{
        product: '507f1f77bcf86cd799439011',
        quantity: 1,
        price: 1500
      }],
      subtotal: 1500,
      totalAmount: 1500,
      shippingAddress: {
        name: 'Test',
        street: '123 Test Street',
        city: 'Karachi',
        state: 'Sindh',
        zipCode: '75500',
        country: 'Pakistan',
        phone: '03001234567'
      },
      paymentMethod: 'card'
    });
    
    log('❌ FAILED: Should have rejected invalid phone', 'red');
    failed++;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('✅ PASSED: Rejected invalid phone format', 'green');
      passed++;
    } else {
      log(`❌ FAILED: Wrong error - ${error.message}`, 'red');
      failed++;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════
  log('\n' + '='.repeat(50), 'blue');
  log(`Total Tests: ${passed + failed}`, 'blue');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log('='.repeat(50) + '\n', 'blue');

  if (failed === 0) {
    log('🎉 All validation tests passed!', 'green');
  } else {
    log('⚠️  Some tests failed. Check the output above.', 'red');
  }
}

// Run tests
log('\n🚀 Starting Order Validation Tests', 'blue');
log('Make sure the backend server is running on http://localhost:5000\n', 'yellow');

testValidation().catch(error => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  if (error.code === 'ECONNREFUSED') {
    log('⚠️  Backend server is not running. Start it with: npm start', 'yellow');
  }
  process.exit(1);
});
