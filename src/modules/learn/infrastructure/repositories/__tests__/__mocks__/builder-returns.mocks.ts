import {
  LearnPostImage,
  LearnPostCategory,
  LearnPostAuthor,
  LearnPostSponsor,
  LearnPostSeo,
  LearnPostLocationGeopoint,
} from '../../../../domain/types/learn-post.types';

/**
 * Mock return values for LearnPostBuilderService methods
 */
export const mockBuilderReturns = {
  images: [
    {
      original: 'https://example.com/image.jpg',
      thumbnail: 'https://example.com/image.jpg',
      medium: 'https://example.com/image.jpg',
      web_gallery: 'https://example.com/image.jpg',
      app_medium: 'https://example.com/image.jpg',
      events_calendar_thumb: 'https://example.com/image.jpg',
      events_square_100: 'https://example.com/image.jpg',
      events_related: 'https://example.com/image.jpg',
      events_xl: 'https://example.com/image.jpg',
      image_meta: {
        title: 'Test Image',
        caption: 'Test image excerpt',
      },
    },
  ] as LearnPostImage[],

  categories: [
    {
      category_id: 1,
      category_name: 'Technology',
      category_slug: 'technology',
    },
  ] as LearnPostCategory[],

  author: {
    name: 'Ivon Kwei',
    id: 1,
  } as LearnPostAuthor,

  sponsor: {
    name: 'Test Sponsor',
    image_url: 'https://sponsor.com/image.jpg',
    image: [],
    image_sidebar_url: '',
    image_sidebar: [],
    image_content_url: '',
    image_content: [],
    extra_data: '',
  } as LearnPostSponsor,

  geopoint: {
    latitude: '14.6349',
    longitude: '-90.5069',
  } as LearnPostLocationGeopoint,

  seo: {
    title: 'Test Post',
    description: 'Test excerpt',
    canonical: '',
    focus_keyword: '',
    seo_score: 0,
    og_title: 'Test Post',
    og_description: 'Test excerpt',
    og_image: '',
    twitter_title: 'Test Post',
    twitter_description: 'Test excerpt',
    twitter_image: '',
  } as LearnPostSeo,
};
