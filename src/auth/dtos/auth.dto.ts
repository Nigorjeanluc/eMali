/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  IsArray,
  IsUUID,
  IsPhoneNumber,
  IsStrongPassword,
  IsEnum,
  IsISO8601,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Language, RoleType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsIdentifier } from '../validators/is-identifier.decorator';

/**
 * DTO for creating a User (aligned with current Prisma model).
 *
 * ─ Required DB fields keep @IsNotEmpty().
 * ─ Optional Prisma fields get @IsOptional().
 * ─ Nested creates are still typed as `any` placeholders.
 */
export class CreateUserDto {
  /* ──────────────── core identifiers ──────────────── */

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'Email address', example: 'alice@example.com' })
  email!: string;

  @IsPhoneNumber(null)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Phone number (E.164 format)',
    example: '+250781234567',
  })
  phone!: string;

  /* ─────────────── credentials & profile ───────────── */

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Full name', example: 'Alice Mukamana' })
  name!: string;

  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  })
  @ApiProperty({
    description: 'Plain password (will be hashed)',
    minLength: 8,
  })
  password!: string;

  @IsEnum(RoleType)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'User role',
    enum: RoleType,
    default: RoleType.CLIENT,
  })
  role?: RoleType; // defaults to CLIENT if omitted

  /* ───────────── additional optionals ─────────────── */

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Unique username', example: 'alice' })
  username?: string | null;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Gender', example: 'female' })
  gender?: string | null;

  @IsDateString()
  @IsOptional()
  @IsISO8601({}, { message: 'dob must be a valid ISO‑8601 string' })
  @Transform(({ value }) => new Date(value).toISOString())
  @ApiPropertyOptional({
    description: 'Date of birth (ISO‑8601)',
    example: '1995-07-14T00:00:00.000Z',
    type: 'string',
    format: 'date',
  })
  dob?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Address', example: 'Kigali, Gasabo' })
  address?: string | null;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Country', example: 'Rwanda' })
  country?: string | null;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Province' })
  province?: string | null;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'District' })
  district?: string | null;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Profile image URL' })
  profileImg?: string | null;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Cover image URL' })
  coverImg?: string | null;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Facebook ID' })
  facebookId?: string | null;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'WhatsApp contact' })
  whatsapp?: string | null;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Verified flag', default: false })
  isVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Active flag', default: true })
  isActive?: boolean;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Last login timestamp (ISO‑8601)',
    type: 'string',
    format: 'date-time',
  })
  lastLogin?: Date | string | null;

  @ApiPropertyOptional({
    description: 'Preferred language code',
    enum: Language,
    example: 'EN',
  })
  @Transform(
    ({ value }) => (typeof value === 'string' ? value.toUpperCase() : value),
    { toClassOnly: true },
  )
  @IsEnum(Language, { message: 'language must be one of: EN, FR, SW, RW' })
  @IsOptional()
  language?: Language | null;

  /* ─────────────── timestamps (auto‑set) ────────────── */

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Created‑at timestamp (ISO‑8601). Usually auto‑set.',
    type: 'string',
    format: 'date-time',
  })
  createdAt?: Date | string;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Updated‑at timestamp (ISO‑8601). Usually auto‑set.',
    type: 'string',
    format: 'date-time',
  })
  updatedAt?: Date | string;

  /* ───────────── nested relations (placeholders) ───────────── */

  @IsOptional()
  @ApiPropertyOptional({ description: 'Nested identification create input' })
  identification?: any;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Nested userSetting create input' })
  userSetting?: any;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Nested properties create input' })
  properties?: any;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Nested transactions create input' })
  transactions?: any;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Nested sharesSent create input' })
  sharesSent?: any;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Nested sharesReceived create input' })
  sharesReceived?: any;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Nested blogs create input' })
  blogs?: any;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Nested favorites create input' })
  favorites?: any;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Nested notifications create input' })
  notifications?: any;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Nested testimonials create input' })
  testimonials?: any;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Nested reservations create input' })
  reservations?: any;
}

export class LoginDto {
  @ApiProperty({
    description: 'Username, e‑mail, or phone',
    examples: {
      username: { summary: 'Username', value: 'janedoe' },
      email: { summary: 'E‑mail', value: 'janedoe@example.com' },
      phone1: { summary: 'Phone (local)', value: '0788123456' },
      phone2: { summary: 'Phone (intl.)', value: '+250788123456' },
    },
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @IsIdentifier()
  identifier!: string;

  @ApiProperty({ description: 'Password', example: 'Str0ngP@ss!' })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  })
  @Transform(({ value }) => value?.trim())
  password!: string;
}

class UserSummaryDto {
  @ApiProperty({ example: '8c6b27c4-b1ed-4d30-b5e2-a1d80e99c9af' })
  id!: string;

  @ApiProperty({ example: 'janedoe@example.com' })
  email!: string;

  @ApiProperty({ example: '+250788123456' })
  phone!: string;

  @ApiProperty({ example: 'janedoe' })
  username!: string;

  @ApiProperty({ example: 'Jane Doe' })
  name!: string;
}

class AuthResponseDataDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR...' })
  accessToken!: string;

  @ApiProperty({ type: () => UserSummaryDto })
  user!: UserSummaryDto;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'success' })
  status!: string;

  @ApiProperty({ example: 'User successfully registered' })
  message!: string;

  @ApiProperty({ type: () => AuthResponseDataDto })
  data!: AuthResponseDataDto;
}
