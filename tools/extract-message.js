const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'portfolio.db.json');
if (!fs.existsSync(dbPath)) {
  console.log('Database not found.');
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const messages = db.messages || [];

if (messages.length === 0) {
  console.log('No messages found in the database.');
  process.exit(0);
}

const latest = messages[messages.length - 1];
const outPath = path.join(__dirname, 'latest-message.txt');

fs.writeFileSync(outPath, latest.message);

console.log('==================================================');
console.log(`Extracted the latest message from: ${latest.email}`);
console.log(`Saved to: tools/latest-message.txt`);
console.log('==================================================');
console.log('Open tools/latest-message.txt in your editor, press Ctrl+A to select all,');
console.log('press Ctrl+C to copy, and then decrypt in Kleopatra.');
