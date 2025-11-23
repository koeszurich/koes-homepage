#!/usr/bin/env node

/**
 * Advanced Multi-Layer Obfuscator for Cloudflare Turnstile Site Key
 *
 * WARNING: This is security theater! Client-side obfuscation can ALWAYS be reversed.
 * The purpose is to make extraction challenging for CTF players, not to provide real security.
 *
 * Obfuscation Layers:
 * 1. XOR cipher with rotating key derived from deterministic seed
 * 2. Polynomial encoding with prime modulus
 * 3. Array shuffling using Fisher-Yates with seeded PRNG
 * 4. Character code manipulation with offset sequences
 * 5. Multi-chunk splitting with interleaved dead data
 * 6. Stack-based VM bytecode for final reconstruction
 */

class AdvancedObfuscator {
  constructor(seed = 0x7355608) {
    this.seed = seed;
    this.prime = 251; // Prime number for modular arithmetic
  }

  // Seeded PRNG for deterministic shuffling
  random() {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  // XOR with rotating key
  xorRotate(str, key) {
    const keyBytes = key.split('').map(c => c.charCodeAt(0));
    return str.split('').map((c, i) => {
      const charCode = c.charCodeAt(0);
      const keyByte = keyBytes[i % keyBytes.length];
      const rotatedKey = ((keyByte << (i % 8)) | (keyByte >> (8 - (i % 8)))) & 0xFF;
      return charCode ^ rotatedKey;
    });
  }

  // Polynomial encoding: f(x) = (a*x^3 + b*x^2 + c*x + d) mod prime
  polynomialEncode(bytes) {
    const a = 17, b = 31, c = 13, d = 7;
    return bytes.map(byte => {
      const encoded = (a * byte * byte * byte + b * byte * byte + c * byte + d) % this.prime;
      return encoded;
    });
  }

  // Fisher-Yates shuffle with seeded random
  shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Generate decoy chunks to interleave with real data
  generateDecoys(count, length) {
    const decoys = [];
    for (let i = 0; i < count; i++) {
      const decoy = Array.from({ length }, () => Math.floor(this.random() * 256));
      decoys.push(decoy);
    }
    return decoys;
  }

  // Create interleaved data structure with real data and decoys
  interleave(data, decoys) {
    const chunks = [];
    const chunkSize = Math.ceil(data.length / (decoys.length + 1));

    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push({
        type: 'real',
        data: data.slice(i, i + chunkSize),
        index: chunks.length
      });

      if (decoys.length > 0) {
        chunks.push({
          type: 'decoy',
          data: decoys.shift(),
          index: chunks.length
        });
      }
    }

    return this.shuffle(chunks);
  }

  // Generate stack-based VM bytecode for reconstruction
  generateVMBytecode(chunks) {
    const bytecode = [];
    const realIndices = [];

    chunks.forEach((chunk, idx) => {
      if (chunk.type === 'real') {
        realIndices.push(idx);
      }
    });

    // VM Instructions:
    // 0x01: PUSH <index>
    // 0x02: LOAD_CHUNK <chunk_idx>
    // 0x03: CONCAT
    // 0x04: DECODE_POLY
    // 0x05: DECODE_XOR
    // 0x06: CHAR_SHIFT <offset>
    // 0xFF: HALT

    realIndices.forEach(idx => {
      bytecode.push(0x02, idx); // LOAD_CHUNK
    });

    for (let i = 0; i < realIndices.length - 1; i++) {
      bytecode.push(0x03); // CONCAT
    }

    bytecode.push(0x04); // DECODE_POLY
    bytecode.push(0x05); // DECODE_XOR
    bytecode.push(0xFF); // HALT

    return bytecode;
  }

  // Main obfuscation function
  obfuscate(siteKey) {
    console.log('[Obfuscator] Starting advanced obfuscation...');

    // Layer 1: XOR with rotating key
    const xorKey = 'koes_zurich_2024';
    const xored = this.xorRotate(siteKey, xorKey);
    console.log('[Obfuscator] Layer 1: XOR encoding complete');

    // Layer 2: Polynomial encoding
    const polyEncoded = this.polynomialEncode(xored);
    console.log('[Obfuscator] Layer 2: Polynomial encoding complete');

    // Layer 3: Generate decoys
    const decoyCount = 5;
    const decoys = this.generateDecoys(decoyCount, 8);
    console.log(`[Obfuscator] Layer 3: Generated ${decoyCount} decoy chunks`);

    // Layer 4: Interleave real data with decoys
    const interleaved = this.interleave(polyEncoded, decoys);
    console.log('[Obfuscator] Layer 4: Data interleaving complete');

    // Layer 5: Generate VM bytecode
    const bytecode = this.generateVMBytecode(interleaved);
    console.log('[Obfuscator] Layer 5: VM bytecode generation complete');

    // Layer 6: Additional character offset
    const offset = 42;
    const finalChunks = interleaved.map(chunk => ({
      ...chunk,
      data: chunk.data.map(b => (b + offset) % 256)
    }));

    const result = {
      seed: this.seed - interleaved.length - bytecode.length, // Obfuscate seed
      chunks: finalChunks,
      vm: bytecode,
      checksum: this.calculateChecksum(siteKey),
      metadata: {
        version: 2,
        timestamp: Date.now(),
        entropy: Math.random().toString(36).substring(7)
      }
    };

    console.log('[Obfuscator] Obfuscation complete!');
    console.log(`[Obfuscator] Original length: ${siteKey.length}`);
    console.log(`[Obfuscator] Obfuscated size: ${JSON.stringify(result).length} bytes`);
    console.log(`[Obfuscator] Expansion ratio: ${(JSON.stringify(result).length / siteKey.length).toFixed(2)}x`);

    return result;
  }

  calculateChecksum(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

// CLI interface
if (require.main === module) {
  const siteKey = process.argv[2] || process.env.VITE_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    console.error('Usage: node obfuscate.js <site-key>');
    console.error('   or: VITE_TURNSTILE_SITE_KEY=<key> node obfuscate.js');
    process.exit(1);
  }

  const obfuscator = new AdvancedObfuscator();
  const result = obfuscator.obfuscate(siteKey);

  console.log('\n[Obfuscator] Generated obfuscated payload:');
  console.log(JSON.stringify(result, null, 2));

  // Also output as compact single-line for .env
  console.log('\n[Obfuscator] Compact payload for .env:');
  console.log(`VITE_TURNSTILE_OBFUSCATED='${JSON.stringify(result)}'`);
}

module.exports = AdvancedObfuscator;
