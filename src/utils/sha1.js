import CryptoJS from './core';

const C = CryptoJS;
const C_lib = C.lib;
const WordArray = C_lib.WordArray;
const Hasher = C_lib.Hasher;
const C_algo = C.algo;

const W = [];

// SHA1核心算法实现
const SHA1 = C_algo.SHA1 = Hasher.extend({
  _doReset() {
    // ✅ 核心修复：WordArray.create 替代 new WordArray 【sha1里唯一的报错点】
    this._hash = WordArray.create([
      0x67452301, 0xefcdab89,
      0x98badcfe, 0x10325476,
      0xc3d2e1f0
    ]);
  },

  _doProcessBlock(M, offset) {
    const H = this._hash.words;
    let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4];

    for (let i = 0; i < 80; i++) {
      if (i < 16) {
        W[i] = M[offset + i] | 0;
      } else {
        const n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
        W[i] = (n << 1) | (n >>> 31);
      }

      let t = ((a << 5) | (a >>> 27)) + e + W[i];
      if (i < 20) {
        t += ((b & c) | (~b & d)) + 0x5a827999;
      } else if (i < 40) {
        t += (b ^ c ^ d) + 0x6ed9eba1;
      } else if (i < 60) {
        t += ((b & c) | (b & d) | (c & d)) - 0x70e44324;
      } else {
        t += (b ^ c ^ d) - 0x359d3e2a;
      }

      e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
    }

    H[0] = (H[0] + a) | 0;
    H[1] = (H[1] + b) | 0;
    H[2] = (H[2] + c) | 0;
    H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0;
  },

  _doFinalize() {
    const data = this._data;
    const dataWords = data.words;

    const nBitsTotal = this._nDataBytes * 8;
    const nBitsLeft = data.sigBytes * 8;

    dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
    dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
    dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
    data.sigBytes = dataWords.length * 4;

    this._process();
    return this._hash;
  },

  clone() {
    const clone = Hasher.clone.call(this);
    clone._hash = this._hash.clone();
    return clone;
  }
});

C.SHA1 = Hasher._createHelper(SHA1);
C.HmacSHA1 = Hasher._createHmacHelper(SHA1);

export default CryptoJS.SHA1;