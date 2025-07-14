import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto, LoginDto } from './auth.dto';

describe('CreateUserDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(CreateUserDto, {
      email: 'alice@example.com',
      phone: '+250788123456',
      name: 'Alice Doe',
      password: 'StrongPass1',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid email', async () => {
    const dto = plainToInstance(CreateUserDto, {
      email: 'invalid-email',
      phone: '+250788123456',
      name: 'Alice Doe',
      password: 'StrongPass1',
    });

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'email')).toBeTruthy();
  });

  it('should transform and validate ISO date correctly', async () => {
    const dto = plainToInstance(CreateUserDto, {
      email: 'test@example.com',
      phone: '+250788000000',
      name: 'Test',
      password: 'Test1234A',
      dob: '1995-07-14',
    });

    expect(dto.dob).toBe('1995-07-14T00:00:00.000Z');
  });
});

describe('LoginDto', () => {
  it('should pass validation with valid email identifier', async () => {
    const dto = plainToInstance(LoginDto, {
      identifier: 'test@example.com',
      password: 'Test1234A',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if password is weak', async () => {
    const dto = plainToInstance(LoginDto, {
      identifier: 'janedoe',
      password: 'weak',
    });

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'password')).toBeTruthy();
  });
});
