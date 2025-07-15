# guatemala.com API

A NestJS-based API for the Guatemala.com WordPress headless migration project.

## Description

This project is part of a comprehensive migration from a traditional WordPress website to a headless architecture. We're using WordPress as a Content Management System (CMS) while building a modern Next.js frontend application. This API serves as the backend layer that connects the WordPress CMS with the frontend application.

## Architecture

- **Backend**: NestJS with TypeScript
- **Frontend**: Next.js (separate repository)
- **CMS**: WordPress (headless)
- **Database**: MySQL / AWS Aurora
- **ORM**: Prisma
- **Testing**: Jest
- **Architecture Pattern**: Clean Architecture with Use Cases

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MySQL / AWS Aurora
- **ORM**: Prisma
- **Testing**: Jest
- **Architecture**: Clean Architecture
- **Pattern**: Use Cases

## Security

- **OAuth 2.0 Client Credentials Flow**: Modern authentication standard
- **RSA Key Authentication**: Secure JWT tokens with public/private keys
- **Granular Scopes**: Fine-grained access control (read, write, admin)
- **Rate Limiting**: Prevent abuse and DDoS attacks
- **CORS Protection**: Control allowed origins
- **Request Validation**: Validate and sanitize input data

### OAuth RSA Keys Configuration

The API now uses RSA keys for JWT signing instead of symmetric secrets for enhanced security.

### Generating RSA Keys

Run the following command to generate RSA key pairs:

```bash
node scripts/generate-keys.js
```

This will create:

- `keys/private.pem` - Used by the server to sign tokens
- `keys/public.pem` - Used to verify tokens (can be shared with clients)

### Benefits

- **Asymmetric Authentication**: Server signs with private key, clients verify with public key
- **Enhanced Security**: Even if client is compromised, they cannot generate valid tokens
- **Key Rotation**: Keys can be rotated without sharing new secrets with all clients

### Refresh Token Support

The API now supports refresh tokens for improved user experience:

- **Short-lived Access Tokens**: Access tokens expire in 1 hour
- **Long-lived Refresh Tokens**: Refresh tokens expire in 7 days (configurable)
- **Token Rotation**: Refresh tokens are automatically rotated for enhanced security
- **Scope Management**: Refresh tokens can request reduced scopes

#### Benefits of Refresh Tokens

- **Better UX**: Users don't need to re-authenticate frequently
- **Enhanced Security**: Short-lived access tokens reduce risk window
- **Automatic Rotation**: Old refresh tokens are invalidated when used
- **Scope Flexibility**: Request different scopes during refresh

### Client Certificate Authentication (Optional)

The API supports optional client certificate authentication for enhanced security:

```bash
# OAuth Client Configuration with Certificate Support
OAUTH_CLIENTS='[
  {
    "clientId": "webapp-client",
    "clientSecret": "your-secret-here",
    "allowedScopes": ["read", "write"],
    "requiresCertificate": false
  },
  {
    "clientId": "secure-service",
    "clientSecret": "secure-secret",
    "allowedScopes": ["read", "write", "admin"],
    "requiresCertificate": true,
    "certificateFingerprint": "A1B2C3D4E5F6..."
  }
]'
```

#### Certificate Authentication Types

1. **Web App (No Certificate)**: Traditional client_id/client_secret authentication
2. **Server-to-Server (Optional Certificate)**: Certificate adds extra security layer
3. **High-Security Client (Required Certificate)**: Certificate is mandatory

## Project Setup

```bash
$ pnpm install
```

## Environment Configuration

Create a `.env` file in the project root to set environment variables. Copy the example file:

```bash
$ cp env.example .env
```

### Security Configuration

The API includes multiple security layers for content protection:

## Documentation

Complete documentation is available in the [`docs/`](./docs/) folder:

- [Database Setup](./docs/DATABASE_SETUP.md) - Complete guide for setting up the MySQL database with Docker
- [Schema Cleanup](./docs/SCHEMA_CLEANUP.md) - Documentation of Prisma schema cleanup and database structure

## Database Setup

```bash
# Generate Prisma client
$ pnpm prisma generate

# Run database migrations
$ pnpm prisma migrate dev

# Seed database (if applicable)
$ pnpm prisma db seed
```

## Docker

You can quickly start a local MySQL database for development using the provided `docker-compose.yml` file.

Make sure you have a `.env` file in the project root with the required variables.

```bash
# Start MySQL:
$ docker-compose --env-file env_file_path up -d

# top MySQL:
$ docker-compose down
```

## Compile and Run the Project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run Tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Database Management

```bash
# Open Prisma Studio
$ pnpm prisma studio

# Reset database
$ pnpm prisma migrate reset

# Deploy migrations to production
$ pnpm prisma migrate deploy
```

## Project Structure

```
src/
├── modules/           # Feature modules
│   ├── posts/        # WordPress posts integration
│   ├── pages/        # WordPress pages integration
│   └── media/        # WordPress media integration
├── shared/           # Shared utilities and interfaces
│   ├── domain/       # Domain entities and interfaces
│   ├── infrastructure/ # External services and repositories
│   └── application/  # Use cases and application services
├── config/           # Configuration files
└── main.ts          # Application entry point
```

## Development Guidelines

- Follow Clean Architecture principles
- Implement Use Cases for business logic
- Use Prisma for database operations
- Write comprehensive tests with Jest
- Maintain separation of concerns between layers

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## Support

This project is part of the Guatemala.com migration initiative. For questions and support, please contact the development team.

## License

This project is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
