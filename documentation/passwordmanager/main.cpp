#include <openssl/conf.h>
#include <openssl/evp.h>
#include <openssl/err.h>
#include <openssl/kdf.h>
#include <openssl/rand.h>
#include <string.h>
#include <iostream>

/*
* 128 Bits
* https://tools.ietf.org/html/rfc3602#section-2.4 
*/
#define AES_BLOCKSIZE 16;

void handleErrors(void);
int encrypt(unsigned char *plaintext,
            int plaintext_len,
            unsigned char *key,
            unsigned char *iv,
            unsigned char *ciphertext);
int decrypt(unsigned char *ciphertext,
            int ciphertext_len,
            unsigned char *key,
            unsigned char *iv,
            unsigned char *plaintext);

// void PBKDF2_HMAC_SHA_512(const char *pass, int passlen, const unsigned char *salt, int saltlen, int32_t iterations, uint8_t key_size, unsigned char *key)
// {
//     // unsigned char digest[outputBytes];
//     PKCS5_PBKDF2_HMAC(pass, passlen, salt, saltlen, iterations, EVP_sha512(), key_size, key);
//     // for (i = 0; i < sizeof(digest); i++)
//     // {
//     //     sprintf(hexResult + (i * 2), "%02x", 255 & digest[i]);
//     //     binResult[i] = digest[i];
//     // };
// }

void kdf(const char *password, int passlen, unsigned char *salt, int saltlen, unsigned char *key, int key_size)
{
    uint32_t iterations = 100000; // All the iterations!
    memset(key, 0, sizeof(key_size));
    PKCS5_PBKDF2_HMAC(password, passlen, salt, saltlen, iterations, EVP_sha512(), key_size, key);
}
int main(void)
{
    /* Users passphrase */
    char password[] = "supersecret";

    /* Message to be encrypted */
    unsigned char plaintext[] = "walloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloefwalloef";

    /* A 128 bit salt */
    int salt_len = 16;
    unsigned char salt[salt_len];
    RAND_bytes(salt, salt_len);

    /* A 256 bit key */
    int keysize = 32;
    unsigned char key[keysize + 1];

    kdf(password, strlen(password), salt, salt_len, key, 32);

    /* A 128 bit IV */
    int iv_len = 16;
    unsigned char iv[iv_len];
    RAND_bytes(iv, iv_len);

    /*
     * Buffer for ciphertext. Ensure the buffer is long enough for the
     * ciphertext which may be longer than the plaintext, depending on the
     * algorithm and mode.
     */
    unsigned char ciphertext[strlen((char *)plaintext) + 16 - (strlen((char *)plaintext)) % 16];
    EVP_CIPHER_CTX *ctx;
    ctx = EVP_CIPHER_CTX_new();
    EVP_EncryptInit_ex(ctx, EVP_aes_256_cbc(), NULL, key, iv);
    std::cout << "size is " <<  EVP_CIPHER_CTX_block_size(ctx) << std::endl;
    // unsigned char ciphertext[EVP_CIPHER_CTX_block_size(ctx)];

    /* Buffer for the decrypted text */
    unsigned char decryptedtext[128];

    int decryptedtext_len, ciphertext_len;

    /* Encrypt the plaintext */
    ciphertext_len = encrypt(plaintext, strlen((char *)plaintext), key, iv,
                             ciphertext);

    /* Decrypt the ciphertext */
    decryptedtext_len = decrypt(ciphertext, ciphertext_len, key, iv,
                                decryptedtext);

    if (decryptedtext_len >= 0)
    {
        /* Add a NULL terminator. We are expecting printable text */
        decryptedtext[decryptedtext_len] = '\0';

        /* Show the decrypted text */
        printf("Decrypted text is: ");
        printf("%s\n", decryptedtext);
    }
    else
    {
        printf("Decryption failed\n");
    }

    return 0;
}

void handleErrors(void)
{
    ERR_print_errors_fp(stderr);
    abort();
}

int encrypt(unsigned char *plaintext, int plaintext_len, unsigned char *key,
            unsigned char *iv, unsigned char *ciphertext)
{
    EVP_CIPHER_CTX *ctx;

    int len;

    int ciphertext_len;

    /* Create and initialise the context */
    if (!(ctx = EVP_CIPHER_CTX_new()))
        handleErrors();

    /*
     * Initialise the encryption operation. IMPORTANT - ensure you use a key
     * and IV size appropriate for your cipher
     * In this example we are using 256 bit AES (i.e. a 256 bit key). The
     * IV size for *most* modes is the same as the block size. For AES this
     * is 128 bits
     */
    if (1 != EVP_EncryptInit_ex(ctx, EVP_aes_256_cbc(), NULL, key, iv))
        handleErrors();

    /*
     * Provide the message to be encrypted, and obtain the encrypted output.
     * EVP_EncryptUpdate can be called multiple times if necessary
     */
    if (1 != EVP_EncryptUpdate(ctx, ciphertext, &len, plaintext, plaintext_len))
        handleErrors();
    ciphertext_len = len;

    /*
     * Finalise the encryption. Further ciphertext bytes may be written at
     * this stage.
     */
    if (1 != EVP_EncryptFinal_ex(ctx, ciphertext + len, &len))
        handleErrors();
    ciphertext_len += len;

    /* Clean up */
    EVP_CIPHER_CTX_free(ctx);

    return ciphertext_len;
}

int decrypt(unsigned char *ciphertext, int ciphertext_len, unsigned char *key,
            unsigned char *iv, unsigned char *plaintext)
{
    EVP_CIPHER_CTX *ctx;

    int len;

    int plaintext_len;

    /* Create and initialise the context */
    if (!(ctx = EVP_CIPHER_CTX_new()))
        handleErrors();

    /*
     * Initialise the decryption operation. IMPORTANT - ensure you use a key
     * and IV size appropriate for your cipher
     * In this example we are using 256 bit AES (i.e. a 256 bit key). The
     * IV size for *most* modes is the same as the block size. For AES this
     * is 128 bits
     */
    if (1 != EVP_DecryptInit_ex(ctx, EVP_aes_256_cbc(), NULL, key, iv))
        handleErrors();

    /*
     * Provide the message to be decrypted, and obtain the plaintext output.
     * EVP_DecryptUpdate can be called multiple times if necessary.
     */
    if (1 != EVP_DecryptUpdate(ctx, plaintext, &len, ciphertext, ciphertext_len))
        handleErrors();
    plaintext_len = len;

    /*
     * Finalise the decryption. Further plaintext bytes may be written at
     * this stage.
     */
    if (1 != EVP_DecryptFinal_ex(ctx, plaintext + len, &len))
        handleErrors();
    plaintext_len += len;

    /* Clean up */
    EVP_CIPHER_CTX_free(ctx);

    return plaintext_len;
}