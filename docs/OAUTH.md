# OAuth 2.0 Implementation

This API implements OAuth 2.0 with **Client Credentials Flow** using RSA keys for maximum security.

## 🔐 **Features**

- **OAuth 2.0 Client Credentials Flow**
- **JWT with RS256 algorithm** (RSA keys)
- **Granular scopes** (read, write, admin)
- **Rate limiting** on authentication endpoints
- **Automatic token validation**

## 🚀 **Initial Setup**

### 1. Generate RSA Keys

```bash
node scripts/generate-keys.js
```

This will create:

- `keys/private.pem` - Private key (server)
- `keys/public.pem` - Public key (clients)

### 2. Configure Environment Variables

```bash
# OAuth 2.0 Configuration
JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_PUBLIC_KEY_PATH=./keys/public.pem
JWT_EXPIRES_IN=1h
JWT_ISSUER=guatemala.com
JWT_AUDIENCE=guatemala.com-api

# OAuth Clients (for production)
OAUTH_CLIENTS=[{"client_id":"your_client_id","client_secret":"your_client_secret"}]
```

## 🔑 **Authentication Flow**

### 1. Get Client Credentials

```bash
# Generate credentials (development)
curl http://localhost:3000/api/oauth/generate-client
```

Response:

```json
{
  "client_id": "gt_client_abc123",
  "client_secret": "gt_secret_xyz789"
}
```

### 2. Get Access Token

```bash
curl -X POST http://localhost:3001/api/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=gt_client_abc123" \
  -d "client_secret=gt_secret_xyz789" \
  -d "scope=read write"
```

Response:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read write"
}
```

### 3. Use Token in Requests

```bash
curl -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:3000/api/protected-endpoint
```

## 🛡️ **Protect Endpoints**

### Using Specific Scope Decorators

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import {
  OAuthAuthRead,
  OAuthAuthWrite,
  OAuthAuthAdmin,
  OAuthAuthScopes,
} from '../auth/infrastructure/decorators/oauth-scopes.decorator';

@Controller('content')
export class ContentController {
  @Get('public')
  getPublicContent() {
    // No authentication required
    return { data: 'public' };
  }

  @Get('internal/stats')
  @UseGuards(JwtAuthGuard)
  @OAuthAuthRead()
  getInternalStats() {
    // Requires token with 'read' scope
    return { data: 'internal stats' };
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @OAuthAuthWrite()
  createContent() {
    // Requires token with 'write' scope
    return { message: 'created' };
  }

  @Delete('admin/delete')
  @UseGuards(JwtAuthGuard)
  @OAuthAuthAdmin()
  deleteContent() {
    // Requires token with 'admin' scope
    return { message: 'deleted' };
  }

  // Multiple scopes (read OR write)
  @Get('analytics')
  @UseGuards(JwtAuthGuard)
  @OAuthAuthScopes('read', 'write')
  getAnalytics() {
    // Requires token with 'read' OR 'write' scope
    return { data: 'analytics' };
  }

  // Multiple scopes (read AND write)
  @Post('publish')
  @UseGuards(JwtAuthGuard)
  @OAuthAuthScopes('read write')
  publishContent() {
    // Requires token with 'read' AND 'write' scopes
    return { message: 'published' };
  }
}
```

### Available Decorators

- **`@OAuthAuthRead()`** - Requires 'read' scope
- **`@OAuthAuthWrite()`** - Requires 'write' scope
- **`@OAuthAuthAdmin()`** - Requires 'admin' scope
- **`@OAuthAuthScopes(...scopes)`** - Requires multiple scopes
- **`@OAuthAuth(scope)`** - Legacy decorator (still supported)

## 📋 **Available Scopes**

- **`read`** - Read-only access
- **`write`** - Create and modify content
- **`admin`** - Full administrative access

## 🔍 **OAuth Endpoints**

### POST /api/oauth/token

Get access token using client credentials.

**Body:**

```json
{
  "grant_type": "client_credentials",
  "client_id": "your_client_id",
  "client_secret": "your_client_secret",
  "scope": "read write"
}
```

### GET /api/oauth/generate-client

Generate client credentials (development only).

### GET /api/oauth/verify

Verify token validity.

### GET /api/oauth/info

OAuth server information.

## 🔧 **Production Configuration**

### 1. Configure Clients

```bash
# In .env
OAUTH_CLIENTS=[
  {
    "client_id": "frontend_app",
    "client_secret": "secure_secret_123"
  },
  {
    "client_id": "mobile_app",
    "client_secret": "another_secure_secret"
  }
]
```

### 2. Rotate Keys

```bash
# Generate new keys
node scripts/generate-keys.js

# Update configuration
JWT_PRIVATE_KEY_PATH=./keys/private_new.pem
JWT_PUBLIC_KEY_PATH=./keys/public_new.pem
```

### 3. Configure Scopes per Client

```typescript
// In AuthService
validateClient(client_id: string, client_secret: string): boolean {
  const clients = {
    'frontend_app': { secret: 'secure_secret_123', scopes: ['read', 'write'] },
    'mobile_app': { secret: 'another_secure_secret', scopes: ['read'] },
    'admin_tool': { secret: 'admin_secret', scopes: ['read', 'write', 'admin'] }
  };

  const client = clients[client_id];
  return client && client.secret === client_secret;
}
```

## 🔒 **Security**

### RSA vs HMAC Advantages

- **Private key never transmitted**
- **Robust cryptographic verification**
- **Scalability for multiple clients**
- **Industry standard**

### Best Practices

1. **Rotate keys periodically**
2. **Use granular scopes**
3. **Monitor token usage**
4. **Implement rate limiting**
5. **Authentication logging**

## 🆚 **Comparison: API Keys vs OAuth**

| Feature         | API Keys | OAuth 2.0 |
| --------------- | -------- | --------- |
| **Security**    | Basic    | Advanced  |
| **Scalability** | Limited  | Excellent |
| **Scopes**      | No       | Yes       |
| **Standard**    | No       | Yes       |
| **Complexity**  | Low      | Medium    |
| **Audit**       | Limited  | Complete  |

## 📚 **Additional Resources**

- [OAuth 2.0 RFC](https://tools.ietf.org/html/rfc6749)
- [JWT RFC](https://tools.ietf.org/html/rfc7519)
- [NestJS Passport](https://docs.nestjs.com/security/authentication)
- [JWT.io](https://jwt.io/) - For debugging tokens
