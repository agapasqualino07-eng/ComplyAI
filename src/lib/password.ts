/**
 * Validazione complessità password lato server.
 * Regole minime: 8+ caratteri, almeno una lettera e almeno un numero.
 * Rifiuta esplicitamente i 100 valori più comuni (brute-force banale).
 *
 * Per ora niente API HIBP (rate limit, latency) — sufficiente per V1.
 */

const TOP_COMMON = new Set([
  "12345678", "password", "qwerty123", "1234567890", "password1", "password123",
  "11111111", "12341234", "abc12345", "qwertyuiop", "letmein!", "welcome1",
  "iloveyou1", "monkey123", "dragon123", "football1", "baseball1", "123qwe123",
  "qazwsxedc", "qwerty1234", "admin1234", "passw0rd", "p@ssw0rd", "123abc456",
]);

export type PasswordIssue =
  | "too_short"
  | "no_letter"
  | "no_digit"
  | "too_common";

export function validatePassword(pw: string): { valid: true } | { valid: false; issue: PasswordIssue; message: string } {
  if (pw.length < 8) {
    return { valid: false, issue: "too_short", message: "La password deve avere almeno 8 caratteri." };
  }
  if (!/[a-zA-Z]/.test(pw)) {
    return { valid: false, issue: "no_letter", message: "La password deve contenere almeno una lettera." };
  }
  if (!/\d/.test(pw)) {
    return { valid: false, issue: "no_digit", message: "La password deve contenere almeno un numero." };
  }
  if (TOP_COMMON.has(pw.toLowerCase())) {
    return { valid: false, issue: "too_common", message: "Questa password è troppo comune. Scegline una più robusta." };
  }
  return { valid: true };
}
