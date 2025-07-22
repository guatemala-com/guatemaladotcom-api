import { LearnPost } from '../learn-post.entity';
import {
  LearnPostImage,
  LearnPostLocationGeopoint,
  LearnPostCategory,
  LearnPostAuthor,
  LearnPostSponsor,
  LearnPostSeo,
} from '../../types/learn-post.types';

describe('LearnPost', () => {
  const mockImage: LearnPostImage = {
    original: 'https://example.com/original.jpg',
    thumbnail: 'https://example.com/thumbnail.jpg',
    medium: 'https://example.com/medium.jpg',
    web_gallery: 'https://example.com/web_gallery.jpg',
    app_medium: 'https://example.com/app_medium.jpg',
    events_calendar_thumb: 'https://example.com/events_calendar_thumb.jpg',
    events_square_100: 'https://example.com/events_square_100.jpg',
    events_related: 'https://example.com/events_related.jpg',
    events_xl: 'https://example.com/events_xl.jpg',
    image_meta: {
      title: 'Test Image',
      caption: 'Test image caption',
    },
  };

  const mockGeopoint: LearnPostLocationGeopoint = {
    latitude: '14.6349',
    longitude: '-90.5069',
  };

  const mockCategory: LearnPostCategory = {
    category_id: 1,
    category_name: 'Technology',
    category_slug: 'technology',
  };

  const mockAuthor: LearnPostAuthor = {
    name: 'John Doe',
    id: 123,
  };

  const mockSponsor: LearnPostSponsor = {
    name: 'Test Sponsor',
    image_url: 'https://example.com/sponsor.jpg',
    image: [],
    image_sidebar_url: 'https://example.com/sponsor-sidebar.jpg',
    image_sidebar: [],
    image_content_url: 'https://example.com/sponsor-content.jpg',
    image_content: [],
    extra_data: 'Extra sponsor data',
  };

  const mockSeo: LearnPostSeo = {
    title: 'SEO Title',
    description: 'SEO Description',
    canonical: 'https://example.com/canonical',
    focus_keyword: 'test keyword',
    seo_score: 85,
    og_title: 'OG Title',
    og_description: 'OG Description',
    og_image: 'https://example.com/og-image.jpg',
    twitter_title: 'Twitter Title',
    twitter_description: 'Twitter Description',
    twitter_image: 'https://example.com/twitter-image.jpg',
  };

  describe('constructor', () => {
    it('should create an instance with all properties', () => {
      const post = new LearnPost(
        1,
        'https://example.com/test-post',
        'Test Post Title',
        'This is a test excerpt',
        '2025-07-22',
        [mockImage],
        mockGeopoint,
        '<p>This is the content</p>',
        [mockCategory],
        mockAuthor,
        ['keyword1', 'keyword2'],
        1,
        mockSponsor,
        mockSeo,
      );

      expect(post.id).toBe(1);
      expect(post.url).toBe('https://example.com/test-post');
      expect(post.title).toBe('Test Post Title');
      expect(post.excerpt).toBe('This is a test excerpt');
      expect(post.date).toBe('2025-07-22');
      expect(post.images).toEqual([mockImage]);
      expect(post.locationGeopoint).toEqual(mockGeopoint);
      expect(post.content).toBe('<p>This is the content</p>');
      expect(post.categories).toEqual([mockCategory]);
      expect(post.author).toEqual(mockAuthor);
      expect(post.keywords).toEqual(['keyword1', 'keyword2']);
      expect(post.isSponsored).toBe(1);
      expect(post.sponsor).toEqual(mockSponsor);
      expect(post.seo).toEqual(mockSeo);
    });

    it('should handle null locationGeopoint', () => {
      const post = new LearnPost(
        1,
        'https://example.com/test-post',
        'Test Post Title',
        'This is a test excerpt',
        '2025-07-22',
        [],
        null,
        '<p>This is the content</p>',
        [],
        mockAuthor,
        [],
        0,
        mockSponsor,
        mockSeo,
      );

      expect(post.locationGeopoint).toBeNull();
    });

    it('should handle empty arrays for optional collections', () => {
      const post = new LearnPost(
        1,
        'https://example.com/test-post',
        'Test Post Title',
        'This is a test excerpt',
        '2025-07-22',
        [],
        null,
        '<p>This is the content</p>',
        [],
        mockAuthor,
        [],
        0,
        mockSponsor,
        mockSeo,
      );

      expect(post.images).toEqual([]);
      expect(post.categories).toEqual([]);
      expect(post.keywords).toEqual([]);
    });
  });

  describe('toResponse', () => {
    it('should return correct response object with all properties', () => {
      const post = new LearnPost(
        1,
        'https://example.com/test-post',
        'Test Post Title',
        'This is a test excerpt',
        '2025-07-22',
        [mockImage],
        mockGeopoint,
        '<p>This is the content</p>',
        [mockCategory],
        mockAuthor,
        ['keyword1', 'keyword2'],
        1,
        mockSponsor,
        mockSeo,
      );

      const response = post.toResponse();

      expect(response).toEqual({
        id: 1,
        url: 'https://example.com/test-post',
        title: 'Test Post Title',
        excerpt: 'This is a test excerpt',
        date: '2025-07-22',
        images: [mockImage],
        location_geopoint: mockGeopoint,
        content: '<p>This is the content</p>',
        categories: [mockCategory],
        author: mockAuthor,
        keywords: ['keyword1', 'keyword2'],
        is_sponsored: 1,
        sponsor_name: 'Test Sponsor',
        sponsor_image_url: 'https://example.com/sponsor.jpg',
        sponsor_image: [],
        sponsor_image_sidebar_url: 'https://example.com/sponsor-sidebar.jpg',
        sponsor_image_sidebar: [],
        sponsor_image_content_url: 'https://example.com/sponsor-content.jpg',
        sponsor_image_content: [],
        sponsor_extra_data: 'Extra sponsor data',
        seo: mockSeo,
      });
    });

    it('should handle null location_geopoint in response', () => {
      const post = new LearnPost(
        1,
        'https://example.com/test-post',
        'Test Post Title',
        'This is a test excerpt',
        '2025-07-22',
        [],
        null,
        '<p>This is the content</p>',
        [],
        mockAuthor,
        [],
        0,
        mockSponsor,
        mockSeo,
      );

      const response = post.toResponse();

      expect(response.location_geopoint).toBeNull();
      expect(response.is_sponsored).toBe(0);
    });

    it('should correctly map sponsor properties', () => {
      const customSponsor: LearnPostSponsor = {
        name: 'Custom Sponsor',
        image_url: 'custom-image.jpg',
        image: ['image1.jpg', 'image2.jpg'],
        image_sidebar_url: 'custom-sidebar.jpg',
        image_sidebar: ['sidebar1.jpg'],
        image_content_url: 'custom-content.jpg',
        image_content: ['content1.jpg', 'content2.jpg'],
        extra_data: 'Custom extra data',
      };

      const post = new LearnPost(
        1,
        'https://example.com/test-post',
        'Test Post Title',
        'This is a test excerpt',
        '2025-07-22',
        [],
        null,
        '<p>This is the content</p>',
        [],
        mockAuthor,
        [],
        1,
        customSponsor,
        mockSeo,
      );

      const response = post.toResponse();

      expect(response.sponsor_name).toBe('Custom Sponsor');
      expect(response.sponsor_image_url).toBe('custom-image.jpg');
      expect(response.sponsor_image).toEqual(['image1.jpg', 'image2.jpg']);
      expect(response.sponsor_image_sidebar_url).toBe('custom-sidebar.jpg');
      expect(response.sponsor_image_sidebar).toEqual(['sidebar1.jpg']);
      expect(response.sponsor_image_content_url).toBe('custom-content.jpg');
      expect(response.sponsor_image_content).toEqual([
        'content1.jpg',
        'content2.jpg',
      ]);
      expect(response.sponsor_extra_data).toBe('Custom extra data');
    });
  });

  describe('fromDatabase', () => {
    it('should create LearnPost from database data', () => {
      const data = {
        id: 1,
        url: 'https://example.com/test-post',
        title: 'Test Post Title',
        excerpt: 'This is a test excerpt',
        date: '2025-07-22',
        images: [mockImage],
        locationGeopoint: mockGeopoint,
        content: '<p>This is the content</p>',
        categories: [mockCategory],
        author: mockAuthor,
        keywords: ['keyword1', 'keyword2'],
        isSponsored: 1,
        sponsor: mockSponsor,
        seo: mockSeo,
      };

      const post = LearnPost.fromDatabase(data);

      expect(post.id).toBe(1);
      expect(post.url).toBe('https://example.com/test-post');
      expect(post.title).toBe('Test Post Title');
      expect(post.excerpt).toBe('This is a test excerpt');
      expect(post.date).toBe('2025-07-22');
      expect(post.images).toEqual([mockImage]);
      expect(post.locationGeopoint).toEqual(mockGeopoint);
      expect(post.content).toBe('<p>This is the content</p>');
      expect(post.categories).toEqual([mockCategory]);
      expect(post.author).toEqual(mockAuthor);
      expect(post.keywords).toEqual(['keyword1', 'keyword2']);
      expect(post.isSponsored).toBe(1);
      expect(post.sponsor).toEqual(mockSponsor);
      expect(post.seo).toEqual(mockSeo);
    });

    it('should handle null locationGeopoint from database', () => {
      const data = {
        id: 1,
        url: 'https://example.com/test-post',
        title: 'Test Post Title',
        excerpt: 'This is a test excerpt',
        date: '2025-07-22',
        images: [],
        locationGeopoint: null,
        content: '<p>This is the content</p>',
        categories: [],
        author: mockAuthor,
        keywords: [],
        isSponsored: 0,
        sponsor: mockSponsor,
        seo: mockSeo,
      };

      const post = LearnPost.fromDatabase(data);

      expect(post.locationGeopoint).toBeNull();
      expect(post.isSponsored).toBe(0);
    });

    it('should handle empty arrays from database', () => {
      const data = {
        id: 1,
        url: 'https://example.com/test-post',
        title: 'Test Post Title',
        excerpt: 'This is a test excerpt',
        date: '2025-07-22',
        images: [],
        locationGeopoint: null,
        content: '<p>This is the content</p>',
        categories: [],
        author: mockAuthor,
        keywords: [],
        isSponsored: 0,
        sponsor: mockSponsor,
        seo: mockSeo,
      };

      const post = LearnPost.fromDatabase(data);

      expect(post.images).toEqual([]);
      expect(post.categories).toEqual([]);
      expect(post.keywords).toEqual([]);
    });
  });

  describe('integration scenarios', () => {
    it('should work correctly with multiple images and categories', () => {
      const multipleImages: LearnPostImage[] = [
        mockImage,
        {
          ...mockImage,
          original: 'https://example.com/original2.jpg',
          image_meta: {
            title: 'Second Image',
            caption: 'Second image caption',
          },
        },
      ];

      const multipleCategories: LearnPostCategory[] = [
        mockCategory,
        {
          category_id: 2,
          category_name: 'Programming',
          category_slug: 'programming',
        },
      ];

      const post = new LearnPost(
        1,
        'https://example.com/test-post',
        'Test Post Title',
        'This is a test excerpt',
        '2025-07-22',
        multipleImages,
        mockGeopoint,
        '<p>This is the content</p>',
        multipleCategories,
        mockAuthor,
        ['keyword1', 'keyword2', 'keyword3'],
        1,
        mockSponsor,
        mockSeo,
      );

      expect(post.images).toHaveLength(2);
      expect(post.categories).toHaveLength(2);
      expect(post.keywords).toHaveLength(3);

      const response = post.toResponse();
      expect(response.images).toHaveLength(2);
      expect(response.categories).toHaveLength(2);
      expect(response.keywords).toHaveLength(3);
    });

    it('should handle complete SEO data correctly', () => {
      const completeSeo: LearnPostSeo = {
        title: 'Complete SEO Title',
        description: 'Complete SEO Description with more details',
        canonical: 'https://guatemala.com/learn/complete-post',
        focus_keyword: 'guatemala tourism',
        seo_score: 95,
        og_title: 'Complete OG Title',
        og_description: 'Complete OG Description',
        og_image: 'https://example.com/complete-og-image.jpg',
        twitter_title: 'Complete Twitter Title',
        twitter_description: 'Complete Twitter Description',
        twitter_image: 'https://example.com/complete-twitter-image.jpg',
      };

      const post = new LearnPost(
        1,
        'https://guatemala.com/learn/complete-post',
        'Complete Post Title',
        'This is a complete excerpt',
        '2025-07-22',
        [mockImage],
        mockGeopoint,
        '<p>This is complete content</p>',
        [mockCategory],
        mockAuthor,
        ['guatemala', 'tourism', 'travel'],
        1,
        mockSponsor,
        completeSeo,
      );

      const response = post.toResponse();

      expect(response.seo.title).toBe('Complete SEO Title');
      expect(response.seo.seo_score).toBe(95);
      expect(response.seo.focus_keyword).toBe('guatemala tourism');
      expect(response.seo.canonical).toBe(
        'https://guatemala.com/learn/complete-post',
      );
    });

    it('should correctly handle non-sponsored posts', () => {
      const post = new LearnPost(
        1,
        'https://example.com/non-sponsored-post',
        'Non-Sponsored Post',
        'This post is not sponsored',
        '2025-07-22',
        [],
        null,
        '<p>Regular content</p>',
        [],
        mockAuthor,
        [],
        0,
        mockSponsor,
        mockSeo,
      );

      const response = post.toResponse();

      expect(response.is_sponsored).toBe(0);
      // Even non-sponsored posts should have sponsor data structure
      expect(response.sponsor_name).toBe('Test Sponsor');
    });
  });
});
