# Jimber PasswordManager

## Why

We value our users' experience a lot. That's one of the most important things about browser isolation; A user should never feel like they are not using their native browser. One of the missing key features are auto-filled/suggested credentials (or any input field for that matter). Sadly QtWebEngine completely stripped the built-in Chromium PasswordManager and field suggestions.
While we are strong believers of the *Never roll your own ...* mindset, their stripping resulted in us having to create our own PasswordManager.

## How

Storing passwords securely is not an easy task. You have to make sure that if anyone would have access to the passwords, be it a text file or any other flat file, they can not simply read them. A *real* password manager would take this further and will make sure that in case of a memory dump, the decrypted passwords would not be in plaintext. We don't go this far.

Encrypting on the server or encrypting on the client. Each had their own advantages and disadvantages.  
In the end we chose to encrypt on the client due to the better cryptographic abstractions the Web Crypto API exposes.

### Encrypting the credentials

When a form submit is detected, the credentials are sent to the user's browser. There the password is encrypted using [Web Crypto API's](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) [AES-CBC]() encryption with a 256-bit master key and a 128-bit iv.

``` js
iv = new Uint8Array(16);
crypto.getRandomValues(iv);
const properties = {
    name: "AES-CBC",
    iv: iv
};
const cipherText = await crypto.subtle.encrypt(properties, masterKey, password)
```

The encrypted password with the iv concatenated at the end of the bytes is sent to the server where it is stored together with the corresponding domain and username.

### Master password

![xkcd crypto joke](https://imgs.xkcd.com/comics/security.png)

  
WE USE THE UNCRACKABLE AES 256 BIT ENCRYPTION ALGORITHM WITH A 128 BIT IV TO MAKE OUR PASSWORD MANAGER THE BEST PASSWORD MANAGER THERE IS.

Yeah right. Encryption is worth nothing without a proper key.  
Humans are notoriously bad at creating and remembering passwords. We try to solve this in several ways. One of them is the requirement that the master password must be a minimum of 10 characters long.

If the encrypted password file would fall into the wrong hands. There are is only one way other than cracking AES to gain access to the encrypted passwords.  
That is to brute-force or dictionary attack the master password of the user.

For this reason we don't simply use the master password as the master key.  
This is where a key derivation function ([kfd](https://en.wikipedia.org/wiki/Key_derivation_function)) comes into place.  
Simply said, we add some salt to the master password and [sha](https://en.wikipedia.org/wiki/Secure_Hash_Algorithms)ke it n-times (iterations).  
We use [Password-Based Key Derivation Function 2](https://en.wikipedia.org/wiki/PBKDF2) for this.

``` js
salt = new Uint8Array(16);
crypto.getRandomValues(salt);

const masterKey = await crypto.subtle.deriveKey({
        name: "PBKDF2",
        hash: "SHA-512",
        salt: salt,
        iterations: 100000
    },
    masterPassword, 
    {
        name: "AES-CBC",
        length: 256
    },
    true,
    ["encrypt", "decrypt"]
);
```

### tying everything together

We should treat the user's browser as volatile memory, cookies get eaten, localStorage gets cleared, ...  
For this reason we store the salt of the masterkey on the server. Even if the user opens their isolated browser on another pc, they can still access their password manager.

For convenience sake we also store a hash of the user's master key, not master password, on the server. Only accessible on their instance of course.  
This is so if a user re-inputs their master password, we can validate it in an easy manner.

