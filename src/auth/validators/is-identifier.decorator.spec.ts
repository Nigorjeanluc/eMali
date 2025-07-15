import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { IsIdentifier } from './is-identifier.decorator';

class DummyDto {
  @IsIdentifier()
  identifier!: string;
}

describe('IsIdentifier decorator', () => {
  const passes = async (value: string) => {
    const dto = plainToInstance(DummyDto, { identifier: value });
    const errs = await validate(dto);
    return errs.length === 0;
  };

  it.each([
    /* valid usernames */
    'janedoe',
    'Jane_Doe',
    'user.name-123',
    /* valid e‑mails */
    'janedoe@example.com',
    'user.name+alias@gmail.com',
    /* valid phones */
    '0788123456',
    '+250788123456',
    '+14155550123',
  ])('accepts valid identifier → %s', async (val) => {
    expect(await passes(val)).toBe(true);
  });

  it.each([
    '123', // digits‑only, so not a username and too short for phone
    '070', // too short for phone
    '+123', // too short for E.164
    'jd', // username too short
    'invalid@', // bad e‑mail
    'user!name', // illegal username char
    '', // empty
    '   ', // whitespace only
  ])('rejects invalid identifier → %s', async (val) => {
    expect(await passes(val)).toBe(false);
  });
});
