const jwt = require('jsonwebtoken');

// Create a test JWT token for user 3 (who has budget configured)
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const testToken = jwt.sign({ userId: 3, username: 'Empresa' }, JWT_SECRET, { expiresIn: '1h' });

console.log('🔑 Test JWT Token Generated Successfully');
console.log('Token:', testToken);
console.log('\n=== BUDGET MIDDLEWARE TESTING PLAN ===\n');

// Export the token for use in curl commands
console.log('💡 USE THIS TOKEN FOR AUTHENTICATED REQUESTS:');
console.log(`Authorization: Bearer ${testToken}`);
console.log('');

console.log('🧪 TEST SCENARIOS TO VERIFY:');
console.log('1. ✅ User with sufficient budget ($100 CAD available)');
console.log('   - create_integration costs $6.50 CAD');
console.log('   - create_form costs $3.90 CAD');
console.log('2. ❌ User with insufficient budget (after reducing budget)');
console.log('3. ❌ User with suspended budget');
console.log('4. ❌ User without budget configuration');
console.log('5. ✅ Verify req.limitCheck compatibility');
console.log('6. ✅ Verify 403 response format with budget info');
console.log('');

// Write token to file for easy access
require('fs').writeFileSync('auth-token.txt', testToken);
console.log('💾 Token saved to auth-token.txt for easy access');