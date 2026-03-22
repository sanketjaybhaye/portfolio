/**
 * null_byte Remote PGP Message Reader
 * Run: node tools/read-remote.js
 * 
 * Fetches encrypted messages from your live Render deployment
 * and decrypts them locally using your private key.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const openpgp = require('openpgp');

// Configuration
const APP_URL = 'https://neo4u.onrender.com'; // Change if your URL is different
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('\n[ERROR] ADMIN_TOKEN environment variable is missing.');
  console.error('Please set it before running this script:');
  console.error('  $env:ADMIN_TOKEN="your_token_from_render" ; node tools/read-remote.js\n');
  process.exit(1);
}

(async () => {
  console.log(`[INFO] Fetching messages from ${APP_URL}...`);

  let messages;
  try {
    const response = await fetch(`${APP_URL}/api/messages`, {
      headers: { 'x-admin-token': ADMIN_TOKEN }
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status} ${response.statusText}`);
    }
    messages = await response.json();
  } catch (err) {
    console.error('[ERROR] Failed to fetch messages from server.');
    console.error('        Did you set the correct ADMIN_TOKEN? Is the URL correct?');
    console.error(err.message);
    process.exit(1);
  }

  if (!messages || messages.length === 0) {
    console.log('[INFO] No messages found on the server.');
    process.exit(0);
  }

  console.log(`[INFO] Found ${messages.length} message(s). Loading private key...`);
  const privKeyPath = path.join(__dirname, 'private-key.asc');

  if (!fs.existsSync(privKeyPath)) {
    console.error('\n[ERROR] Missing tools/private-key.asc');
    console.error('To decrypt messages, your private PGP key must be in the tools/ folder.\n');
    process.exit(1);
  }

  const privKeyArmored = fs.readFileSync(privKeyPath, 'utf8');
  let privateKey;
  try {
    privateKey = await openpgp.readPrivateKey({ armoredKey: privKeyArmored });
  } catch (err) {
    console.error('[ERROR] Failed to read private key.');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  let limit = 5; // Default limit to prevent terminal flood
  let filterWord = '';

  if (args.length > 0) {
    if (args[0].toLowerCase() === 'all') {
      limit = messages.length;
      filterWord = args.slice(1).join(' ').toLowerCase();
    } else if (!isNaN(parseInt(args[0], 10))) {
      limit = parseInt(args[0], 10);
      filterWord = args.slice(1).join(' ').toLowerCase();
    } else {
      filterWord = args.join(' ').toLowerCase();
    }
  }

  console.log(`\n======================================================`);
  console.log(`    DECRYPTING REMOTE MESSAGES (Limit: ${limit === messages.length ? 'ALL' : limit})`);
  console.log(`======================================================\n`);

  if (filterWord) {
    console.log(`[INFO] 🔍 Searching for keyword: "${filterWord}"\n`);
  }

  // Show newest first
  const toRead = messages.reverse();
  let shownCount = 0;
  let scannedCount = 0;

  for (let i = 0; i < toRead.length; i++) {
    if (shownCount >= limit) break; // Stop decrypting once we hit the limit
    
    scannedCount++;
    const m = toRead[i];
    const msgLabel = `[Message #${messages.length - i} (Newest)]`;

    try {
      if (!m.message.includes('-----BEGIN PGP MESSAGE-----')) {
        if (filterWord && !m.name.toLowerCase().includes(filterWord) && !m.email.toLowerCase().includes(filterWord) && !m.message.toLowerCase().includes(filterWord)) continue;
        
        console.log(msgLabel);
        console.log(`From:   ${m.name} <${m.email}>`);
        console.log(`Date:   ${new Date(m.timestamp).toLocaleString()}`);
        console.log('---');
        console.log('[Unencrypted Message]:');
        console.log(m.message);
        console.log(`\n──────────────────────────────────────────────────────\n`);
        shownCount++;
      } else {
        const msg = await openpgp.readMessage({ armoredMessage: m.message });
        const { data: decrypted } = await openpgp.decrypt({
          message: msg,
          decryptionKeys: privateKey
        });
        
        const decryptedText = decrypted.trim();
        
        if (filterWord) {
          const isMatch = m.name.toLowerCase().includes(filterWord) ||
            m.email.toLowerCase().includes(filterWord) ||
            decryptedText.toLowerCase().includes(filterWord);
          if (!isMatch) continue; // Skip to next message if no match
        }
        
        console.log(msgLabel);
        console.log(`From:   ${m.name} <${m.email}>`);
        console.log(`Date:   ${new Date(m.timestamp).toLocaleString()}`);
        console.log('---');
        console.log('[DECRYPTED]:');
        console.log(decryptedText);
        console.log(`\n──────────────────────────────────────────────────────\n`);
        shownCount++;
      }
    } catch (err) {
      if (!filterWord) { // Only show errors if not filtering
        console.log(msgLabel);
        console.log(`From:   ${m.name} <${m.email}>`);
        console.log('---');
        console.log('[ERROR] Failed to decrypt this message. Does it belong to another key?');
        console.log(`\n──────────────────────────────────────────────────────\n`);
        shownCount++;
      }
    }
  }

  if (shownCount === 0 && filterWord) {
    console.log(`[INFO] No messages matched your search.`);
  } else if (shownCount >= limit && scannedCount < toRead.length) {
    console.log(`[INFO] Reached display limit of ${limit}. There are older messages remaining.`);
    console.log(`       To see more, increase the limit (e.g. \`node tools/read-remote.js 20\`)`);
    console.log(`       or use \`node tools/read-remote.js all\``);
  }
})();
