import { encodePassword, comparePasswords } from './bcrypt';

describe('Password utilities', () => {
  it('encodePassword should return a bcrypt hash', async () => {
    const raw = 'P@ssw0rd!';
    const hash = await encodePassword(raw);

    // hash should not equal raw password
    expect(hash).not.toBe(raw);
    // bcrypt hashes start with $2a$, $2b$, or $2y$
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  it('comparePasswords returns true for matching password', async () => {
    const raw = 'Secret123';
    const hash = await encodePassword(raw);

    expect(comparePasswords(raw, hash)).toBe(true);
  });

  it('comparePasswords returns false for non‑matching password', async () => {
    const raw = 'Secret123';
    const hash = await encodePassword(raw);

    expect(comparePasswords('WrongPass', hash)).toBe(false);
  });
});
