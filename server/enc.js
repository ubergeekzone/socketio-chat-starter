'use strict';

const crypto = require('crypto');

//const ENCRYPTION_KEY = "4383f7b38a6971d2cdac781d75ff1dc1"; // Must be 256 bits (32 characters)
//const ENCRYPTION_KEY = crypto.randomBytes(32);

function genSerectKey() {
    return crypto.randomBytes(16).toString('hex');
}

function encrypt(text, ENCRYPTION_KEY) {
 let iv = crypto.randomBytes(16);
 //let iv = "8765223814574141";
 let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
 let encrypted = cipher.update(text);
 encrypted = Buffer.concat([encrypted, cipher.final()]);
 return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text, ENCRYPTION_KEY) {
 let textParts = text.split(':');
 let iv = Buffer.from(textParts.shift(), 'hex');
 let encryptedText = Buffer.from(textParts.join(':'), 'hex');
 let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
 let decrypted = decipher.update(encryptedText);
 decrypted = Buffer.concat([decrypted, decipher.final()]);
 return decrypted.toString();
}

function reEncrypt(hash) {
    const ENCRYPTION_KEY = crypto.randomBytes(32);
    const hash_encrypt = encrypt(hash, ENCRYPTION_KEY);
    //console.log(hash_encrypt);
    const hash_decrypt = decrypt(hash_encrypt,  ENCRYPTION_KEY);
    //console.log(hash_decrypt);
    return hash_decrypt;
}

module.exports = { decrypt, encrypt,reEncrypt, genSerectKey };