import OpenCrypto from 'opencrypto'
import { saveAs } from 'file-saver';
import CryptoJS from "crypto-js";
import { encode, decode } from 'base64-arraybuffer';
import { joinUINT8arrays } from './joinUint8arrays';
import rbjs from "random-bytes-js/lib";




// Initialize new OpenCrypto instance
const crypt = new OpenCrypto()

const generateAESKey = async () => {
	const key = await rbjs.rand64(32);
	return key;
}
const decryptAES_key = async (privateKey_pem, encrypted_AESkey) => {
	const privateKey_crypto = await crypt.pemPrivateToCrypto(privateKey_pem);
	const decryptedData = await crypt.rsaDecrypt(privateKey_crypto, encrypted_AESkey);
	return encode(decryptedData);
}

const encryptAES_key = async (publicKey_pem, AESkey) => {
	const publicKey_crypto = await crypt.pemPublicToCrypto(publicKey_pem);
	const encrypted_AESkey = await crypt.rsaEncrypt(publicKey_crypto, decode(AESkey));
	return encrypted_AESkey;
}

const generateRSAKeyPair = async () => {
	try {
		const keyPair = await crypt.getRSAKeyPair();
		const privateKey = await crypt.cryptoPrivateToPem(keyPair.privateKey);
		const publicKey = await crypt.cryptoPublicToPem(keyPair.publicKey);
		return [privateKey, publicKey];
	} catch (error) {
		console.error("Failed to generate!", error);
	}
}

const savePrivateKey = (accountAddress, privateKey) => {
	try {
		const blob = new Blob([privateKey], { type: "text/plain;charset=utf-8" });
		saveAs(blob, `${accountAddress}.pem`);
	} catch (error) {
		console.error("Failed to save!", error);
	}

}

const verifyKeyPair = async (privateKey, publicKey) => {
	try {
		const cryptoPriK = await crypt.pemPrivateToCrypto(privateKey)
		const rPubK = await crypt.cryptoPublicToPem(await crypt.getPublicKey(cryptoPriK));;
		return publicKey === rPubK
	} catch (error) {
		console.error("Failed to verify!", error);
	}
}

function convertWordArrayToUint8Array(wordArray) {
	var arrayOfWords = wordArray.hasOwnProperty("words") ? wordArray.words : [];
	var length = wordArray.hasOwnProperty("sigBytes") ? wordArray.sigBytes : arrayOfWords.length * 4;
	var uInt8Array = new Uint8Array(length), index = 0, word, i;
	for (i = 0; i < length; i++) {
		word = arrayOfWords[i];
		uInt8Array[index++] = word >> 24;
		uInt8Array[index++] = (word >> 16) & 0xff;
		uInt8Array[index++] = (word >> 8) & 0xff;
		uInt8Array[index++] = word & 0xff;
	}
	return uInt8Array;
}

function decrypt_and_download(filename, bufferArr, key) {
	const data = encode(bufferArr)
	// const data = encode(joinUINT8arrays(bufferArr).buffer)
	var decrypted = CryptoJS.AES.decrypt(data, key);               // Decryption: I: Base64 encoded string (OpenSSL-format) -> O: WordArray
	var typedArray = convertWordArrayToUint8Array(decrypted);               // Convert: WordArray -> typed array
	var fileDec = new Blob([typedArray]);                                   // Create blob from typed array
	saveAs(fileDec, filename)
}
export { generateRSAKeyPair, savePrivateKey, verifyKeyPair, decrypt_and_download, decryptAES_key, encryptAES_key, generateAESKey };