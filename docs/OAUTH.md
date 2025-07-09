# OAuth 2.0 Implementation

This document describes the OAuth 2.0 implementation using Client Credentials Flow with RSA keys for JWT signing.

## Overview

The API implements OAuth 2.0 Client Credentials Flow, which is suitable for server-to-server authentication. Each client has specific allowed scopes that are validated during token generation.

## Security Features

- **Scope Validation**: Clients can only request scopes they are authorized for
- **RSA Key Pairs**: Each client has its own RSA key pair for secure communication
- **Rate Limiting**: All OAuth endpoints are protected by rate limiting
- **Audit Logging**: All token requests and validations are logged

## Configuration

### Environment Variables

```bash
# OAuth Client Configuration (JSON string)
OAUTH_CLIENTS='[
  {
    "clientId": "content-reader",
    "clientSecret": "your-secret-here",
    "allowedScopes": ["read"]
  },
  {
    "clientId": "admin-client",
    "clientSecret": "your-admin-secret",
    "allowedScopes": ["read", "write", "admin"]
  }
]'

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=3600
```

### Client Configuration Structure

Each client in the `OAUTH_CLIENTS` array must have:

- `clientId`: Unique identifier for the client
- `clientSecret`: Secret key for client authentication
- `allowedScopes`: Array of scopes this client is authorized to request

### Available Scopes

- `read`: Read access to content
- `write`: Write access to content
- `admin`: Administrative access (includes read and write)

## Endpoints

### 1. Token Endpoint

**POST** `/api/oauth/token`

Request a new access token using client credentials.

#### Request Body

```json
{
  "grant_type": "client_credentials",
  "client_id": "your-client-id",
  "client_secret": "your-client-secret",
  "scope": "read write"
}
```

#### Response

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read write"
}
```

#### Scope Validation

- If a client requests scopes they are not authorized for, the request will be rejected
- Example error for unauthorized scope:
  ```json
  {
    "statusCode": 400,
    "message": "Client is not authorized for scopes: admin. Allowed scopes: read, write"
  }
  ```

### 2. Token Verification Endpoint

**POST** `/api/oauth/verify`

Verify the validity of an access token.

#### Request Body

```json
{
  "token": "your-access-token"
}
```

#### Response

```json
{
  "valid": true,
  "payload": {
    "client_id": "your-client-id",
    "issuer": "guatemala.com",
    "audience": "guatemala-api",
    "issued_at": "2024-01-01T00:00:00.000Z",
    "expires_at": "2024-01-01T01:00:00.000Z",
    "scope": "read write"
  }
}
```

### 3. OAuth Information Endpoint

**GET** `/api/oauth/info`

Get OAuth server information.

#### Response

```json
{
  "issuer": "guatemala.com",
  "authorization_endpoint": "/api/oauth/authorize",
  "token_endpoint": "/api/oauth/token",
  "supported_grant_types": ["client_credentials"],
  "supported_scopes": ["read", "write", "admin"],
  "token_endpoint_auth_methods": ["client_secret_post"]
}
```

### 4. Client Generation Endpoint (Development Only)

**GET** `/api/oauth/generate-client`

Generate client credentials for development.

#### Response

```json
{
  "client_id": "gt_client_abc123",
  "client_secret": "gt_secret_def456"
}
```

## Usage Examples

### Requesting a Token with Specific Scopes

```bash
curl -X POST http://localhost:3000/api/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "client_credentials",
    "client_id": "content-reader",
    "client_secret": "your-secret",
    "scope": "read"
  }'
```

### Using the Token

```bash
curl -X GET http://localhost:3000/api/content \
  -H "Authorization: Bearer your-access-token"
```

### Verifying a Token

```bash
curl -X POST http://localhost:3000/api/oauth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-access-token"
  }'
```

## Guards and Decorators

### OAuth Guard

Protect routes with OAuth authentication:

```typescript
@UseGuards(OAuthGuard)
@Get('protected-route')
async protectedRoute() {
  return 'This route requires OAuth authentication';
}
```

### Scope Decorators

Protect routes with specific scope requirements:

```typescript
@RequireScope('read')
@Get('content')
async getContent() {
  return 'Content accessible with read scope';
}

@RequireScope('write')
@Post('content')
async createContent() {
  return 'Content creation requires write scope';
}

@RequireScope('admin')
@Delete('content/:id')
async deleteContent() {
  return 'Content deletion requires admin scope';
}
```

## Production Setup

### 1. Configure OAuth Clients

Add your OAuth clients to the `OAUTH_CLIENTS` environment variable:

```bash
# Example configuration
OAUTH_CLIENTS='[
  {
    "clientId": "content-reader",
    "clientSecret": "secure-reader-secret",
    "allowedScopes": ["read"]
  },
  {
    "clientId": "content-manager",
    "clientSecret": "secure-manager-secret",
    "allowedScopes": ["read", "write"]
  },
  {
    "clientId": "admin-client",
    "clientSecret": "secure-admin-secret",
    "allowedScopes": ["read", "write", "admin"]
  }
]'
```

### 2. Client Registration Process

1. **Define Client Requirements**: Determine what scopes each client needs
2. **Generate Credentials**: Create unique client IDs and secrets
3. **Configure Environment**: Add clients to the `OAUTH_CLIENTS` variable
4. **Distribute Securely**: Share client credentials through secure channels
5. **Monitor Usage**: Track token requests and scope usage

### 3. Scope Management

- **Principle of Least Privilege**: Only grant the minimum scopes needed
- **Regular Review**: Periodically review and update client scopes
- **Monitoring**: Monitor for unusual scope requests or token usage patterns

### 4. Key Rotation

- **Regular Rotation**: Rotate client secrets regularly
- **Graceful Transition**: Provide overlapping periods for secret rotation
- **Secure Storage**: Store secrets securely with restricted access

### 5. Monitoring and Logging

Monitor the following metrics:

- Token request frequency per client
- Scope validation failures
- Token verification attempts
- Unusual access patterns

## Security Considerations

### Scope Validation

- **Client-Specific Scopes**: Each client can only request scopes they are authorized for
- **Validation at Token Generation**: Scope validation happens during token generation, not just during usage
- **Clear Error Messages**: Provide specific error messages for unauthorized scope requests

### Key Management

- **RSA Key Pairs**: Each client has its own RSA key pair for secure communication
- **Secure Storage**: Private keys should be stored securely with restricted access
- **Regular Rotation**: Implement a process for regular key rotation

### Rate Limiting

- **Token Endpoint**: Rate limited to prevent abuse
- **Verification Endpoint**: Rate limited to prevent brute force attacks
- **Monitoring**: Monitor for unusual rate limiting triggers

### Audit Logging

- **Token Requests**: Log all token requests with client ID and requested scopes
- **Validation Failures**: Log scope validation failures for security monitoring
- **Token Usage**: Log token verification attempts and results

## Error Handling

### Common Error Responses

#### Invalid Client Credentials (401)

```json
{
  "statusCode": 401,
  "message": "Invalid client credentials"
}
```

#### Unauthorized Scope Request (400)

```json
{
  "statusCode": 400,
  "message": "Client is not authorized for scopes: admin. Allowed scopes: read, write"
}
```

#### Invalid Grant Type (400)

```json
{
  "statusCode": 400,
  "message": "Only client_credentials grant type is supported"
}
```

#### Invalid Token (401)

```json
{
  "statusCode": 401,
  "message": "Invalid token"
}
```

## Development vs Production

### Development Mode

- No `OAUTH_CLIENTS` environment variable required
- All clients are allowed all scopes
- Use `/api/oauth/generate-client` to create test credentials

### Production Mode

- `OAUTH_CLIENTS` environment variable must be set
- Strict scope validation enforced
- Client credentials must be pre-configured
- RSA key pairs required for each client

## Testing

### Unit Tests

Run the test suite:

```bash
pnpm test
```

### Integration Tests

Test OAuth endpoints:

```bash
pnpm test:e2e
```

### Manual Testing

1. Configure `OAUTH_CLIENTS` environment variable
2. Request a token with valid scopes
3. Request a token with invalid scopes (should fail)
4. Use the token to access protected routes
5. Verify the token
6. Test scope-based access control

## Example Configuration

### Simple Configuration

```bash
# .env
OAUTH_CLIENTS='[
  {"clientId":"mi-app","clientSecret":"mi-secret","allowedScopes":["read","write"]},
  {"clientId":"admin","clientSecret":"admin-secret","allowedScopes":["read","write","admin"]}
]'
```

### Advanced Configuration

```bash
# .env
OAUTH_CLIENTS='[
  {
    "clientId": "content-reader",
    "clientSecret": "reader-secret-123",
    "allowedScopes": ["read"]
  },
  {
    "clientId": "content-manager",
    "clientSecret": "manager-secret-456",
    "allowedScopes": ["read", "write"]
  },
  {
    "clientId": "admin-dashboard",
    "clientSecret": "admin-secret-789",
    "allowedScopes": ["read", "write", "admin"]
  },
  {
    "clientId": "mobile-app",
    "clientSecret": "mobile-secret-abc",
    "allowedScopes": ["read"]
  },
  {
    "clientId": "api-gateway",
    "clientSecret": "gateway-secret-def",
    "allowedScopes": ["read", "write"]
  }
]'
```
