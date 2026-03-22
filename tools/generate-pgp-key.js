/**
 * null_byte PGP Key Generator
 * Run: node tools/generate-pgp-key.js
 * 
 * Generates a PGP key pair and saves:
 *   - public key  → public/public-key.asc   (served by the web server)
 *   - private key → tools/private-key.asc   (NEVER commit this, keep it safe)
 */
'use strict';
const openpgp = require('openpgp');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('\n[PGP] Generating 4096-bit RSA key pair for null_byte...\n');

  const { privateKey, publicKey } = await openpgp.generateKey({
    type: 'rsa',
    rsaBits: 4096,
    userIDs: [{ name: 'Sanket_Jaybhaye', email: 'sanket.sec@proton.me' }],
    passphrase: '',          // leave empty — user can add one manually
    format: 'armored'
  });

  // Derive fingerprint from public key
  const pubKeyObj = await openpgp.readKey({ armoredKey: publicKey });
  const fp = pubKeyObj.getFingerprint().toUpperCase();
  const fingerprint = fp.match(/.{1,4}/g).join(' ');

  // Save public key
  const pubPath = path.join(__dirname, '..', 'public', 'public-key.asc');
  const privPath = path.join(__dirname, 'private-key.asc');
  fs.writeFileSync(pubPath, publicKey);
  fs.writeFileSync(privPath, privateKey);

  console.log('✓ Public key  →  public/public-key.asc  (served at /public-key.asc)');
  console.log('✓ Private key →  tools/private-key.asc  (⚠ NEVER SHARE OR COMMIT)');
  console.log('\nFingerprint:', fingerprint);
  console.log('\nUpdate portfolio.db.json → delete the file and restart server.');
  console.log('The server will re-seed with the new fingerprint automatically.\n');

  // Also print the fingerprint update instruction for portfolio.db.json
  console.log('──────────────────────────────────────────────────────');
  console.log('Add this to portfolio.db.json under "profile":');
  console.log(JSON.stringify({ pgpFingerprint: fingerprint }, null, 2));
  console.log('──────────────────────────────────────────────────────\n');
})();
