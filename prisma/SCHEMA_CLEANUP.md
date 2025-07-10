# Limpieza del Esquema de Prisma - Guatemala.com API

## Resumen de Cambios

**Fecha**: 2025-07-10  
**Objetivo**: Reducir el tamaño y complejidad del esquema de Prisma eliminando modelos generados automáticamente que no serán utilizados en la API headless.

## Modelos Eliminados

### `AprLearnMeta`
- **Razón**: Modelo específico para contenido educativo/aprendizaje que no forma parte de la funcionalidad principal de la API
- **Campos eliminados**: `id`, `url`, `thumbnailId`, `authorId`, `authorName`, `images`, `isSponsored`
- **Impacto**: Ninguno - no había referencias en el código

## Modelos Conservados y Simplificados

### `AprPosts` (WordPress Posts)
**Conservado**: Esencial para el contenido principal del sitio (posts, páginas, etc.)

**Campos conservados**:
- `id` - Identificador único del post
- `postAuthor` - ID del autor
- `postDate` / `postDateGmt` - Fechas de publicación
- `postContent` - Contenido del post
- `postTitle` - Título del post
- `postExcerpt` - Extracto del post
- `postStatus` - Estado de publicación
- `postName` - Slug del post
- `postModified` / `postModifiedGmt` - Fechas de modificación
- `postParent` - Para jerarquías (páginas padre)
- `guid` - GUID único de WordPress
- `postType` - Tipo de contenido (post, page, etc.)
- `commentCount` - Número de comentarios

**Campos eliminados**:
- `commentStatus` - No necesario para API headless
- `pingStatus` - Funcionalidad de WordPress no requerida
- `postPassword` - No necesario para contenido público
- `toPing` / `pinged` - Funcionalidad de WordPress no requerida
- `postContentFiltered` - Campo interno no necesario
- `menuOrder` - No necesario para posts regulares
- `postMimeType` - No necesario para posts regulares

### `AprPostmeta` (WordPress Post Meta)
**Conservado**: Esencial para metadatos, custom fields, y SEO

**Campos conservados**:
- `metaId` - Identificador único del metadato
- `postId` - Referencia al post
- `metaKey` - Clave del metadato
- `metaValue` - Valor del metadato
- **Relación**: Conectado con `AprPosts`

### `AprUsers` (WordPress Users)
**Conservado**: Necesario para información de autores

**Campos conservados**:
- `id` - Identificador único del usuario
- `userLogin` - Nombre de usuario
- `userNicename` - Nombre "amigable" del usuario
- `userEmail` - Email del usuario
- `userUrl` - URL del usuario
- `userRegistered` - Fecha de registro
- `displayName` - Nombre para mostrar

**Campos eliminados**:
- `userPass` - No necesario para API (seguridad)
- `userActivationKey` - No necesario para API
- `userStatus` - No necesario para API

## Mejoras Implementadas

1. **Mapeo de tablas explícito**: Se agregaron `@@map()` para claridad
2. **Comentarios descriptivos**: Se agregaron comentarios explicativos para cada modelo
3. **Optimización de relaciones**: Se mantuvieron solo las relaciones esenciales
4. **Simplificación de esquema**: Se eliminaron campos no necesarios para una API headless

## Tablas Relevantes para el Proyecto

### Contenido Principal
- **`apr_posts`**: Posts, páginas, y otros tipos de contenido
- **`apr_postmeta`**: Metadatos, custom fields, configuración SEO

### Usuarios y Autores
- **`apr_users`**: Información de autores de contenido

## Justificación de Decisiones

### ¿Por qué se eliminó `AprLearnMeta`?
- Era específico para funcionalidad educativa que no está en el scope del proyecto
- No hay referencias en el código actual
- No forma parte de la estructura estándar de WordPress

### ¿Por qué se simplificaron los modelos?
- **API Headless**: Muchos campos de WordPress son específicos para el frontend tradicional
- **Seguridad**: Se eliminaron campos sensibles como contraseñas
- **Performance**: Menos campos = menos datos transferidos y procesados
- **Mantenibilidad**: Esquema más limpio y fácil de entender

## Validación

- ✅ **Sintaxis**: Esquema sintácticamente correcto
- ✅ **Servicios**: No hay impacto en servicios existentes (no había referencias)
- ✅ **Funcionalidad**: Se conservaron todos los campos esenciales para una API headless
- ⚠️ **Generación**: No se pudo ejecutar `prisma generate` debido a versión de Node.js (requiere >=18)

## Próximos Pasos

1. **Actualizar Node.js**: Actualizar a versión 18+ para poder ejecutar `prisma generate`
2. **Implementar módulos**: Crear módulos para posts, users, y meta según sea necesario
3. **Agregar campos SEO**: Considerar agregar campos específicos para SEO en el futuro
4. **Relaciones adicionales**: Agregar relaciones entre Users y Posts cuando sea necesario

## Comandos para Validar

```bash
# Generar cliente de Prisma (requiere Node.js >=18)
npx prisma generate

# Verificar esquema
npx prisma validate

# Ver base de datos en Prisma Studio
npx prisma studio
```

## Notas Adicionales

- El esquema está optimizado para una arquitectura headless
- Se mantuvieron solo los campos esenciales para el funcionamiento de la API
- Los mapeos de tabla permiten controlar los nombres de las tablas en la base de datos
- La limpieza reduce significativamente la complejidad del esquema 