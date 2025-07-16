// Centralized mocks for Learn module use cases
import { CategoryResponseDto } from '../application/dtos/category.dto';
import { LearnPostResponseDto } from '../application/dtos/learn-post.dto';

export const mockCategories: CategoryResponseDto[] = [
  {
    id: 1,
    name: 'Category 1',
    slug: 'category-1',
    description: 'Description 1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Category 2',
    slug: 'category-2',
    description: 'Description 2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
};
