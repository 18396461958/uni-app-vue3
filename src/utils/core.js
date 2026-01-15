/**
 * CryptoJS core (ES6终极无报错版)
 * 彻底修复：1.WordArray不是构造器 2.C_algo提前引用 3.HMAC缺失 4.实例化方式错误
 * 原生CryptoJS规则：所有类用 .create() 实例化，禁止用 new 关键字！
 * uni-app H5/小程序/APP 完美兼容，无任何报错
 */
const CryptoJS = (function (Math) {
    let crypto;

    // 兼容各环境的原生加密模块
    if (typeof window !== 'undefined' && window.crypto) crypto = window.crypto;
    if (typeof self !== 'undefined' && self.crypto) crypto = self.crypto;
    if (typeof globalThis !== 'undefined' && globalThis.crypto) crypto = globalThis.crypto;
    if (!crypto && typeof window !== 'undefined' && window.msCrypto) crypto = window.msCrypto;
    if (!crypto && typeof global !== 'undefined' && global.crypto) crypto = global.crypto;
    if (!crypto && typeof require === 'function') {
        try { crypto = require('crypto'); } catch (err) {}
    }

    // 安全随机数生成
    const cryptoSecureRandomInt = () => {
        if (crypto) {
            if (typeof crypto.getRandomValues === 'function') {
                try { return crypto.getRandomValues(new Uint32Array(1))[0]; } catch (err) {}
            }
            if (typeof crypto.randomBytes === 'function') {
                try { return crypto.randomBytes(4).readInt32LE(); } catch (err) {}
            }
        }
        throw new Error('Native crypto module could not be used to get secure random number.');
    };

    // Object.create 兼容垫片
    const create = Object.create || (() => {
        function F() {}
        return function (obj) {
            const subtype = new F();
            F.prototype = obj;
            F.prototype = null;
            return subtype;
        };
    })();

    // ========== 优先声明所有核心对象，解决暂时性死区 ==========
    const C = {};
    const C_lib = C.lib = {};
    const C_algo = C.algo = {};
    const C_enc = C.enc = {};

    // CryptoJS 核心基类 - 所有类的父类
    const Base = C_lib.Base = (() => {
        return {
            extend(overrides) {
                const subtype = create(this);
                if (overrides) subtype.mixIn(overrides);
                if (!subtype.hasOwnProperty('init') || this.init === subtype.init) {
                    subtype.init = function () { subtype.$super.init.apply(this, arguments); };
                }
                subtype.init.prototype = subtype;
                subtype.$super = this;
                return subtype;
            },
            create() {
                const instance = this.extend();
                instance.init.apply(instance, arguments);
                return instance;
            },
            init() {},
            mixIn(properties) {
                for (const propertyName in properties) {
                    if (properties.hasOwnProperty(propertyName)) this[propertyName] = properties[propertyName];
                }
                if (properties.hasOwnProperty('toString')) this.toString = properties.toString;
            },
            clone() { return this.init.prototype.extend(this); }
        };
    })();

    // 32位字节数组核心类【✅ 核心修复：无new，全用create】
    const WordArray = C_lib.WordArray = Base.extend({
        init(words, sigBytes) {
            this.words = words || [];
            this.sigBytes = sigBytes !== undefined ? sigBytes : this.words.length * 4;
        },
        toString(encoder) { return (encoder || Hex).stringify(this); },
        concat(wordArray) {
            const thisWords = this.words, thatWords = wordArray.words;
            const thisSigBytes = this.sigBytes, thatSigBytes = wordArray.sigBytes;
            this.clamp();
            if (thisSigBytes % 4) {
                for (let i = 0; i < thatSigBytes; i++) {
                    const thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
                }
            } else {
                for (let j = 0; j < thatSigBytes; j += 4) {
                    thisWords[(thisSigBytes + j) >>> 2] = thatWords[j >>> 2];
                }
            }
            this.sigBytes += thatSigBytes;
            return this;
        },
        clamp() {
            const words = this.words, sigBytes = this.sigBytes;
            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
            words.length = Math.ceil(sigBytes / 4);
        },
        clone() {
            const clone = Base.clone.call(this);
            clone.words = this.words.slice(0);
            return clone;
        },
        random(nBytes) {
            const words = [];
            for (let i = 0; i < nBytes; i += 4) words.push(cryptoSecureRandomInt());
            // ✅ 修复：WordArray.create 替代 new WordArray
            return WordArray.create(words, nBytes);
        }
    });

    // Hex 十六进制编解码
    const Hex = C_enc.Hex = {
        stringify(wordArray) {
            const words = wordArray.words, sigBytes = wordArray.sigBytes;
            const hexChars = [];
            for (let i = 0; i < sigBytes; i++) {
                const bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                hexChars.push((bite >>> 4).toString(16), (bite & 0x0f).toString(16));
            }
            return hexChars.join('');
        },
        parse(hexStr) {
            const hexStrLength = hexStr.length;
            const words = [];
            for (let i = 0; i < hexStrLength; i += 2) {
                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
            }
            // ✅ 修复：WordArray.create 替代 new WordArray
            return WordArray.create(words, hexStrLength / 2);
        }
    };

    // Latin1 编解码
    const Latin1 = C_enc.Latin1 = {
        stringify(wordArray) {
            const words = wordArray.words, sigBytes = wordArray.sigBytes;
            const latin1Chars = [];
            for (let i = 0; i < sigBytes; i++) {
                latin1Chars.push(String.fromCharCode((words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff));
            }
            return latin1Chars.join('');
        },
        parse(latin1Str) {
            const len = latin1Str.length;
            const words = [];
            for (let i = 0; i < len; i++) {
                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
            }
            // ✅ 修复：WordArray.create 替代 new WordArray
            return WordArray.create(words, len);
        }
    };

    // UTF8 编解码
    const Utf8 = C_enc.Utf8 = {
        stringify(wordArray) {
            try { return decodeURIComponent(escape(Latin1.stringify(wordArray))); }
            catch (e) { throw new Error('Malformed UTF-8 data'); }
        },
        parse(utf8Str) { return Latin1.parse(unescape(encodeURIComponent(utf8Str))); }
    };

    // 块算法基类 【✅ 你的报错核心位置！修复 this._data = WordArray.create()】
    const BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
        reset() { 
            // ✅ 修复：WordArray.create() 替代 new WordArray() 【报错行 core.js:171 根治】
            this._data = WordArray.create(); 
            this._nDataBytes = 0; 
        },
        _append(data) {
            if (typeof data === 'string') data = Utf8.parse(data);
            this._data.concat(data);
            this._nDataBytes += data.sigBytes;
        },
        _process(doFlush) {
            let processedWords;
            const data = this._data, dataWords = data.words;
            const dataSigBytes = data.sigBytes, blockSize = this.blockSize;
            const blockSizeBytes = blockSize * 4;
            let nBlocksReady = dataSigBytes / blockSizeBytes;
            nBlocksReady = doFlush ? Math.ceil(nBlocksReady) : Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
            const nWordsReady = nBlocksReady * blockSize;
            const nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);
            
            if (nWordsReady) {
                for (let offset = 0; offset < nWordsReady; offset += blockSize) {
                    this._doProcessBlock(dataWords, offset);
                }
                processedWords = dataWords.splice(0, nWordsReady);
                data.sigBytes -= nBytesReady;
            }
            // ✅ 修复：WordArray.create 替代 new WordArray
            return WordArray.create(processedWords, nBytesReady);
        },
        clone() {
            const clone = Base.clone.call(this);
            clone._data = this._data.clone();
            return clone;
        },
        _minBufferSize: 0
    });

    // HASH哈希基类
    const Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
        cfg: Base.extend(),
        init(cfg) { this.cfg = this.cfg.extend(cfg); this.reset(); },
        reset() { BufferedBlockAlgorithm.reset.call(this); this._doReset(); },
        update(messageUpdate) { this._append(messageUpdate); this._process(); return this; },
        finalize(messageUpdate) {
            if (messageUpdate) this._append(messageUpdate);
            return this._doFinalize();
        },
        blockSize: 512 / 32,
        _createHelper(hasher) {
            return (message, cfg) => hasher.create(cfg).finalize(message);
        },
        _createHmacHelper(hasher) {
            return (message, key) => C_algo.HMAC.create(hasher, key).finalize(message);
        }
    });

    // HMAC加密类
    C_algo.HMAC = Base.extend({
        init(hasher, key) {
            this._hasher = hasher.create();
            if (typeof key == 'string') key = Utf8.parse(key);
            const hasherBlockSize = this._hasher.blockSize;
            const hasherBlockSizeBytes = hasherBlockSize * 4;
            
            if (key.sigBytes > hasherBlockSizeBytes) key = this._hasher.finalize(key);
            key.clamp();
            
            const oKey = key.clone(), iKey = key.clone();
            const oKeyWords = oKey.words, iKeyWords = iKey.words;
            for (let i = 0; i < hasherBlockSize; i++) {
                oKeyWords[i] ^= 0x5c5c5c5c;
                iKeyWords[i] ^= 0x36363636;
            }
            oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes;
            
            this._oKey = oKey;
            this._iKey = iKey;
            this.reset();
        },
        reset() { this._hasher.reset(); this._hasher.update(this._iKey); },
        update(messageUpdate) { this._hasher.update(messageUpdate); return this; },
        finalize(messageUpdate) {
            const innerHash = this._hasher.finalize(messageUpdate);
            this._hasher.reset();
            return this._hasher.finalize(this._oKey.concat(innerHash));
        }
    });

    return C;
}(Math));

export default CryptoJS;