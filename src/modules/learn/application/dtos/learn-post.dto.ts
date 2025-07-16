/**
 * Learn Post Response DTO
 *
 * Data Transfer Object for Learn Post responses.
 * This DTO defines the structure of the API response for learn posts.
 */

export class LearnPostImageDto {
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

export class LearnPostLocationGeopointDto {
  latitude: string;
  longitude: string;
}

export class LearnPostCategoryDto {
  category_id: number;
  category_name: string;
  category_slug: string;
}

export class LearnPostAuthorDto {
  name: string;
  id: number;
}

export class LearnPostResponseDto {
  id: number;
  url: string;
  title: string;
  excerpt: string;
  date: string;
  images: LearnPostImageDto[];
  location_geopoint: LearnPostLocationGeopointDto | null;
  content: string;
  categories: LearnPostCategoryDto[];
  author: LearnPostAuthorDto;
  keywords: string[];
  is_sponsored: number;
  sponsor_name: string;
  sponsor_image_url: string;
  sponsor_image: any[];
  sponsor_image_sidebar_url: string;
  sponsor_image_sidebar: any[];
  sponsor_image_content_url: string;
  sponsor_image_content: any[];
  sponsor_extra_data: string;
}

 