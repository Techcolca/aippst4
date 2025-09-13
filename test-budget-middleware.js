const jwt = require('jsonwebtoken');

// Create a test JWT token for user 3 (who has budget configured)
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const testToken = jwt.sign({ userId: 3, username: 'Empresa' }, JWT_SECRET, { expiresIn: '1h' });

console.log('Test JWT Token:', testToken);
console.log('\n=== BUDGET MIDDLEWARE TESTING ===\n');

// Test scenarios we'll verify:
console.log('TEST SCENARIOS TO VERIFY:');
console.log('1. ✅ User with sufficient budget ($100 CAD)');
console.log('2. User with insufficient budget (after reducing budget)');
console.log('3. User with suspended budget');
console.log('4. User without budget configuration');
console.log('5. Verify req.limitCheck compatibility');
console.log('6. Verify 403 response format with budget info');
console.log('');
console.log('Use this token for authenticated requests:');
console.log(`Authorization: Bearer ${testToken}`);