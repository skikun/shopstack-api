import { hash, verify, argon2id } from "argon2";

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, { type: argon2id });
}

export function verifyPassword(passwordHash: string, plainAttempt: string): Promise<boolean> {
  return verify(passwordHash, plainAttempt);
}
