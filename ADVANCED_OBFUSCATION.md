# Advanced Multi-Layer Obfuscation System

## 🎯 For CTF Players

Welcome! If you're here to extract the Turnstile site key, you're in for a fun challenge. This document outlines the obfuscation system you're up against.

**Spoiler Alert:** Yes, you can extract the key. This is client-side JavaScript after all. But we've made it entertaining! 😈

## 🔐 Important Security Disclaimer

**THIS IS SECURITY THEATER, NOT REAL SECURITY!**

The Turnstile site key is a **public** value by design. Cloudflare expects it to be visible in the browser. Real security comes from:
1. Server-side verification of Turnstile tokens (requires a backend)
2. The secret key (which should NEVER be in frontend code)
3. Cloudflare's bot detection algorithms

This obfuscation system exists to:
- Make automated extraction slightly harder
- Provide a fun challenge for security researchers
- Demonstrate advanced obfuscation techniques
- **NOT** to provide actual security

## 🏗️ Architecture Overview

### Build-Time Obfuscation (`scripts/obfuscate.cjs`)

The site key undergoes 6 layers of encoding:

1. **XOR Cipher with Rotating Key**
   - Key: `koes_zurich_2024`
   - Each byte XORed with rotated key bytes
   - Rotation based on position (bit shifting)

2. **Polynomial Encoding**
   - Function: `f(x) = (17x³ + 31x² + 13x + 7) mod 251`
   - Prime modulus: 251
   - Creates mathematical obfuscation layer

3. **Decoy Generation**
   - 5 fake data chunks interleaved with real data
   - Makes static analysis harder
   - Decoys are cryptographically random

4. **Fisher-Yates Shuffle**
   - Deterministic shuffle with seeded PRNG
   - Seed derivation obfuscated
   - Requires reversing the exact shuffle sequence

5. **VM Bytecode Generation**
   - Stack-based virtual machine instructions
   - Custom instruction set:
     - `0x02`: LOAD_CHUNK
     - `0x03`: CONCAT
     - `0x04`: DECODE_POLY
     - `0x05`: DECODE_XOR
     - `0xFF`: HALT

6. **Character Offset**
   - Final layer: `(byte + 42) mod 256`
   - Simple but adds one more step

### Runtime Deobfuscation (`src/lib/deobfuscator.ts`)

The deobfuscator reverses all layers in the correct order:

```typescript
// Execution flow:
1. Remove character offset
2. Restore chunk order (reverse shuffle)
3. Execute VM bytecode
4. Decode polynomial layer
5. Decode XOR cipher
6. Verify checksum
7. Return plaintext site key
```

### Obfuscation Metrics

- **Original size**: 24 characters
- **Obfuscated size**: ~800 bytes
- **Expansion ratio**: ~33x
- **Encoding time**: <100ms
- **Decoding time**: <10ms

## 🎮 Challenge Modes

### Level 1: Easy Mode
**Objective**: Extract the site key using browser dev tools

**Hints**:
- The deobfuscator runs client-side
- Set breakpoints in the deobfuscator code
- Watch the stack as the VM executes
- The final `return` statement has the decoded key

**Tools**: Chrome DevTools, Firefox Developer Tools

**Expected time**: 5-10 minutes

### Level 2: Medium Mode
**Objective**: Extract the key by reverse engineering the bundled JavaScript

**Hints**:
- The bundle is minified but not uglified beyond Vite defaults
- Look for the VM bytecode execution patterns
- The obfuscated payload is embedded as JSON
- Search for characteristic strings like "chunks", "vm", "seed"

**Tools**: Source map analysis, JavaScript beautifiers, grep/ripgrep

**Expected time**: 30-60 minutes

### Level 3: Hard Mode
**Objective**: Write a script to automatically extract keys from any build

**Hints**:
- Parse the JavaScript AST
- Identify the deobfuscator pattern
- Extract the obfuscated payload programmatically
- Run the deobfuscator logic in Node.js

**Tools**: Babel, Acorn, Esprima, or similar AST parsers

**Expected time**: 2-4 hours

### Level 4: Expert Mode
**Objective**: Bypass the obfuscation entirely and patch the build

**Hints**:
- The site key must reach the Turnstile API
- Network interception works better than code analysis
- Or, inject your own site key into the build process

**Tools**: Burp Suite, mitmproxy, Webpack/Vite plugins

**Expected time**: 30 minutes (if you think outside the box)

## 🛠️ Development

### Running the Obfuscator Manually

```bash
# Obfuscate a site key
node scripts/obfuscate.cjs "your-site-key-here"

# See the obfuscated payload
cat .env.local
```

### Testing Deobfuscation

```bash
# Build with obfuscation
bun run build

# Inspect the bundle
grep -A 20 "decodeSiteKey" dist/assets/*.js

# Or use a beautifier
js-beautify dist/assets/index-*.js > bundle.readable.js
```

### Modifying the Obfuscation

To increase difficulty, you can:
1. Add more encoding layers in `obfuscate.cjs`
2. Use different polynomial coefficients
3. Increase the number of decoy chunks
4. Add anti-debugging checks
5. Implement control flow flattening
6. Add timing-based decoding

Example:
```javascript
// In obfuscate.cjs
const decoyCount = 10; // Was 5, now 10
```

## 📊 Performance Impact

- **Bundle size increase**: ~5KB (deobfuscator + payload)
- **Initial load time**: +2-5ms (deobfuscation)
- **Memory overhead**: Negligible (<1MB)
- **User experience**: No visible impact

## 🐛 Debugging

### Common Issues

**Build fails with "require is not defined"**
- Make sure script files have `.cjs` extension
- package.json has `"type": "module"`

**Deobfuscation returns wrong key**
- Check that prebuild ran before the build
- Verify `.env.local` was created
- Ensure seed values match between encoder/decoder

**Site key appears in plaintext in bundle**
- Confirm `VITE_TURNSTILE_OBFUSCATED` is set (not `VITE_TURNSTILE_SITE_KEY`)
- Run `bun run prebuild` manually
- Check that deobfuscator is imported

### Debug Mode

To see deobfuscation logs in production:

```typescript
// In deobfuscator.ts, add:
console.log('[Deobfuscator] Starting...');
console.log('[Deobfuscator] Payload:', payload);
console.log('[Deobfuscator] Result:', decoded);
```

## 🏆 Hall of Fame

If you successfully extract the key, we'd love to hear how you did it!

**Extraction Methods We've Seen**:
- [Your name here]

**Submit your technique**: Create an issue describing your approach!

## 📚 References

### Obfuscation Techniques
- XOR Cipher: https://en.wikipedia.org/wiki/XOR_cipher
- Polynomial Encoding: https://en.wikipedia.org/wiki/Polynomial_ring
- Fisher-Yates Shuffle: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
- Stack Machine: https://en.wikipedia.org/wiki/Stack_machine

### JavaScript Security
- OWASP JavaScript Security Cheat Sheet
- "JavaScript: The Definitive Guide" by David Flanagan
- "Security Engineering" by Ross Anderson

### Deobfuscation Tools
- js-beautify: https://beautifier.io/
- de4js: https://github.com/lelinhtinh/de4js
- AST Explorer: https://astexplorer.net/

## 🤝 Contributing

Found a way to make the obfuscation stronger? PRs welcome!

Guidelines:
- Maintain <10ms deobfuscation time
- Don't break browser compatibility
- Add tests for new encoding layers
- Document the technique

## ⚖️ License

This obfuscation system is MIT licensed. Use it, break it, learn from it!

---

**Remember**: Security through obscurity is not security. Use this for learning purposes, not production security! 🎓
