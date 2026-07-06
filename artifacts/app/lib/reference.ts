// Unambiguous uppercase alphabet — no O/0, I/1, etc. — so codes are easy to read
// aloud and type. 30 symbols ^ 6 chars ≈ 729M combinations.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const LENGTH = 6;

/** A short, human-friendly, unguessable ticket reference, e.g. "FH-7K3M9Q". */
export function generateReference(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(LENGTH));
  let code = "";
  for (let i = 0; i < LENGTH; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `FH-${code}`;
}
