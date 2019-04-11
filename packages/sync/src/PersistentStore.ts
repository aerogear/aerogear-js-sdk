/**
 * Interface for underlying storage solutions
 */
export interface PersistentStore<T> {
  getItem: (key: string) => Promise<T> | T;
  setItem: (key: string, data: T) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
}

export type PersistedData = string | null | object;

export class StorageWrapper implements PersistentStore<PersistedData> {
  public storage: PersistentStore<PersistedData>;
  private crypto = window.crypto;
  private masterKey: CryptoKey | undefined;
  private password: string;

  constructor(storage: PersistentStore<PersistedData>, encryptionPassword: string) {
    this.password = encryptionPassword;
    this.storage = storage;
    this.init();
  }

  /**
   * Retrieves an encrypted item from storage.
   * First extracts the initialisation vector that was previously prepended to the stored encrypted data
   * @param key the key to use to retreive your value
   */
  public getItem(key: string) {
    const retrieved = this.storage.getItem(key);
    if (retrieved) {
      if (this.masterKey) {
        const cipherTextWithIv = retrieved.toString();
        const cipherText = cipherTextWithIv.slice(cipherTextWithIv.indexOf(":") + 1);
        const iv = this.strToArray(cipherTextWithIv.substr(0, cipherTextWithIv.indexOf(":")));
        this.crypto.subtle.decrypt({ name: "AES-GCM", iv },
          this.masterKey, this.strToArray(cipherText)).then(result => {
            return this.arrayToStr(result);
          });
      }
    }
    return retrieved;
  }

  /**
   * Stores an ecrypted item in storage. Generates a random initialisation vector for each encryption.
   * This value is then prepended to the data and also stored for later decryption.
   * @param key the key to use to store your value
   * @param data the data to persist
   */
  public setItem(key: string, data: PersistedData) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    if (data) {
      if (this.masterKey) {
        this.crypto.subtle.encrypt({
          name: "AES-GCM",
          iv
        },
          this.masterKey,
          this.strToArray(data.toString())
        ).then(cipherText => {
          const stringCipher = this.arrayToStr(cipherText);
          this.storage.setItem(key, iv + ":" + stringCipher);
        });
      } else {
        this.storage.setItem(key, data);
      }
    }
  }

  /**
   * Remove an item from storage
   * @param key the key to use to remove your value
   */
  public removeItem(key: string) {
    this.storage.removeItem(key);
  }

  private async init() {
    const masterKey = await this.storage.getItem("masterKey");
    if (masterKey) {
      const keyAsString = masterKey.toString();
      const parsedKey = keyAsString.slice(keyAsString.indexOf(":") + 1);
      await this.getSalt().then( async (res) => {
        if (res) {
          await this.unwrapCryptoKey(this.strToArray(parsedKey), res).then(unwrapped => unwrapped);
        }
      });
    } else {
      this.generateKey();
    }
  }

  private generateKey() {
    this.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    ).then(result => {
      this.masterKey = result;
      this.wrapCryptoKey(this.masterKey);
    });
  }

  // fetches the salt from the stored masterKey and returns it
  private async getSalt() {
    const masterKey = await this.storage.getItem("masterKey");
    if (masterKey) {
      const keyWithSalt = masterKey.toString();
      const saltStr = keyWithSalt.substr(0, keyWithSalt.indexOf(":"));
      // const cipherText = keyWithSalt.slice(keyWithSalt.indexOf(":") + 1);
      const salt = this.strToArray(saltStr);
      return salt;
    }
  }

  // wrap the master key and store it under the "masterKey" key.
  // when wrapped it can be stored safely and later unwrapped
  private async wrapCryptoKey(keyToWrap: CryptoKey) {
    // get the key encryption key
    const keyMaterial = await this.getKeyMaterial(this.password);
    const salt = window.crypto.getRandomValues(new Uint8Array(16));

    const wrappingKey = await this.deriveWrappingKey(keyMaterial, salt);

    return window.crypto.subtle.wrapKey(
      "raw",
      keyToWrap,
      wrappingKey,
      "AES-KW"
    ).then(result => {
      const resultAsString = this.arrayToStr(result);
      this.storage.setItem("masterKey", this.arrayToStr(salt) + ":" + resultAsString);
    });

  }

  // unwrap the safely stored masterKey from storage to be used for decryption
  private async unwrapCryptoKey(masterKey: ArrayBuffer, salt: Uint8Array) {
    const key = await this.getKeyMaterial(this.password);
    if (salt) {
      if (masterKey) {
        const unwrappingKey = await this.deriveWrappingKey(key, salt);

        await window.crypto.subtle.unwrapKey(
          "raw",
          masterKey,
          unwrappingKey,
          "AES-KW",
          "AES-GCM",
          true,
          ["encrypt", "decrypt"]
        ).then((result) => {
          this.masterKey = result;
          return result;
        }, (error) => {
          console.log(error);
        });
      }
    }
  }

  // generate a PBKDF2 key from the user provided password. Without the password this key
  // (and therefore the encrypted data) cannot be retreived
  private async getKeyMaterial(password: string) {
    return await window.crypto.subtle.importKey(
      "raw",
      this.strToArray(password),
      { name: "PBKDF2", length: 256 },
      false,
      ["deriveBits", "deriveKey"]
    ).then(res => res);
  }

  // create a key to use to wrap the masterKey so it can be safely stored
  private async deriveWrappingKey(keyMaterial: CryptoKey, salt: Uint8Array) {
    return await window.crypto.subtle.deriveKey(
      {
        "name": "PBKDF2",
        salt,
        "iterations": 100000,
        "hash": "SHA-256"
      },
      keyMaterial,
      { "name": "AES-KW", "length": 256 },
      true,
      ["wrapKey", "unwrapKey"]
    );
  }

  private arrayToStr(buf: ArrayBuffer) {
    const a = new  Uint8Array(buf);
    return String.fromCharCode.apply(String, Array.from(a));
  }

  private strToArray(str: string) {
    const result = [];
    for (let i = 0; i < str.length; i++) {
      result.push(str.charCodeAt(i));
    }
    return new Uint8Array(result);
  }
}
