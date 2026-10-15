// ============================================
// Generate bcrypt hashes for sample users
// Run: node generate-hashes.js
// ============================================
const bcrypt = require('bcrypt');

async function generateHashes() {
    const adminHash = await bcrypt.hash('admin123', 10);
    const studentHash = await bcrypt.hash('student123', 10);

    console.log('\n--- Copy these into your campus_connect.sql ---\n');
    console.log(`Admin (admin123):   '${adminHash}'`);
    console.log(`Student (student123): '${studentHash}'`);
    console.log('\n--- Update the INSERT statements with these hashes ---\n');
}

generateHashes();
