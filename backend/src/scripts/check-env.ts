import dotenv from 'dotenv';

dotenv.config();

console.log('Checking environment variables...\n');

const requiredVars = [
    'AUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'DATABASE_URL',
];

const optionalVars = [
    'AUTH_URL',
    'FRONTEND_URL',
    'PORT',
];

let allGood = true;

console.log('Required variables:');
requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        // Mask sensitive values
        if (varName.includes('SECRET') || varName.includes('PASSWORD')) {
            console.log(`  ✓ ${varName}: ${value.substring(0, 10)}...`);
        } else if (varName === 'DATABASE_URL') {
            // Show only the connection type, not the full URL
            const match = value.match(/^([^:]+):/);
            console.log(`  ✓ ${varName}: ${match ? match[1] : 'set'}`);
        } else {
            console.log(`  ✓ ${varName}: ${value}`);
        }
    } else {
        console.log(`  ✗ ${varName}: MISSING`);
        allGood = false;
    }
});

console.log('\nOptional variables:');
optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`  ✓ ${varName}: ${value}`);
    } else {
        console.log(`  - ${varName}: not set (using default)`);
    }
});

if (!allGood) {
    console.log('\n❌ Some required environment variables are missing!');
    console.log('Please check your .env file.');
    process.exit(1);
} else {
    console.log('\n✅ All required environment variables are set!');
    
    // Suggest AUTH_URL if not set
    if (!process.env.AUTH_URL) {
        const port = process.env.PORT || 3000;
        console.log(`\n💡 Tip: Consider setting AUTH_URL=http://localhost:${port} in your .env file`);
    }
}

