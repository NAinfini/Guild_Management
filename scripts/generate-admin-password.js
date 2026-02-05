/**
 * Generate Admin Password Hash
 * Run: node scripts/generate-admin-password.js
 */

import { webcrypto } from 'crypto';

async function hashPassword(password, salt) {
  const useSalt = salt || webcrypto.randomUUID();
  const encoder = new TextEncoder();
  const data = encoder.encode(`${useSalt}:${password}`);
  const hashBuffer = await webcrypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return { hash, salt: useSalt };
}

async function main() {
  const password = 'Admin123!';
  const { hash, salt } = await hashPassword(password);

  console.log('\n='.repeat(60));
  console.log('ADMIN ACCOUNT CREDENTIALS');
  console.log('='.repeat(60));
  console.log('\nUsername: admin');
  console.log('Password: Admin123!');
  console.log('\n' + '='.repeat(60));
  console.log('DATABASE VALUES');
  console.log('='.repeat(60));
  console.log(`\nSalt: ${salt}`);
  console.log(`Hash: ${hash}`);
  console.log('\n' + '='.repeat(60));
  console.log('SQL INSERT STATEMENT');
  console.log('='.repeat(60));
  console.log(`
INSERT INTO user_auth_password (
  user_id,
  password_hash,
  salt,
  created_at_utc,
  updated_at_utc
) VALUES (
  'usr_admin_real',
  '${hash}',
  '${salt}',
  datetime('now'),
  datetime('now')
);
`);
  console.log('='.repeat(60));
  console.log('IMPORTANT: Change this password after first login!');
  console.log('='.repeat(60) + '\n');
}

main().catch(console.error);
