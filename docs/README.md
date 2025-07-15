# Documentation - Guatemala.com API

This folder contains all the documentation for the Guatemala.com API project.

## Table of Contents

### Setup & Configuration
- [Database Setup](./DATABASE_SETUP.md) - Complete guide for setting up the MySQL database with Docker
- [Schema Cleanup](./SCHEMA_CLEANUP.md) - Documentation of Prisma schema cleanup and database structure

### Quick Start

1. **Database Setup**: Follow the [Database Setup](./DATABASE_SETUP.md) guide to configure your local database
2. **Environment**: Create your `.env` file with the required variables
3. **Prisma Client**: Generate the Prisma client with `npx prisma generate`
4. **Development**: Start the development server with `pnpm run start:dev`

### Project Structure

The project follows Clean Architecture principles with the following structure:

```
src/
├── modules/           # Feature modules
│   ├── auth/         # Authentication & authorization
│   ├── healthcheck/  # Health check endpoints
│   ├── learn/        # Educational content
│   └── prisma/       # Database connection
├── __tests__/        # Application tests
├── app.module.ts     # Main application module
└── main.ts          # Application entry point
```

### Key Features

- **OAuth 2.0 Authentication**: Client credentials flow with RSA keys
- **Clean Architecture**: Separation of concerns with use cases
- **Prisma ORM**: Type-safe database operations
- **Comprehensive Testing**: Unit and integration tests
- **Docker Support**: MySQL database with automatic initialization

### Additional Resources

- [Main README](../README.md) - Overview and getting started
- [Test Documentation](../test/README.md) - Testing setup and utilities

For more detailed information, refer to the specific documentation files in this folder. 