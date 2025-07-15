import { usernameGenerator } from './usernameGenerator';

describe('usernameGenerator', () => {
  it('generates a username from full name', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.1); // index 0 → 'john'
    const username = usernameGenerator('John Doe');

    // john, johndoe, johnd, jdoe are possible bases
    expect(username).toMatch(/^(john|johndoe|johnd|jdoe)\d{3}$/);

    jest.restoreAllMocks();
  });

  it('throws if name is empty or whitespace', () => {
    expect(() => usernameGenerator('')).toThrow();
    expect(() => usernameGenerator('    ')).toThrow();
  });

  it('cleans up symbols and trims spaces', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.23); // index 0 or 1 depending on options
    const username = usernameGenerator('  Alice! #Smith ');

    // alice, alicesmith, alices, asmith
    expect(username).toMatch(/^(alice|alicesmith|alices|asmith)\d{3}$/);

    jest.restoreAllMocks();
  });
});
