#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateKeyPair() {
  console.log('🔑 Generating RSA key pair for OAuth...\n');

  // Generate RSA key pair
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  // Create keys directory if it doesn't exist
  const keysDir = path.join(__dirname, '..', 'keys');
  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
  }

  // Save keys to files
  const privateKeyPath = path.join(keysDir, 'private.pem');
  const publicKeyPath = path.join(keysDir, 'public.pem');

  fs.writeFileSync(privateKeyPath, privateKey);
  fs.writeFileSync(publicKeyPath, publicKey);

  console.log('✅ Keys generated successfully:');
  console.log(`   Private key: ${privateKeyPath}`);
  console.log(`   Public key: ${publicKeyPath}\n`);

  console.log('📝 Configuration for .env:');
  console.log(`JWT_PRIVATE_KEY_PATH=${privateKeyPath}`);
  console.log(`JWT_PUBLIC_KEY_PATH=${publicKeyPath}\n`);

  console.log('🔐 Public key (for clients):');
  console.log(publicKey);
  console.log('\n⚠️  Remember:');
  console.log('   - Keep the private key secure');
  console.log('   - Do not share the private key');
  console.log('   - The public key can be shared with clients');
  console.log('   - Add keys/ to .gitignore');

  return { privateKey, publicKey };
}

if (require.main === module) {
  generateKeyPair();
}

module.exports = { generateKeyPair };
