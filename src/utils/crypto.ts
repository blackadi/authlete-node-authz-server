// For PKCE, nonce, state
export const randomString = (length: number) =>
  [...crypto.getRandomValues(new Uint8Array(length))]
    .map((b) => (b % 36).toString(36))
    .join("");
