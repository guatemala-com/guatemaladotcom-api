# Articles API Documentation

## Overview

The Articles API provides endpoints for retrieving WordPress articles/posts in a structured format suitable for headless CMS consumption. The API exposes article data including content, metadata, SEO information, media, categories, tags, and more.

## Base URL

```
/articles
```

## Authentication

All endpoints require OAuth authentication with read permissions.

## Endpoints

### 1. Get Article by ID or Slug

**Endpoint:** `GET /articles/{identifier}`

**Description:** Retrieves an article by its ID (numeric) or slug (string). The endpoint automatically detects whether the identifier is numeric (ID) or string (slug).

**Parameters:**
- `identifier` (path, required): Article ID (numeric) or slug (string)

**Examples:**
```
GET /articles/123        # Get article by ID
GET /articles/my-article # Get article by slug
```

**Response:** [ArticleResponseDto](#articleresponsedto)

---

### 2. Get Article by ID (Explicit)

**Endpoint:** `GET /articles/id/{id}`

**Description:** Retrieves an article by its numeric ID. This is an explicit endpoint that only accepts numeric IDs.

**Parameters:**
- `id` (path, required): Numeric article ID

**Example:**
```
GET /articles/id/123
```

**Response:** [ArticleResponseDto](#articleresponsedto)

---

### 3. Get Article by Slug (Explicit)

**Endpoint:** `GET /articles/slug/{slug}`

**Description:** Retrieves an article by its slug. This is an explicit endpoint that only accepts string slugs.

**Parameters:**
- `slug` (path, required): Article slug (URL-friendly string)

**Example:**
```
GET /articles/slug/my-article-slug
```

**Response:** [ArticleResponseDto](#articleresponsedto)

---

## Response Schema

### ArticleResponseDto

```json
{
  "id": 123,
  "title": "Article Title",
  "slug": "article-slug",
  "excerpt": "Article excerpt or summary",
  "content": "<p>Full article content in HTML format</p>",
  "featuredImage": {
    "id": 456,
    "url": "https://example.com/image.jpg",
    "title": "Image Title",
    "alt": "Image alt text",
    "caption": "Image caption",
    "description": "Image description",
    "mimeType": "image/jpeg",
    "width": 800,
    "height": 600
  },
  "galleries": [
    {
      "id": "gallery-1",
      "title": "Gallery Title",
      "images": [
        {
          "id": 789,
          "url": "https://example.com/gallery-image.jpg",
          "title": "Gallery Image Title",
          "alt": "Gallery image alt text",
          "caption": "Gallery image caption",
          "description": "Gallery image description",
          "mimeType": "image/jpeg",
          "width": 600,
          "height": 400
        }
      ]
    }
  ],
  "seo": {
    "title": "SEO Title",
    "description": "SEO Description",
    "canonical": "https://example.com/article",
    "focusKeyword": "keyword",
    "metaKeywords": "keyword1, keyword2",
    "ogTitle": "OpenGraph Title",
    "ogDescription": "OpenGraph Description",
    "ogImage": "https://example.com/og-image.jpg",
    "twitterTitle": "Twitter Title",
    "twitterDescription": "Twitter Description",
    "twitterImage": "https://example.com/twitter-image.jpg",
    "schema": {
      "@type": "Article"
    }
  },
  "categories": [
    {
      "id": 1,
      "name": "Technology",
      "slug": "technology",
      "description": "Technology articles"
    }
  ],
  "tags": [
    {
      "id": 1,
      "name": "JavaScript",
      "slug": "javascript",
      "description": "JavaScript related articles"
    }
  ],
  "author": {
    "id": 1,
    "name": "Author Name",
    "email": "author@example.com",
    "bio": "Author biography",
    "avatar": "https://example.com/avatar.jpg"
  },
  "relatedArticles": [
    {
      "id": 124,
      "title": "Related Article Title",
      "slug": "related-article-slug",
      "excerpt": "Related article excerpt",
      "featuredImage": {
        "id": 457,
        "url": "https://example.com/related-image.jpg",
        "title": "Related Image Title",
        "alt": "Related image alt text"
      },
      "publishedAt": "2023-01-01T00:00:00.000Z",
      "author": {
        "id": 1,
        "name": "Author Name"
      },
      "categories": [
        {
          "id": 1,
          "name": "Technology",
          "slug": "technology"
        }
      ]
    }
  ],
  "ads": [
    {
      "id": "ad-1",
      "position": "top",
      "type": "banner",
      "content": "Ad content",
      "url": "https://example.com/ad",
      "title": "Ad Title",
      "image": "https://example.com/ad-image.jpg"
    }
  ],
  "publishedAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "status": "publish",
  "commentStatus": "open",
  "pingStatus": "open",
  "commentCount": 0,
  "viewCount": 100,
  "isSticky": false,
  "format": "standard"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Slug cannot be empty",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Article with ID 123 not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

## Content Security

The API automatically sanitizes HTML content to prevent XSS attacks by:
- Removing `<script>` tags
- Removing `<iframe>` tags
- Removing `javascript:` protocol
- Removing event handlers (`onclick`, `onload`, etc.)

## Database Integration

The API integrates directly with WordPress database tables:
- `apr_posts` - Main post content
- `apr_postmeta` - Post metadata (SEO, featured images, etc.)
- `apr_terms` - Categories and tags
- `apr_term_taxonomy` - Term taxonomies
- `apr_term_relationships` - Post-term relationships

## Performance Considerations

- The API uses efficient database queries with proper indexing
- Related articles are limited to 3 by default for performance
- Content is not cached at the API level - implement caching at the client or CDN level
- Large content with many related articles may have longer response times

## Rate Limiting

The API is subject to OAuth rate limiting based on the client credentials used.

## Support

For API support, please contact the development team or refer to the main project documentation. 