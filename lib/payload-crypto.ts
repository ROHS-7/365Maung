import { APP_PAYLOAD_KEY } from "@/constants/config";
import CryptoJS from "crypto-js";

export type EncryptedEnvelope = {
  encrypted: true;
  iv: string;
  data: string;
};

export function isEncryptedEnvelope(
  value: unknown,
): value is EncryptedEnvelope {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    v.encrypted === true &&
    typeof v.iv === "string" &&
    v.iv.length > 0 &&
    typeof v.data === "string" &&
    v.data.length > 0
  );
}

export function decryptApiPayload<T>(envelope: EncryptedEnvelope): T {
  const key = APP_PAYLOAD_KEY;
  if (key.length !== 16) {
    throw new Error("APP_PAYLOAD_KEY must be exactly 16 characters");
  }

  const decrypted = CryptoJS.AES.decrypt(
    CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(envelope.data),
    }),
    CryptoJS.enc.Utf8.parse(key),
    {
      iv: CryptoJS.enc.Base64.parse(envelope.iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  );
  const json = decrypted.toString(CryptoJS.enc.Utf8);
  if (!json) {
    throw new Error("Failed to decrypt API payload");
  }
  return JSON.parse(json) as T;
}

export function unwrapApiPayload<T>(value: unknown): T {
  if (isEncryptedEnvelope(value)) {
    return decryptApiPayload<T>(value);
  }
  return value as T;
}
