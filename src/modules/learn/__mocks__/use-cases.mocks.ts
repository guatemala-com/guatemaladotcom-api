// Centralized mocks for Learn module use cases
import { CategoryResponseDto } from '../application/dtos/category.dto';
import { LearnPostResponseDto } from '../application/dtos/learn-post.dto';

export const mockCategories: CategoryResponseDto[] = [
  {
    id: 1,
    name: 'Technology',
    slug: 'technology',
    description: 'Technology related articles',
    parent: 0,
    count: 15,
    children: [
      {
        id: 2,
        name: 'Programming',
        slug: 'programming',
        description: 'Programming tutorials and guides',
        parent: 1,
        count: 8,
        children: [],
      },
    ],
  },
];

export const mockLearnPost: LearnPostResponseDto = {
  id: 1,
  url: 'https://stagingaprende.guatemala.com/test-post',
  title: 'Test Post',
  excerpt: 'This is a test excerpt',
  date: '2018-03-08T12:25:00.000Z',
  images: [],
  location_geopoint: null,
  content: 'This is test content',
  categories: [],
  author: {
    name: 'Test Author',
    id: 1,
  },
  keywords: [],
  is_sponsored: 0,
  sponsor_name: '',
  sponsor_image_url: '',
  sponsor_image: [],
  sponsor_image_sidebar_url: '',
  sponsor_image_sidebar: [],
  sponsor_image_content_url: '',
  sponsor_image_content: [],
  sponsor_extra_data: '',
  seo: {
    title: 'Test Post - SEO Title',
    description: 'This is a test SEO description',
    canonical: 'https://stagingaprende.guatemala.com/test-post',
    focus_keyword: 'test',
    seo_score: 85,
    og_title: 'Test Post - Open Graph Title',
    og_description: 'This is a test Open Graph description',
    og_image: 'https://stagingaprende.guatemala.com/og-image.jpg',
    twitter_title: 'Test Post - Twitter Title',
    twitter_description: 'This is a test Twitter description',
    twitter_image: 'https://stagingaprende.guatemala.com/twitter-image.jpg',
  },
  audionote_url: 'https://audionotas.guatemala.com/aprende/1.mp3',
};
