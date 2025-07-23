# Database Setup - Guatemala.com API

## Docker Configuration

### 1. Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# MySQL Database
MYSQL_ROOT_PASSWORD=root_password_here
MYSQL_DATABASE=aprende_db
MYSQL_USER=guatemala_user
MYSQL_PASSWORD=user_password_here

# Database connection URL for Prisma
DATABASE_URL="mysql://guatemala_user:user_password_here@localhost:3306/aprende_db"

# Application Configuration
PORT=3001
NODE_ENV=development
APP_URL=https://aprende.guatemala.com

# JWT Configuration
JWT_PRIVATE_KEY_PATH=keys/private.pem
JWT_PUBLIC_KEY_PATH=keys/public.pem
JWT_EXPIRES_IN=1h
JWT_ISSUER=guatemala.com
JWT_AUDIENCE=guatemala-api

# Refresh Token Configuration
REFRESH_TOKEN_ENABLED=true
REFRESH_TOKEN_EXPIRES_IN=604800

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# OAuth Clients Configuration (JSON)
OAUTH_CLIENTS='[{"clientId":"webapp-client","clientSecret":"your-secret-here","allowedScopes":["read","write"],"requiresCertificate":false}]'
```

### 2. Start the Database

```bash
# Start MySQL with automatic dump loading
docker-compose up -d mysql

# Verify container is running
docker-compose ps

# View MySQL container logs
docker-compose logs mysql
```

### 3. Access the Database

#### Option 1: MySQL Client

```bash
# Connect with MySQL client
mysql -h localhost -P 3306 -u guatemala_user -p aprende_db

# Or as root
mysql -h localhost -P 3306 -u root -p aprende_db
```

#### Option 2: GUI Tools (Recommended)

For a better visual experience, you can use:

- **MySQL Workbench**: Official MySQL GUI tool
- **DBeaver**: Universal database tool
- **phpMyAdmin**: Web-based MySQL administration tool
- **TablePlus**: Modern database GUI tool

**Connection settings for any GUI tool**:

- Host: `localhost`
- Port: `3306`
- User: `guatemala_user` (or `root` for full access)
- Password: the one configured in .env
- Database: `aprende_db`

### 4. Generate Prisma Client

```bash
# Generate Prisma client
npx prisma generate

# Validate schema
npx prisma validate

# Open Prisma Studio
npx prisma studio
```

## Database Structure

### Main Tables

#### `apr_posts`

- **Purpose**: Main content (posts, pages, etc.)
- **Key fields**: `post_title`, `post_content`, `post_type`, `post_status`
- **Relations**: Connects with `apr_postmeta` for metadata

#### `apr_postmeta`

- **Purpose**: Metadata and custom fields
- **Key fields**: `meta_key`, `meta_value`
- **Usage**: SEO, configurations, additional data

#### `apr_users`

- **Purpose**: User and author information
- **Key fields**: `user_login`, `display_name`, `user_email`
- **Security**: Includes `user_pass` for authentication

#### `apr_learn_meta`

- **Purpose**: Educational content with sponsors
- **Key fields**: `url`, `author_name`, `is_sponsored`
- **Functionality**: Sponsored educational content management

## Useful Commands

### Docker

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data!)
docker-compose down -v

# Rebuild containers
docker-compose up --build

# View logs in real-time
docker-compose logs -f mysql
```

### Prisma

```bash
# Synchronize schema with database
npx prisma db push

# Create migration from schema changes
npx prisma migrate dev --name init

# Reset database (WARNING!)
npx prisma migrate reset
```

## Troubleshooting

### Error: "Table doesn't exist"

```bash
# Verify dump was loaded correctly
docker-compose exec mysql mysql -u root -p aprende_db -e "SHOW TABLES;"
```

### Error: "Connection refused"

```bash
# Verify MySQL is running
docker-compose ps mysql

# Check logs
docker-compose logs mysql
```

### Error: "Access denied"

```bash
# Verify environment variables
docker-compose exec mysql env | grep MYSQL

# Recreate container with new variables
docker-compose down
docker-compose up -d mysql
```

## Test Data

The dump includes real production data. For development, you can:

1. **Use complete data**: Ideal for realistic testing
2. **Filter data**: Create a smaller dump with fewer records
3. **Synthetic data**: Use Prisma seeds for test data

```bash
# Example: Count records
docker-compose exec mysql mysql -u root -p aprende_db -e "SELECT COUNT(*) FROM apr_posts;"
```

## Important Notes

- **Security**: The dump contains production data, keep it secure
- **Performance**: The database is large, consider using appropriate indexes
- **Backup**: Always backup before making important changes
- **Versions**: The dump is compatible with MySQL 8.0+

## Next Steps

1. **Implement modules**: Create controllers and services for tables
2. **Optimize queries**: Use indexes and efficient queries
3. **Cache data**: Implement Redis for improved performance
4. **Monitoring**: Configure logs and database metrics
