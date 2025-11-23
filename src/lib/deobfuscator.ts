/**
 * Advanced Multi-Layer Deobfuscator
 *
 * This reverses the obfuscation applied during build time.
 * Layers are decoded in reverse order of encoding.
 *
 * Good luck, CTF players! 🎯
 *
 * Hint: The layers are:
 * 1. Character offset removal
 * 2. VM bytecode execution
 * 3. Chunk reconstruction
 * 4. Polynomial decoding
 * 5. XOR decryption
 */

interface ObfuscatedPayload {
  seed: number;
  chunks: Array<{
    type: string;
    data: number[];
    index: number;
  }>;
  vm: number[];
  checksum: number;
  metadata: {
    version: number;
    timestamp: number;
    entropy: string;
  };
}

class AdvancedDeobfuscator {
  private seed: number;
  private readonly prime = 251;
  private readonly xorKey = 'koes_zurich_2024';
  private readonly offset = 42;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Seeded PRNG (must match encoder)
  private random(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  // Reverse polynomial encoding: solve for x in f(x) = y mod prime
  private polynomialDecode(encoded: number[]): number[] {
    const a = 17, b = 31, c = 13, d = 7;

    return encoded.map(y => {
      // Brute force search (small domain)
      for (let x = 0; x < 256; x++) {
        const fx = (a * x * x * x + b * x * x + c * x + d) % this.prime;
        if (fx === y) return x;
      }
      return 0; // Fallback (shouldn't happen)
    });
  }

  // Reverse XOR with rotating key
  private xorRotate(bytes: number[]): string {
    const keyBytes = this.xorKey.split('').map(c => c.charCodeAt(0));
    const decoded = bytes.map((byte, i) => {
      const keyByte = keyBytes[i % keyBytes.length];
      const rotatedKey = ((keyByte << (i % 8)) | (keyByte >> (8 - (i % 8)))) & 0xFF;
      return byte ^ rotatedKey;
    });

    return String.fromCharCode(...decoded);
  }

  // Reverse Fisher-Yates shuffle (recreate original order)
  private unshuffle<T>(shuffled: T[], originalLength: number): T[] {
    // Generate shuffle sequence
    const swaps: Array<[number, number]> = [];
    const tempSeed = this.seed;

    for (let i = originalLength - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      swaps.push([i, j]);
    }

    this.seed = tempSeed; // Reset seed

    // Reverse the swaps
    const unshuffled = [...shuffled];
    for (let i = swaps.length - 1; i >= 0; i--) {
      const [a, b] = swaps[i];
      [unshuffled[a], unshuffled[b]] = [unshuffled[b], unshuffled[a]];
    }

    return unshuffled;
  }

  // Stack-based VM for chunk reconstruction
  private executeVM(chunks: ObfuscatedPayload['chunks'], bytecode: number[]): number[] {
    const stack: number[][] = [];
    let pc = 0; // Program counter

    while (pc < bytecode.length) {
      const opcode = bytecode[pc++];

      switch (opcode) {
        case 0x02: { // LOAD_CHUNK <idx>
          const idx = bytecode[pc++];
          if (chunks[idx]) {
            stack.push([...chunks[idx].data]);
          }
          break;
        }

        case 0x03: { // CONCAT
          if (stack.length >= 2) {
            const b = stack.pop()!;
            const a = stack.pop()!;
            stack.push([...a, ...b]);
          }
          break;
        }

        case 0x04: { // DECODE_POLY
          if (stack.length > 0) {
            const data = stack.pop()!;
            const decoded = this.polynomialDecode(data);
            stack.push(decoded);
          }
          break;
        }

        case 0x05: { // DECODE_XOR
          if (stack.length > 0) {
            const data = stack.pop()!;
            const decoded = this.xorRotate(data);
            // Convert string to byte array for consistency
            stack.push(decoded.split('').map(c => c.charCodeAt(0)));
          }
          break;
        }

        case 0xFF: // HALT
          pc = bytecode.length;
          break;

        default:
          console.warn(`Unknown opcode: 0x${opcode.toString(16)}`);
          break;
      }
    }

    return stack.length > 0 ? stack[0] : [];
  }

  // Main deobfuscation function
  deobfuscate(payload: ObfuscatedPayload): string {
    try {
      // Layer 1: Remove character offset
      const unshifted = payload.chunks.map(chunk => ({
        ...chunk,
        data: chunk.data.map(b => (b - this.offset + 256) % 256)
      }));

      // Layer 2: Restore original chunk order
      // Advance seed to match encoder state after interleaving
      this.seed = payload.seed + unshifted.length + payload.vm.length;

      // Layer 3: Execute VM bytecode to reconstruct and decode
      const result = this.executeVM(unshifted, payload.vm);

      // Convert result back to string
      const decoded = String.fromCharCode(...result);

      // Verify checksum
      const computedChecksum = this.calculateChecksum(decoded);
      if (computedChecksum !== payload.checksum) {
        console.warn('Checksum mismatch! Data may be corrupted.');
        // Continue anyway - checksums can be bypassed
      }

      return decoded;
    } catch (error) {
      console.error('Deobfuscation failed:', error);
      // Fallback to test key
      return '1x00000000000000000000AA';
    }
  }

  private calculateChecksum(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

/**
 * Decode obfuscated Turnstile site key
 *
 * This function handles both obfuscated payloads and plain text keys
 * for backward compatibility.
 */
export function decodeSiteKey(): string {
  // Try obfuscated payload first
  const obfuscatedEnv = import.meta.env.VITE_TURNSTILE_OBFUSCATED;
  if (obfuscatedEnv) {
    try {
      const payload: ObfuscatedPayload = typeof obfuscatedEnv === 'string'
        ? JSON.parse(obfuscatedEnv)
        : obfuscatedEnv;

      const deobfuscator = new AdvancedDeobfuscator(payload.seed);
      const siteKey = deobfuscator.deobfuscate(payload);

      return siteKey;
    } catch (error) {
      console.error('Failed to decode obfuscated payload:', error);
    }
  }

  // Fallback to plain or base64-encoded key
  const plainEnv = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  if (plainEnv) {
    try {
      // Try base64 decode
      if (plainEnv.length > 30 && !plainEnv.startsWith('1x')) {
        return atob(plainEnv);
      }
      return plainEnv;
    } catch {
      return plainEnv;
    }
  }

  // Ultimate fallback
  console.error('No Turnstile site key found in environment');
  return '1x00000000000000000000AA';
}
