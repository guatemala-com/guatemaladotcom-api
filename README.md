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

## Project Setup

```bash
$ pnpm install
```

## Environment Configuration

Create a `.env` file in the project root to set environment variables. Copy the example file:

```bash
$ cp .env.example .env
```

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
