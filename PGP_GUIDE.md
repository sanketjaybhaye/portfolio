# null_byte's PGP Usage Guide

Your portfolio implements a fully client-side PGP encryption system. This guide explains how it works, how to generate keys, and how to decrypt the messages sent by visitors.

---

## 1. How It Works

1. **The Public Key**: Your public key is served statically at `/public-key.asc`.
2. **The Frontend**: When a visitor types a message and clicks the "PGP ON" toggle, your website loads the `openpgp.js` library via CDN.
3. **The Encryption**: The website downloads your public key and encrypts the visitor's message *locally inside their browser*.
4. **The Backend**: The backend (`server.js`) only ever receives the encrypted "PGP Armor" string. Even if the server or database is compromised, the messages are completely unreadable to attackers.

---

## 2. Generating a New PGP Key Pair

If you ever need to change your email or generate a new key, a Node.js script is included in the `tools/` folder.

1. Open `tools/generate-pgp-key.js` in your code editor.
2. Edit the email and name around **line 16**:
   ```javascript
   userIDs: [{ name: 'Sanket_Jaybhaye', email: 'sanket.sec@proton.me' }],
   ```
3. Run the script in your terminal:
   ```powershell
   node tools/generate-pgp-key.js
   ```

### What happens when you run the script?
- It generates a strong 4096-bit RSA key pair.
- The **Public Key** is saved directly to `public/public-key.asc` (replacing the old one).
- The **Private Key** is saved to `tools/private-key.asc`. *(Keep this safe!)*
- It prints a new **Fingerprint** to the terminal console.

### Updating your Portfolio with the New Key
After generating a key, you must update the database so the frontend displays the correct fingerprint.
1. Open `server.js` and update the fingerprint string under the `pgp:` object (around line 253).
2. Open `portfolio.db.json` and change the `"pgpFingerprint"` to match the new one.
3. Restart your Node server (`node server.js`).

---

## 3. How to Decrypt Messages

When a visitor sends a PGP message, it is stored in your SQLite database (`portfolio.db.json`).

The raw JSON message looks something like this:
```text
-----BEGIN PGP MESSAGE-----
wcBMA1zHkQfUq1bVAQf9Gv...
... (lots of random characters) ...
-----END PGP MESSAGE-----
```

### The Easy Way (Terminal Script)
I built a custom tool for you that automatically loads your private key and decrypts all the messages right in your terminal. This is the fastest and most secure way to read your mail!

1. Open your terminal in the `Portfolio/` directory.
2. Run the command:
   ```powershell
   node tools/read-messages.js
   ```
3. It will instantly loop through all messages in your database, decrypt them locally, and print the readable content exactly as the sender typed it.

---

### The Manual Way (Using Kleopatra)
If you prefer not to use the terminal script, you can use standard desktop software like [Gpg4win (Kleopatra)](https://gpg4win.org/).

#### Step A: Import your Private Key
1. Open Kleopatra.
2. Click **Import** in the top menu and select `tools/private-key.asc`.

#### Step B: Decrypting the Text
1. Run `node tools/extract-message.js` to properly format the latest message into text format.
2. Open `tools/latest-message.txt`, highlight everything, and **Copy (`Ctrl+C`)**.
3. Open Kleopatra, go to the **Tools** menu, select **Clipboard**, and click **Decrypt/Verify**.
4. Kleopatra will instantly pop up a window displaying the original message!

---

## ⚠️ Security Warning ⚠️
- **NEVER** push the `tools/private-key.asc` file to GitHub or share it with anyone. 
- The `.gitignore` file already prevents `private-key.asc` from being committed, but you must remain careful.
- If you lose your private key file, you will be permanently locked out of reading any encrypted messages in your database. Keep a secure backup.
