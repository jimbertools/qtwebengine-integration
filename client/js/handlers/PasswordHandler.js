import { Handler } from './Handler.js';
import { ServerToClientCommand, ClientToServerCommand } from '../Proto.js';
import Command from '/js/models/Command.js';

/**
 * Handles managing of passwords.
 *
 * @class PasswordHandler
 * @extends {Handler}
 */
export class PasswordHandler extends Handler {
    constructor() {
        super();
        this.handlers[ServerToClientCommand.CREDENTIALSFORMSUBMITTED] = this.onCredentialsFormSubmitted.bind(this);
        this.handlers[ServerToClientCommand.PASSWORDDECRYPTIONREQUEST] = this.onPasswordDecryptionRequest.bind(this);
        this.handlers[ServerToClientCommand.MASTERSALTANDHASHFROMDATABASE] = this.onMasterSaltAndHashFromDb.bind(this);
        this.handlers[ServerToClientCommand.MASTERKEY] = this.onMasterKey.bind(this);

        this.submittedCredentialForm = null;
        this.userKey = null;
        this.passwordsToBeDecrypted = [];
        // this.loadKey();
        // this.loadKeyFromLocalStorage();
    }
    isKeyLoaded() {
        if (this.userKey) {
            return true;
        }
        return false;
    }

    async loadKeyFromLocalStorage(password) {
        console.log('loadKeyFromLocalStorage');
        const base64Salt = localStorage.getItem('MasterSalt'); // a library should not call localStorage for this... I think?
        const hashedKey = localStorage.getItem('MasterHash');
        if (!base64Salt || !hashedKey) return false;
        const salt = this.base64ToUint8Array(base64Salt);
        const inputtedKeyObj = await this.deriveKeyFromPassword(password, salt);
        console.log(inputtedKeyObj);
        const hashedInputtedKey = await this.hashKey(inputtedKeyObj.key);
        console.log(hashedKey, hashedInputtedKey);
        if (hashedInputtedKey !== hashedKey) return false;
        this.userKey = inputtedKeyObj.key;

        var c2 = new Command();
        c2.setContent(ClientToServerCommand.CACHEMASTERKEY, [await this.keyToBase64(this.userKey)]);
        c2.send();

        return true;
    }

    async hashKey(key) {
        return new Promise(async (resolve, reject) => {
            const rawUserKey = await crypto.subtle.exportKey('raw', key);
            const hashedKeyBuffer = await crypto.subtle.digest('SHA-512', rawUserKey);
            const hashedKeyArray = Array.from(new Uint8Array(hashedKeyBuffer));
            const hashHex = hashedKeyArray.map(b => b.toString(16).padStart(2, '0')).join('');
            resolve(hashHex);
        });
    }

    async keyToBase64(key) {
        return new Promise(async (resolve, reject) => {
            const rawUserKey = await crypto.subtle.exportKey('raw', key);
            resolve(this.typedArrayToBase64(new Uint8Array(rawUserKey)));
        });
    }

    async saveMasterPassword(password, salt) {
        const key = await this.deriveKeyFromPassword(password, salt);
        this.userKey = key.key;

        const encodedSalt = this.typedArrayToBase64(key.salt);
        localStorage.setItem('MasterSalt', encodedSalt);

        const hashedKeyHex = await this.hashKey(this.userKey);
        localStorage.setItem('MasterHash', hashedKeyHex);

        var c = new Command();
        c.setContent(ClientToServerCommand.SAVEMASTERSALTHANDASH, [encodedSalt, hashedKeyHex]);
        c.send();

        const keyBase64 = this.keyToBase64(this.userKey);
        var c2 = new Command();
        c2.setContent(ClientToServerCommand.CACHEMASTERKEY, [keyBase64]);
        c2.send();
    }

    onCredentialsFormSubmitted(domain, username, password) {
        if (this.submittedCredentialForm !== null) return;
        this.submittedCredentialForm = {
            domain: domain,
            username: decodeURIComponent(username),
            password: decodeURIComponent(password),
        };
    }

    onMasterSaltAndHashFromDb(salt, hash) {
        localStorage.setItem('MasterSalt', salt);
        localStorage.setItem('MasterHash', hash);
    }

    async onMasterKey(keyBase64) {
        const keyArray = this.base64ToUint8Array(keyBase64);
        const rawUserKey = await crypto.subtle.importKey(
            'raw',
            keyArray,
            {
                name: 'AES-CBC',
                length: 256,
            },
            true,
            ['encrypt', 'decrypt']
        );
        this.userKey = rawUserKey;
    }

    async saveCredentials(credentials) {
        return new Promise(async resolve => {
            const cipherObj = await this.encryptString(credentials.password, await this.userKey);

            const encPasswordBuffer = new Uint8Array(cipherObj.cipherText.byteLength + cipherObj.iv.byteLength);
            encPasswordBuffer.set(new Uint8Array(cipherObj.cipherText), 0);
            encPasswordBuffer.set(cipherObj.iv, cipherObj.cipherText.byteLength);

            const base64EncodedPasswordBuffer = btoa(String.fromCharCode(...encPasswordBuffer));

            var c = new Command();
            c.setContent(ClientToServerCommand.SAVECREDENTIALS, [
                credentials.domain,
                encodeURIComponent(credentials.username),
                base64EncodedPasswordBuffer,
            ]);
            c.send();
            resolve();
        });
    }
    async deriveKeyFromPassword(password, salt) {
        const encoder = new TextEncoder(); // always utf-8
        const encodedPassword = encoder.encode(password);
        const cryptoPassword = await window.crypto.subtle.importKey('raw', encodedPassword, 'PBKDF2', false, [
            'deriveKey',
        ]);

        if (!salt) {
            salt = new Uint8Array(16);
            crypto.getRandomValues(salt);
        }
        return {
            key: await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    hash: 'SHA-512',
                    salt: salt,
                    iterations: 100000,
                },
                cryptoPassword,
                {
                    name: 'AES-CBC',
                    length: 256,
                },
                true,
                ['encrypt', 'decrypt']
            ),
            salt: salt,
        };
    }
    async encryptString(plainText, key, iv) {
        const encoder = new TextEncoder();
        if (!iv) {
            iv = new Uint8Array(16);
            crypto.getRandomValues(iv);
        }
        const aesProps = { name: 'AES-CBC', iv: iv };
        return {
            cipherText: await crypto.subtle.encrypt(aesProps, key, encoder.encode(plainText)),
            iv: iv,
        };
    }
    async decryptString(cipherText, key, iv) {
        const decoder = new TextDecoder();
        const aesProps = { name: 'AES-CBC', iv: iv };
        const decryptedPlaintext = await crypto.subtle.decrypt(aesProps, key, cipherText);
        return decoder.decode(decryptedPlaintext);
    }

    async onPasswordDecryptionRequest(domain, base64EncodedPassword) {
        if (!this.isKeyLoaded()) {
            console.log('key is not loaded');
            this.passwordsToBeDecrypted.push({ domain: domain, password: base64EncodedPassword });
            return;
        }

        try {
            const passwordAndIv = this.base64ToUint8Array(base64EncodedPassword);
            const iv = new Uint8Array(passwordAndIv.slice(passwordAndIv.byteLength - 16, passwordAndIv.byteLength));
            const password = new Uint8Array(passwordAndIv.slice(0, passwordAndIv.byteLength - 16));
            const plainTextPassword = await this.decryptString(password, this.userKey, iv);
            var c = new Command();
            c.setContent(ClientToServerCommand.PASSWORDDECRYPTIONRESPONSE, [
                domain,
                encodeURIComponent(plainTextPassword),
            ]);
            c.send();
        } catch (e) {
            console.log(e);
        }
    }

    resetPasswordManager() {
        var c = new Command();
        c.setContent(ClientToServerCommand.RESETPASSWORDMANAGER, []);
        c.send();
        localStorage.removeItem('MasterSalt');
        localStorage.removeItem('MasterHash');
    }

    typedArrayToBase64(typedArray) {
        return btoa(String.fromCharCode(...typedArray));
    }

    base64ToUint8Array(array) {
        return Uint8Array.from(atob(array), c => c.charCodeAt(0));
    }
}

export default PasswordHandler;
