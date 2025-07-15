/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  isEmail,
} from 'class-validator';

/* ---------------- phone patterns ---------------- */
const LOCAL_RW = /^07\d{8}$/; // 07xxxxxxxx   (Rwanda local, 10 digits)
const INTL_RW = /^\+2507\d{8}$/; // +2507xxxxxxxx
const INTL_E164 = /^\+[1-9]\d{9,14}$/; // generic E.164, 10‑15 digits, no leading “+0”

/* -------------- username pattern -----------------
   • 3‑32 chars
   • letters, digits, _ . -
   • must contain at least **one letter**
--------------------------------------------------- */
const USERNAME_REGEX = /^(?=.*[A-Za-z])[A-Za-z0-9_.-]{3,32}$/;

export function IsIdentifier(opts?: ValidationOptions) {
  return (target: object, propertyName: string) =>
    registerDecorator({
      name: 'isIdentifier',
      target: target.constructor,
      propertyName,
      options: opts,
      validator: {
        validate(value: unknown, _args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          const v = value.trim();
          const usernameOk = USERNAME_REGEX.test(v);
          const phoneOk =
            LOCAL_RW.test(v) || INTL_RW.test(v) || INTL_E164.test(v);

          return isEmail(v) || phoneOk || usernameOk;
        },
        defaultMessage: () =>
          'identifier must be a valid username, e‑mail, or phone number ' +
          '(07xxxxxxxx, +2507xxxxxxxx, or +<country‑code><number>)',
      },
    });
}
