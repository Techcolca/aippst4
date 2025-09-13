const jwt = require('jsonwebtoken');

// Use the correct JWT_SECRET from the application
const JWT_SECRET = 'default_jwt_secret'; // This is the fallback used by the app
const testToken = jwt.sign({ userId: 3, username: 'Empresa' }, JWT_SECRET, { expiresIn: '1h' });

console.log('🔑 Test JWT Token with Correct Secret Generated Successfully');
console.log('Token:', testToken);
console.log('\n=== BUDGET MIDDLEWARE TESTING PLAN ===\n');

// Write token to file for easy access
require('fs').writeFileSync('auth-token-correct.txt', testToken);
console.log('💾 Token saved to auth-token-correct.txt');

console.log('\n🧪 READY FOR COMPREHENSIVE TESTING:');
console.log('1. Test with sufficient budget ($100 CAD)');
console.log('2. Test insufficient budget scenario'); 
console.log('3. Test suspended budget scenario');
console.log('4. Verify req.limitCheck compatibility');
console.log('5. Verify 403 response format');
console.log('\nUse this token:', testToken);