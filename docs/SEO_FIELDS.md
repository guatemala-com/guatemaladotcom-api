# SEO Fields Documentation

## Overview

El endpoint `GET /learn/article/:id` ahora incluye un objeto `seo` completo con información de RankMath para optimización SEO y redes sociales.

## Estructura del objeto SEO

```json
{
  "seo": {
    "title": "Título SEO optimizado",
    "description": "Descripción SEO optimizada",
    "canonical": "https://example.com/canonical-url",
    "focus_keyword": "palabra clave principal",
    "seo_score": 85,
    "og_title": "Título para Open Graph (Facebook)",
    "og_description": "Descripción para Open Graph",
    "og_image": "https://example.com/og-image.jpg",
    "twitter_title": "Título para Twitter",
    "twitter_description": "Descripción para Twitter",
    "twitter_image": "https://example.com/twitter-image.jpg"
  }
}
```

## Campos SEO

### Campos básicos
- **title**: Título SEO del artículo (fallback: título del post)
- **description**: Descripción SEO del artículo (fallback: excerpt del post)
- **canonical**: URL canónica del artículo
- **focus_keyword**: Palabra clave principal del artículo
- **seo_score**: Puntuación SEO de RankMath (0-100)

### Open Graph (Facebook)
- **og_title**: Título para compartir en Facebook (fallback: title SEO)
- **og_description**: Descripción para Facebook (fallback: description SEO)
- **og_image**: Imagen para compartir en Facebook

### Twitter Cards
- **twitter_title**: Título para Twitter (fallback: og_title)
- **twitter_description**: Descripción para Twitter (fallback: og_description)
- **twitter_image**: Imagen para Twitter (fallback: og_image)

## Fuente de datos

Los datos SEO se obtienen de la tabla `apr_postmeta` usando las siguientes meta_keys de RankMath:

- `rank_math_title` → seo.title
- `rank_math_description` → seo.description
- `rank_math_canonical_url` → seo.canonical
- `rank_math_focus_keyword` → seo.focus_keyword
- `rank_math_seo_score` → seo.seo_score
- `rank_math_facebook_title` → seo.og_title
- `rank_math_facebook_description` → seo.og_description
- `rank_math_facebook_image` → seo.og_image
- `rank_math_twitter_title` → seo.twitter_title
- `rank_math_twitter_description` → seo.twitter_description
- `rank_math_twitter_image` → seo.twitter_image

## Ejemplo de respuesta completa

```json
{
  "id": 27033,
  "url": "https://stagingaprende.guatemala.com/centros-educativos/universidades/universidad-popular-guatemala",
  "title": "Universidad Popular de Guatemala",
  "excerpt": "Conoce todos las carreras y servicios que ofrece la Universidad Popular de Guatemala, así como...",
  "date": "2017-10-04T09:22:21",
  "images": [...],
  "location_geopoint": {...},
  "content": "...",
  "categories": [...],
  "author": {...},
  "keywords": [...],
  "is_sponsored": 0,
  "sponsor_name": "",
  "sponsor_image_url": "",
  "sponsor_image": [],
  "sponsor_image_sidebar_url": "",
  "sponsor_image_sidebar": [],
  "sponsor_image_content_url": "",
  "sponsor_image_content": [],
  "sponsor_extra_data": "",
  "seo": {
    "title": "Universidad Popular de Guatemala - Carreras y Servicios",
    "description": "Descubre todas las carreras universitarias y servicios que ofrece la Universidad Popular de Guatemala. Información completa sobre programas académicos y admisiones.",
    "canonical": "https://stagingaprende.guatemala.com/centros-educativos/universidades/universidad-popular-guatemala",
    "focus_keyword": "universidad popular guatemala",
    "seo_score": 92,
    "og_title": "Universidad Popular de Guatemala - Guía Completa",
    "og_description": "Todo lo que necesitas saber sobre la Universidad Popular de Guatemala: carreras, servicios, admisiones y más.",
    "og_image": "https://stagingaprende.guatemala.com/images/universidad-popular-guatemala-og.jpg",
    "twitter_title": "Universidad Popular de Guatemala - Guía Completa",
    "twitter_description": "Todo lo que necesitas saber sobre la Universidad Popular de Guatemala: carreras, servicios, admisiones y más.",
    "twitter_image": "https://stagingaprende.guatemala.com/images/universidad-popular-guatemala-twitter.jpg"
  }
}
```

## Beneficios

1. **SEO mejorado**: Títulos y descripciones optimizadas para buscadores
2. **Redes sociales**: Contenido optimizado para compartir en Facebook y Twitter
3. **Canonical URLs**: Evita contenido duplicado
4. **Monitoreo**: Puntuación SEO para evaluar optimización
5. **Palabras clave**: Tracking de palabras clave principales 