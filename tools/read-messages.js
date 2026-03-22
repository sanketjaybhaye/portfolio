/**
 * null_byte PGP Local Message Reader
 * Run: node tools/read-messages.js
 * 
 * Automatically decrypts all messages in portfolio.db.json
 * using your local private-key.asc.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const openpgp = require('openpgp');

(async () => {
  const dbPath = path.join(__dirname, '..', 'portfolio.db.json');
  const privKeyPath = path.join(__dirname, 'private-key.asc');

  if (!fs.existsSync(dbPath) || !fs.existsSync(privKeyPath)) {
    console.error('[ERROR] Missing portfolio.db.json or tools/private-key.asc');
    process.exit(1);
  }

  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const messages = db.messages || [];

  if (messages.length === 0) {
    console.log('[INFO] No messages found in the database.');
    process.exit(0);
  }

  console.log('Loading private key...');
  const privKeyArmored = fs.readFileSync(privKeyPath, 'utf8');
  let privateKey;
  try {
    privateKey = await openpgp.readPrivateKey({ armoredKey: privKeyArmored });
  } catch (err) {
    console.error('[ERROR] Failed to read private key. Ensure it is a valid RSA PGP key.');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  let limit = 5;
  if (args[0] === 'all') limit = messages.length;
  else if (!isNaN(parseInt(args[0]))) limit = parseInt(args[0]);

  const toRead = messages.slice(-limit).reverse();

  console.log(`\n======================================================`);
  console.log(`    DECRYPTING LAST ${toRead.length} MESSAGE(S)`);
  console.log(`======================================================\n`);

  for (let i = 0; i < toRead.length; i++) {
    const m = toRead[i];
    console.log(`[Message #${messages.length - i} (Newest)]`);
    console.log(`From:   ${m.name} <${m.email}>`);
    console.log(`Date:   ${new Date(m.timestamp).toLocaleString()}`);
    console.log('---');

    try {
      if (!m.message.includes('-----BEGIN PGP MESSAGE-----')) {
        console.log('[Unencrypted Message]:');
        console.log(m.message);
      } else {
        const msg = await openpgp.readMessage({ armoredMessage: m.message });
        const { data: decrypted } = await openpgp.decrypt({
          message: msg,
          decryptionKeys: privateKey
        });
        console.log('[DECRYPTED]:');
        console.log(decrypted.trim());
      }
    } catch (err) {
      console.log('[ERROR] Failed to decrypt this message. Does it belong to another key?');
    }
    console.log(`\n──────────────────────────────────────────────────────\n`);
  }
})();
