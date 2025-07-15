# Limpieza del Esquema de Prisma - Guatemala.com API

## Resumen de Cambios

**Fecha**: 2025-07-10  
**Objetivo**: Alinear el esquema de Prisma con la estructura real de la base de datos y eliminar modelos innecesarios.


## Modelos Eliminados

### `AprUsers` (Eliminado en segunda iteración)
- **Razón**: La tabla `apr_users` no existe en la base de datos real
- **Impacto**: Eliminada completamente del esquema
- **Nota**: Los autores probablemente se gestionan de otra manera o están en una base de datos separada

## Modelos Conservados y Ajustados

### `AprPosts` (WordPress Posts)
**Conservado**: Esencial para el contenido principal del sitio

**Estructura completa basada en DB real**:
- `id` (ID) - Identificador único del post
- `postAuthor` (post_author) - ID del autor
- `postDate` (post_date) - Fecha de publicación
- `postDateGmt` (post_date_gmt) - Fecha de publicación GMT
- `postContent` (post_content) - Contenido del post
- `postTitle` (post_title) - Título del post
- `postExcerpt` (post_excerpt) - Extracto del post
- `postStatus` (post_status) - Estado de publicación
- `commentStatus` (comment_status) - Estado de comentarios
- `pingStatus` (ping_status) - Estado de pings
- `postPassword` (post_password) - Contraseña del post
- `postName` (post_name) - Slug del post
- `toPing` (to_ping) - URLs para hacer ping
- `pinged` (pinged) - URLs ya procesadas
- `postModified` (post_modified) - Fecha de modificación
- `postModifiedGmt` (post_modified_gmt) - Fecha de modificación GMT
- `postContentFiltered` (post_content_filtered) - Contenido filtrado
- `postParent` (post_parent) - Post padre
- `guid` (guid) - GUID único
- `menuOrder` (menu_order) - Orden del menú
- `postType` (post_type) - Tipo de contenido
- `postMimeType` (post_mime_type) - Tipo MIME
- `commentCount` (comment_count) - Número de comentarios

**Índices**: Coinciden exactamente con la base de datos real

### `AprPostmeta` (WordPress Post Meta)
**Conservado**: Esencial para metadatos, custom fields, y SEO

**Estructura completa**:
- `metaId` (meta_id) - Identificador único del metadato
- `postId` (post_id) - Referencia al post
- `metaKey` (meta_key) - Clave del metadato
- `metaValue` (meta_value) - Valor del metadato

**Índices**: Incluye índices en `post_id` y `meta_key`

### `AprLearnMeta` (Learn Meta)
**Restaurado**: Contenido educativo con información de patrocinadores

**Estructura completa basada en DB real**:
- `id` (ID) - Identificador único
- `url` (url) - URL del contenido
- `thumbnailId` (thumbnail_id) - ID de la imagen miniatura
- `authorId` (author_id) - ID del autor
- `authorName` (author_name) - Nombre del autor
- `images` (images) - Imágenes del contenido
- `isSponsored` (is_sponsored) - Indicador de contenido patrocinado
- `sponsorName` (sponsor_name) - Nombre del patrocinador
- `sponsorUrl` (sponsor_url) - URL del patrocinador
- `sponsorImage` (sponsor_image) - Imagen del patrocinador
- `sponsorImageSidebarUrl` (sponsor_image_sidebar_url) - URL de imagen sidebar
- `sponsorImageSidebar` (sponsor_image_sidebar) - ID de imagen sidebar
- `sponsorImageContentUrl` (sponsor_image_content_url) - URL de imagen contenido
- `sponsorImageContent` (sponsor_image_content) - ID de imagen contenido
- `sponsorExtraData` (sponsor_extra_data) - Datos adicionales del patrocinador

## Configuración de Docker

### Base de Datos
- **Imagen**: MySQL 8.0
- **Inicialización**: Automática con dump SQL
- **Volumen**: Persistencia de datos
- **Puerto**: 3306

### Adminer
- **Imagen**: Adminer 4.8.1
- **Puerto**: 8080
- **Acceso**: http://localhost:8080

### Comandos Docker
```bash
# Iniciar base de datos
docker compose up -d mysql

# Iniciar Adminer
docker compose up -d adminer

# Ver logs
docker compose logs mysql

# Acceder a MySQL
docker compose exec mysql mysql -u root -p aprende_db
```

## Validación Completada

- ✅ **Base de datos**: Cargada correctamente con 69,684 posts
- ✅ **Tablas**: Todas las tablas del esquema existen en la DB
- ✅ **Datos**: Verificados registros en todas las tablas principales
- ✅ **Esquema**: Alineado 100% con la estructura real
- ✅ **Mapeos**: Todos los campos mapeados correctamente
- ✅ **Índices**: Coinciden con la base de datos real

## Estructura Final

### Contenido Principal
- **`apr_posts`**: 56,977 posts, páginas y contenido
- **`apr_postmeta`**: 759,847 metadatos y custom fields

### Contenido Educativo
- **`apr_learn_meta`**: 5,983 registros de contenido educativo con patrocinadores

## Notas Importantes

### Gestión de Autores
- Los autores se referencian por ID en `post_author` de `apr_posts`
- La tabla `apr_users` no existe en esta base de datos
- Posiblemente los usuarios estén en otra base de datos o sistema

### Datos de Producción
- La base de datos contiene datos reales de producción
- Total de posts: 56,977
- Total de metadatos: 759,847
- Contenido educativo: 5,983 registros

### Performance
- La base de datos es considerablemente grande
- Se recomienda usar índices apropiados (ya incluidos)
- Considerar paginación para consultas grandes

## Próximos Pasos

1. **Generar cliente Prisma**: `npx prisma generate`
2. **Implementar servicios**: Crear módulos para posts, meta y learn
3. **Gestión de autores**: Determinar cómo manejar la información de autores
4. **Optimización**: Implementar cacheo y paginación
5. **Testing**: Crear tests con datos reales

## Comandos de Validación

```bash
# Verificar tablas
docker compose exec mysql mysql -u root -p aprende_db -e "SHOW TABLES LIKE 'apr_%';"

# Contar registros
docker compose exec mysql mysql -u root -p aprende_db -e "SELECT COUNT(*) FROM apr_posts;"

# Generar cliente Prisma
npx prisma generate

# Abrir Prisma Studio
npx prisma studio
```

## Configuración de Entorno

El archivo `.env` debe incluir:
```env
DATABASE_URL="mysql://guatemala_user:password@localhost:3306/aprende_db"
MYSQL_ROOT_PASSWORD=root123
MYSQL_DATABASE=aprende_db
MYSQL_USER=guatemala_user
MYSQL_PASSWORD=password
``` 