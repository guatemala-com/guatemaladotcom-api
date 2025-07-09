import { validate } from 'class-validator';
import {
  TokenRequestDto,
  TokenResponseDto,
  TokenVerificationRequestDto,
  TokenVerificationResponseDto,
} from '../token.dto';

describe('TokenRequestDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = new TokenRequestDto();
      dto.grant_type = 'client_credentials';
      dto.client_id = 'test_client_id';
      dto.client_secret = 'test_client_secret';
      dto.scope = 'read write';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation without optional scope', async () => {
      const dto = new TokenRequestDto();
      dto.grant_type = 'client_credentials';
      dto.client_id = 'test_client_id';
      dto.client_secret = 'test_client_secret';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when grant_type is missing', async () => {
      const dto = new TokenRequestDto();
      dto.client_id = 'test_client_id';
      dto.client_secret = 'test_client_secret';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('grant_type');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when grant_type is empty string', async () => {
      const dto = new TokenRequestDto();
      dto.grant_type = '';
      dto.client_id = 'test_client_id';
      dto.client_secret = 'test_client_secret';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('grant_type');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when grant_type is not a string', async () => {
      const dto = new TokenRequestDto();
      Object.assign(dto, { grant_type: 123 });
      dto.client_id = 'test_client_id';
      dto.client_secret = 'test_client_secret';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('grant_type');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation when client_id is missing', async () => {
      const dto = new TokenRequestDto();
      dto.grant_type = 'client_credentials';
      dto.client_secret = 'test_client_secret';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('client_id');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when client_id is empty string', async () => {
      const dto = new TokenRequestDto();
      dto.grant_type = 'client_credentials';
      dto.client_id = '';
      dto.client_secret = 'test_client_secret';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('client_id');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when client_id is not a string', async () => {
      const dto = new TokenRequestDto();
      dto.grant_type = 'client_credentials';
      Object.assign(dto, { client_id: 123 });
      dto.client_secret = 'test_client_secret';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('client_id');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation when client_secret is missing', async () => {
      const dto = new TokenRequestDto();
      dto.grant_type = 'client_credentials';
      dto.client_id = 'test_client_id';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('client_secret');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when client_secret is empty string', async () => {
      const dto = new TokenRequestDto();
      dto.grant_type = 'client_credentials';
      dto.client_id = 'test_client_id';
      dto.client_secret = '';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('client_secret');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when client_secret is not a string', async () => {
      const dto = new TokenRequestDto();
      dto.grant_type = 'client_credentials';
      dto.client_id = 'test_client_id';
      Object.assign(dto, { client_secret: 123 });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('client_secret');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation when scope is not a string', async () => {
      const dto = new TokenRequestDto();
      dto.grant_type = 'client_credentials';
      dto.client_id = 'test_client_id';
      dto.client_secret = 'test_client_secret';
      Object.assign(dto, { scope: 123 });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('scope');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should pass validation when scope is empty string (optional field)', async () => {
      const dto = new TokenRequestDto();
      dto.grant_type = 'client_credentials';
      dto.client_id = 'test_client_id';
      dto.client_secret = 'test_client_secret';
      dto.scope = '';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with multiple errors', async () => {
      const dto = new TokenRequestDto();
      Object.assign(dto, {
        grant_type: 123,
        client_id: 456,
        client_secret: 789,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(3);
      expect(errors.some((e) => e.property === 'grant_type')).toBe(true);
      expect(errors.some((e) => e.property === 'client_id')).toBe(true);
      expect(errors.some((e) => e.property === 'client_secret')).toBe(true);
    });
  });

  describe('structure', () => {
    it('should have the correct properties', () => {
      const dto = new TokenRequestDto();
      expect(dto).toHaveProperty('grant_type');
      expect(dto).toHaveProperty('client_id');
      expect(dto).toHaveProperty('client_secret');
      expect(dto).toHaveProperty('scope');
    });
  });
});

describe('TokenResponseDto', () => {
  describe('structure', () => {
    it('should have the correct properties', () => {
      const dto = new TokenResponseDto();
      expect(dto).toHaveProperty('access_token');
      expect(dto).toHaveProperty('token_type');
      expect(dto).toHaveProperty('expires_in');
      expect(dto).toHaveProperty('scope');
    });

    it('should allow setting all properties', () => {
      const dto = new TokenResponseDto();
      dto.access_token = 'test_token';
      dto.token_type = 'Bearer';
      dto.expires_in = 3600;
      dto.scope = 'read write';

      expect(dto.access_token).toBe('test_token');
      expect(dto.token_type).toBe('Bearer');
      expect(dto.expires_in).toBe(3600);
      expect(dto.scope).toBe('read write');
    });

    it('should allow scope to be undefined', () => {
      const dto = new TokenResponseDto();
      dto.access_token = 'test_token';
      dto.token_type = 'Bearer';
      dto.expires_in = 3600;
      dto.scope = undefined;

      expect(dto.scope).toBeUndefined();
    });
  });
});

describe('TokenVerificationRequestDto', () => {
  describe('validation', () => {
    it('should pass validation with valid token', async () => {
      const dto = new TokenVerificationRequestDto();
      dto.token = 'valid_token_string';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when token is missing', async () => {
      const dto = new TokenVerificationRequestDto();

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('token');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when token is empty string', async () => {
      const dto = new TokenVerificationRequestDto();
      dto.token = '';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('token');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when token is not a string', async () => {
      const dto = new TokenVerificationRequestDto();
      Object.assign(dto, { token: 123 });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('token');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('structure', () => {
    it('should have the correct properties', () => {
      const dto = new TokenVerificationRequestDto();
      expect(dto).toHaveProperty('token');
    });
  });
});

describe('TokenVerificationResponseDto', () => {
  describe('structure', () => {
    it('should have the correct properties', () => {
      const dto = new TokenVerificationResponseDto();
      expect(dto).toHaveProperty('valid');
      expect(dto).toHaveProperty('payload');
      expect(dto).toHaveProperty('error');
    });

    it('should allow setting all properties for valid token', () => {
      const dto = new TokenVerificationResponseDto();
      dto.valid = true;
      dto.payload = {
        client_id: 'test_client',
        issuer: 'test_issuer',
        audience: 'test_audience',
        issued_at: '2023-01-01T00:00:00Z',
        expires_at: '2023-01-01T01:00:00Z',
        scope: 'read write',
      };

      expect(dto.valid).toBe(true);
      expect(dto.payload).toEqual({
        client_id: 'test_client',
        issuer: 'test_issuer',
        audience: 'test_audience',
        issued_at: '2023-01-01T00:00:00Z',
        expires_at: '2023-01-01T01:00:00Z',
        scope: 'read write',
      });
      expect(dto.error).toBeUndefined();
    });

    it('should allow setting properties for invalid token', () => {
      const dto = new TokenVerificationResponseDto();
      dto.valid = false;
      dto.error = 'Invalid token';

      expect(dto.valid).toBe(false);
      expect(dto.error).toBe('Invalid token');
      expect(dto.payload).toBeUndefined();
    });

    it('should allow payload to be undefined', () => {
      const dto = new TokenVerificationResponseDto();
      dto.valid = false;
      dto.payload = undefined;

      expect(dto.payload).toBeUndefined();
    });

    it('should allow error to be undefined', () => {
      const dto = new TokenVerificationResponseDto();
      dto.valid = true;
      dto.error = undefined;

      expect(dto.error).toBeUndefined();
    });

    it('should allow scope to be undefined in payload', () => {
      const dto = new TokenVerificationResponseDto();
      dto.valid = true;
      dto.payload = {
        client_id: 'test_client',
        issuer: 'test_issuer',
        audience: 'test_audience',
        issued_at: '2023-01-01T00:00:00Z',
        expires_at: '2023-01-01T01:00:00Z',
        scope: undefined,
      };

      expect(dto.payload?.scope).toBeUndefined();
    });
  });
});
