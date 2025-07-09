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

### **Development Flow**

#### 1. Get Client Credentials

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

#### 2. Get Access Token

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

#### 3. Use Token in Requests

```bash
curl -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:3000/api/protected-endpoint
```

### **Production Flow**

#### **Step 1: Pre-configure Clients**

Before deploying, you need to register your clients:

```bash
# 1. Generate credentials for each client type
curl https://api.guatemala.com/api/oauth/generate-client
# Response: {"client_id":"frontend_app_abc123","client_secret":"gt_secret_xyz789"}

curl https://api.guatemala.com/api/oauth/generate-client
# Response: {"client_id":"mobile_app_def456","client_secret":"gt_secret_uvw012"}

# 2. Add to production environment
OAUTH_CLIENTS=[
  {"client_id":"frontend_app_abc123","client_secret":"gt_secret_xyz789"},
  {"client_id":"mobile_app_def456","client_secret":"gt_secret_uvw012"}
]
```

#### **Step 2: Client Applications Get Tokens**

**Frontend Application:**

```typescript
// Your frontend app requests a token
const response = await fetch('https://api.guatemala.com/api/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: 'frontend_app_abc123',
    client_secret: 'gt_secret_xyz789',
    scope: 'read write',
  }),
});

const { access_token } = await response.json();
```

**Mobile Application:**

```typescript
// Your mobile app requests a token
const response = await fetch('https://api.guatemala.com/api/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: 'mobile_app_def456',
    client_secret: 'gt_secret_uvw012',
    scope: 'read', // Limited scope for mobile
  }),
});

const { access_token } = await response.json();
```

#### **Step 3: Use Tokens in API Requests**

```typescript
// Both frontend and mobile use tokens the same way
const data = await fetch('https://api.guatemala.com/api/content', {
  headers: {
    Authorization: `Bearer ${access_token}`,
    'Content-Type': 'application/json',
  },
});
```

#### **Step 4: Token Expiration & Renewal**

```typescript
// Tokens expire after 1 hour (configurable)
// Client should request new token when expired

// Check if token is expired
const tokenData = JSON.parse(atob(access_token.split('.')[1]));
const isExpired = tokenData.exp * 1000 < Date.now();

if (isExpired) {
  // Request new token
  const newToken = await getNewToken();
}
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

### 1. **Configure OAuth Clients**

In production, you need to pre-configure your OAuth clients. You have two options:

#### **Option A: Environment Variables (Recommended)**

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
  },
  {
    "client_id": "admin_dashboard",
    "client_secret": "admin_secret_456"
  }
]
```

#### **Option B: Database (For many clients)**

If you have many clients, store them in a database:

```typescript
// In AuthService
async validateClient(client_id: string, client_secret: string): Promise<boolean> {
  const client = await this.clientRepository.findByClientId(client_id);

  if (!client) {
    return false;
  }

  return client.secret === client_secret;
}
```

### 2. **Client Registration Process**

#### **For Frontend Applications:**

```bash
# 1. Generate client credentials
curl http://your-api.com/api/oauth/generate-client

# 2. Save the response securely
{
  "client_id": "frontend_app_abc123",
  "client_secret": "gt_secret_xyz789"
}

# 3. Add to production environment
OAUTH_CLIENTS=[{"client_id":"frontend_app_abc123","client_secret":"gt_secret_xyz789"}]
```

#### **For Mobile Applications:**

```bash
# 1. Generate separate credentials for mobile
curl http://your-api.com/api/oauth/generate-client

# 2. Use different scopes for mobile
{
  "client_id": "mobile_app_def456",
  "client_secret": "gt_secret_uvw012"
}
```

### 3. **Scope Management**

#### **Define Scope Policies:**

```typescript
// In AuthService
const SCOPE_POLICIES = {
  'frontend_app': ['read', 'write'],
  'mobile_app': ['read'],
  'admin_dashboard': ['read', 'write', 'admin'],
  'api_client': ['read', 'write']
};

async validateClient(client_id: string, client_secret: string): Promise<boolean> {
  // Validate credentials
  const isValid = await this.checkCredentials(client_id, client_secret);

  if (!isValid) {
    return false;
  }

  // Check if client has access to requested scopes
  const requestedScopes = this.getRequestedScopes();
  const allowedScopes = SCOPE_POLICIES[client_id] || [];

  return requestedScopes.every(scope => allowedScopes.includes(scope));
}
```

### 4. **Key Management**

#### **Generate Production Keys:**

```bash
# On your production server
node scripts/generate-keys.js

# This creates:
# - keys/private.pem (KEEP SECURE!)
# - keys/public.pem (can be shared)
```

#### **Deploy Keys Securely:**

```bash
# Option A: Direct file placement
scp keys/private.pem user@server:/app/keys/
scp keys/public.pem user@server:/app/keys/

# Option B: Environment variables (for cloud platforms)
# Set JWT_PRIVATE_KEY and JWT_PUBLIC_KEY as environment variables
```

#### **Key Rotation Process:**

```bash
# 1. Generate new keys
node scripts/generate-keys.js

# 2. Deploy new keys
# 3. Update environment variables
JWT_PRIVATE_KEY_PATH=./keys/private_new.pem
JWT_PUBLIC_KEY_PATH=./keys/public_new.pem

# 4. Restart application
# 5. Old tokens will become invalid (good for security)
```

### 5. **Environment Configuration**

#### **Production .env:**

```bash
# OAuth 2.0 Configuration
JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_PUBLIC_KEY_PATH=./keys/public.pem
JWT_EXPIRES_IN=1h
JWT_ISSUER=guatemala.com
JWT_AUDIENCE=guatemala.com-api

# OAuth Clients (JSON array)
OAUTH_CLIENTS=[
  {"client_id":"frontend_app","client_secret":"secure_secret_123"},
  {"client_id":"mobile_app","client_secret":"mobile_secret_456"},
  {"client_id":"admin_dashboard","client_secret":"admin_secret_789"}
]

# Security
NODE_ENV=production
RATE_LIMIT_TTL=60000
RATE_LIMIT_LIMIT=100
```

### 6. **Client Integration Examples**

#### **Frontend (React/Vue/Angular):**

```typescript
// 1. Get token
const response = await fetch('/api/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: 'frontend_app',
    client_secret: 'secure_secret_123',
    scope: 'read write',
  }),
});

const { access_token } = await response.json();

// 2. Use token
const data = await fetch('/api/content', {
  headers: { Authorization: `Bearer ${access_token}` },
});
```

#### **Mobile (React Native/Flutter):**

```typescript
// Similar to frontend, but with mobile client credentials
const response = await fetch('/api/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: 'mobile_app',
    client_secret: 'mobile_secret_456',
    scope: 'read', // Limited scope for mobile
  }),
});
```

#### **Server-to-Server:**

```bash
curl -X POST https://api.guatemala.com/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=api_client" \
  -d "client_secret=api_secret_789" \
  -d "scope=read write"
```

### 7. **Monitoring & Security**

#### **Enable Logging:**

```typescript
// In AuthService
async generateAccessToken(client_id: string, scope?: string): Promise<string> {
  // Log token generation
  this.logger.log(`Token generated for client: ${client_id}, scopes: ${scope}`);

  const payload = {
    sub: client_id,
    iat: Math.floor(Date.now() / 1000),
    scope,
  };

  return this.jwtService.signAsync(payload);
}
```

#### **Monitor Token Usage:**

```typescript
// Track token requests
@Post('token')
async getToken(@Body() tokenRequest: TokenRequestDto): Promise<TokenResponseDto> {
  // Log authentication attempts
  this.logger.log(`Auth attempt from client: ${tokenRequest.client_id}`);

  // ... rest of the logic
}
```

### 8. **Deployment Checklist**

- [ ] Generate production RSA keys
- [ ] Configure OAuth clients in environment
- [ ] Set up scope policies
- [ ] Configure rate limiting
- [ ] Enable logging
- [ ] Test client integrations
- [ ] Set up monitoring
- [ ] Document client credentials
- [ ] Plan key rotation schedule

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

## ❓ **Production FAQ**

### **Q: How do I register a new client in production?**

A:

1. Generate credentials: `curl https://api.guatemala.com/api/oauth/generate-client`
2. Add to `OAUTH_CLIENTS` environment variable
3. Restart the application

### **Q: Can I change client scopes without restarting?**

A: Currently no, but you can implement database storage for dynamic scope management.

### **Q: What happens if I lose the private key?**

A: All existing tokens become invalid. Generate new keys and update all clients.

### **Q: How often should I rotate keys?**

A: Industry standard is every 90-365 days. More frequently for high-security applications.

### **Q: Can I have different expiration times for different clients?**

A: Currently no, but you can implement custom logic in the `generateAccessToken` method.

### **Q: How do I monitor token usage?**

A: Enable logging in the AuthService and use monitoring tools to track authentication attempts.

### **Q: What if a client secret is compromised?**

A:

1. Remove the client from `OAUTH_CLIENTS`
2. Generate new credentials for that client
3. Update the client application
4. Old tokens will become invalid

### **Q: Can I use this with a CDN?**

A: Yes, but ensure the CDN forwards the `Authorization` header to your API.

## 📚 **Additional Resources**

- [OAuth 2.0 RFC](https://tools.ietf.org/html/rfc6749)
- [JWT RFC](https://tools.ietf.org/html/rfc7519)
- [NestJS Passport](https://docs.nestjs.com/security/authentication)
- [JWT.io](https://jwt.io/) - For debugging tokens
