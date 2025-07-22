/**
 * Learn Post Types
 *
 * Type definitions and interfaces for learn post entities.
 */

export interface LearnPostImage {
  original: string;
  thumbnail: string;
  medium: string;
  web_gallery: string;
  app_medium: string;
  events_calendar_thumb: string;
  events_square_100: string;
  events_related: string;
  events_xl: string;
  image_meta: {
    title: string;
    caption: string;
  };
}

export interface LearnPostLocationGeopoint {
  latitude: string;
  longitude: string;
}

export interface LearnPostCategory {
  category_id: number;
  category_name: string;
  category_slug: string;
}

export interface LearnPostAuthor {
  name: string;
  id: number;
}

export interface LearnPostSponsor {
  name: string;
  image_url: string;
  image: any[];
  image_sidebar_url: string;
  image_sidebar: any[];
  image_content_url: string;
  image_content: any[];
  extra_data: string;
}

export interface LearnPostSeo {
  title: string;
  description: string;
  canonical: string;
  focus_keyword: string;
  seo_score: number;
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image: string;
}
