import { Client } from '../domain/entities/client.entity';
import { Token } from '../domain/entities/token.entity';

export const mockClient = new Client('test-client-id', 'test-client-secret', [
  'read',
  'write',
  'admin',
]);

export const mockToken = new Token('mock-access-token', {
  sub: 'test-client-id',
  aud: 'test-audience',
  iss: 'test-issuer',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
  scope: 'read write',
});

export const mockClientWithLimitedScopes = new Client(
  'test-client-id',
  'test-client-secret',
  ['read'],
);

export const mockClientWithNoScopes = new Client(
  'test-client-id',
  'test-client-secret',
  [],
);

export const mockClientCredentials = {
  client_id: 'test-client-id',
  client_secret: 'test-client-secret',
};
