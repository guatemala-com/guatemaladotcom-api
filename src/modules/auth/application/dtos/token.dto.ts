import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class TokenRequestDto {
  @IsString()
  @IsNotEmpty()
  grant_type: string;

  @IsString()
  @IsNotEmpty()
  client_id: string;

  @IsString()
  @IsNotEmpty()
  client_secret: string;

  @IsString()
  @IsOptional()
  scope?: string;
}

export class TokenResponseDto {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export class TokenVerificationRequestDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class TokenVerificationResponseDto {
  valid: boolean;
  payload?: {
    client_id: string;
    issuer: string;
    audience: string;
    issued_at: string;
    expires_at: string;
    scope?: string;
  };
  error?: string;
}

export class RefreshTokenRequestDto {
  @IsString()
  @IsNotEmpty()
  grant_type: string;

  @IsString()
  @IsNotEmpty()
  refresh_token: string;

  @IsString()
  @IsOptional()
  scope?: string;
}

export class RefreshTokenResponseDto {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}
