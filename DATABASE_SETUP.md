# Configuración de Base de Datos - Guatemala.com API

## Configuración con Docker

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Base de datos MySQL
MYSQL_ROOT_PASSWORD=root_password_here
MYSQL_DATABASE=aprende_db
MYSQL_USER=guatemala_user
MYSQL_PASSWORD=user_password_here

# URL de conexión a la base de datos para Prisma
DATABASE_URL="mysql://guatemala_user:user_password_here@localhost:3306/aprende_db"

# Configuración de la aplicación
PORT=3001
NODE_ENV=development

# Configuración de JWT
JWT_PRIVATE_KEY_PATH=keys/private.pem
JWT_PUBLIC_KEY_PATH=keys/public.pem
JWT_EXPIRES_IN=1h
JWT_ISSUER=guatemala.com
JWT_AUDIENCE=guatemala-api

# Configuración de Refresh Tokens
REFRESH_TOKEN_ENABLED=true
REFRESH_TOKEN_EXPIRES_IN=604800

# Configuración de CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Configuración de OAuth Clients (JSON)
OAUTH_CLIENTS='[{"clientId":"webapp-client","clientSecret":"your-secret-here","allowedScopes":["read","write"],"requiresCertificate":false}]'
```

### 2. Iniciar la Base de Datos

```bash
# Iniciar MySQL con el dump automáticamente cargado
docker-compose up -d mysql

# Verificar que el contenedor esté funcionando
docker-compose ps

# Ver logs del contenedor MySQL
docker-compose logs mysql
```

### 3. Acceder a la Base de Datos

#### Opción 1: Adminer (Interfaz Web)
```bash
# Iniciar Adminer
docker-compose up -d adminer

# Acceder a http://localhost:8080
# Sistema: MySQL
# Servidor: mysql
# Usuario: guatemala_user (o root para acceso completo)
# Contraseña: la que configuraste en .env
# Base de datos: aprende_db
```

#### Opción 2: Cliente MySQL
```bash
# Conectar con cliente MySQL
mysql -h localhost -P 3306 -u guatemala_user -p aprende_db

# O como root
mysql -h localhost -P 3306 -u root -p aprende_db
```

### 4. Generar Cliente de Prisma

```bash
# Generar el cliente de Prisma
npx prisma generate

# Validar el esquema
npx prisma validate

# Abrir Prisma Studio
npx prisma studio
```

## Estructura de la Base de Datos

### Tablas Principales

#### `apr_posts`
- **Propósito**: Contenido principal (posts, páginas, etc.)
- **Campos clave**: `post_title`, `post_content`, `post_type`, `post_status`
- **Relaciones**: Conecta con `apr_postmeta` para metadatos

#### `apr_postmeta`
- **Propósito**: Metadatos y custom fields
- **Campos clave**: `meta_key`, `meta_value`
- **Uso**: SEO, configuraciones, datos adicionales

#### `apr_users`
- **Propósito**: Información de usuarios y autores
- **Campos clave**: `user_login`, `display_name`, `user_email`
- **Seguridad**: Incluye `user_pass` para autenticación

#### `apr_learn_meta`
- **Propósito**: Contenido educativo con patrocinadores
- **Campos clave**: `url`, `author_name`, `is_sponsored`
- **Funcionalidad**: Gestión de contenido educativo patrocinado

## Comandos Útiles

### Docker
```bash
# Parar todos los servicios
docker-compose down

# Parar y eliminar volúmenes (¡CUIDADO: elimina datos!)
docker-compose down -v

# Reconstruir contenedores
docker-compose up --build

# Ver logs en tiempo real
docker-compose logs -f mysql
```

### Prisma
```bash
# Sincronizar esquema con la base de datos
npx prisma db push

# Crear migración desde cambios en el esquema
npx prisma migrate dev --name init

# Resetear base de datos (¡CUIDADO!)
npx prisma migrate reset
```

## Solución de Problemas

### Error: "Table doesn't exist"
```bash
# Verificar que el dump se haya cargado correctamente
docker-compose exec mysql mysql -u root -p aprende_db -e "SHOW TABLES;"
```

### Error: "Connection refused"
```bash
# Verificar que MySQL esté ejecutándose
docker-compose ps mysql

# Verificar logs
docker-compose logs mysql
```

### Error: "Access denied"
```bash
# Verificar variables de entorno
docker-compose exec mysql env | grep MYSQL

# Recrear contenedor con nuevas variables
docker-compose down
docker-compose up -d mysql
```

## Datos de Prueba

El dump incluye datos reales de producción. Para development, puedes:

1. **Usar datos completos**: Ideal para testing realista
2. **Filtrar datos**: Crear un dump más pequeño con menos registros
3. **Datos sintéticos**: Usar seeds de Prisma para datos de prueba

```bash
# Ejemplo: Contar registros
docker-compose exec mysql mysql -u root -p aprende_db -e "SELECT COUNT(*) FROM apr_posts;"
```

## Notas Importantes

- **Seguridad**: El dump contiene datos de producción, mantén seguro
- **Performance**: La base de datos es grande, considera usar índices apropiados
- **Backup**: Siempre respalda antes de hacer cambios importantes
- **Versiones**: El dump es compatible con MySQL 8.0+

## Próximos Pasos

1. **Implementar módulos**: Crear controladores y servicios para las tablas
2. **Optimizar consultas**: Usar índices y queries eficientes
3. **Cachear datos**: Implementar Redis para mejorar performance
4. **Monitoreo**: Configurar logs y métricas de la base de datos 