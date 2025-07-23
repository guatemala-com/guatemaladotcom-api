import { Test, TestingModule } from '@nestjs/testing';
import { LearnPostBuilderService } from '../learn-post-builder.service';
import { META_KEYS } from '../../consts/meta-keys.const';
import { PostMeta } from '../../../domain/types/prisma-types';

// Import mock data from __mocks__ folder
import {
  mockFlatCategoryList,
  mockMultipleRootCategories,
  mockOrphanedCategories,
  mockEmptyCategories,
} from './__mocks__/category.mocks';
import {
  mockAttachmentWithMetas,
  mockAttachmentWithoutMetas,
  mockCategoryTermRelationships,
  mockTagOnlyTermRelationships,
  mockLocationMetas,
  mockEmptyLocationMetas,
  mockCompleteSeoMetas,
  mockPartialSeoMetas,
  mockInvalidSeoMetas,
  mockSponsoredLearnMeta,
  mockPartialSponsorLearnMeta,
} from './__mocks__/test-data.mocks';

describe('LearnPostBuilderService', () => {
  let service: LearnPostBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LearnPostBuilderService],
    }).compile();

    service = module.get<LearnPostBuilderService>(LearnPostBuilderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildHierarchy', () => {
    it('should build hierarchy from flat category list', () => {
      const hierarchy = service.buildHierarchy(mockFlatCategoryList);

      expect(hierarchy).toHaveLength(1);
      expect(hierarchy[0].name).toBe('Technology');
      expect(hierarchy[0].children).toHaveLength(2);

      const programming = hierarchy[0].children.find(
        (c) => c.name === 'Programming',
      );
      expect(programming).toBeDefined();
      expect(programming!.children).toHaveLength(1);
      expect(programming!.children[0].name).toBe('JavaScript');

      const design = hierarchy[0].children.find((c) => c.name === 'Design');
      expect(design).toBeDefined();
      expect(design!.children).toHaveLength(0);
    });

    it('should handle multiple root categories', () => {
      const hierarchy = service.buildHierarchy(mockMultipleRootCategories);

      expect(hierarchy).toHaveLength(2);
      expect(hierarchy.map((c) => c.name)).toContain('Technology');
      expect(hierarchy.map((c) => c.name)).toContain('Travel');

      const tech = hierarchy.find((c) => c.name === 'Technology');
      expect(tech!.children).toHaveLength(1);
      expect(tech!.children[0].name).toBe('Programming');

      const travel = hierarchy.find((c) => c.name === 'Travel');
      expect(travel!.children).toHaveLength(0);
    });

    it('should handle empty category list', () => {
      const hierarchy = service.buildHierarchy(mockEmptyCategories);
      expect(hierarchy).toHaveLength(0);
    });

    it('should handle categories with orphaned children', () => {
      const hierarchy = service.buildHierarchy(mockOrphanedCategories);

      expect(hierarchy).toHaveLength(1);
      expect(hierarchy[0].name).toBe('Technology');
      expect(hierarchy[0].children).toHaveLength(0);
    });
  });

  describe('buildImages', () => {
    it('should build images from attachment', () => {
      const images = service.buildImages(mockAttachmentWithMetas);

      expect(images).toHaveLength(1);
      expect(images[0]).toEqual({
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
          title: 'Alt text for image',
          caption: 'Caption for image',
        },
      });
    });

    it('should handle attachment without meta data', () => {
      const images = service.buildImages(mockAttachmentWithoutMetas);

      expect(images).toHaveLength(1);
      expect(images[0].image_meta).toEqual({
        title: 'Test Image',
        caption: 'Test image excerpt',
      });
    });

    it('should return empty array when attachment is null', () => {
      const images = service.buildImages(null);
      expect(images).toEqual([]);
    });
  });

  describe('buildCategories', () => {
    it('should build categories from term relationships', () => {
      const categories = service.buildCategories(mockCategoryTermRelationships);

      expect(categories).toHaveLength(2);
      expect(categories[0]).toEqual({
        category_id: 1,
        category_name: 'Technology',
        category_slug: 'technology',
      });
      expect(categories[1]).toEqual({
        category_id: 2,
        category_name: 'Programming',
        category_slug: 'programming',
      });
    });

    it('should return empty array when no category relationships exist', () => {
      const categories = service.buildCategories(mockTagOnlyTermRelationships);
      expect(categories).toEqual([]);
    });

    it('should handle empty term relationships', () => {
      const categories = service.buildCategories([]);
      expect(categories).toEqual([]);
    });
  });

  describe('buildAuthor', () => {
    it('should build author from author ID with default name when no learn meta', () => {
      const author = service.buildAuthor(BigInt(123));

      expect(author).toEqual({
        name: 'Guest Author',
        id: 123,
      });
    });

    it('should build author from learn meta when available', () => {
      const learnMeta = mockSponsoredLearnMeta;
      learnMeta.authorName = 'John Doe';
      const author = service.buildAuthor(BigInt(123), learnMeta);

      expect(author).toEqual({
        name: 'John Doe',
        id: 123,
      });
    });

    it('should use default name when learn meta has no author name', () => {
      const learnMeta = { ...mockSponsoredLearnMeta, authorName: null };
      const author = service.buildAuthor(BigInt(123), learnMeta);

      expect(author).toEqual({
        name: 'Guest Author',
        id: 123,
      });
    });

    it('should handle large author ID', () => {
      const author = service.buildAuthor(BigInt(999999));

      expect(author).toEqual({
        name: 'Guest Author',
        id: 999999,
      });
    });
  });

  describe('buildSponsor', () => {
    it('should build sponsor from learn meta', () => {
      const sponsor = service.buildSponsor(mockSponsoredLearnMeta);

      expect(sponsor).toEqual({
        name: 'Test Sponsor',
        image_url: 'https://sponsor.com/image.jpg',
        image: [],
        image_sidebar_url: 'https://sponsor.com/sidebar.jpg',
        image_sidebar: [],
        image_content_url: 'https://sponsor.com/content.jpg',
        image_content: [],
        extra_data: 'Extra sponsor data',
      });
    });

    it('should handle partial sponsor data', () => {
      const sponsor = service.buildSponsor(mockPartialSponsorLearnMeta);

      expect(sponsor).toEqual({
        name: 'Test Sponsor',
        image_url: '',
        image: [],
        image_sidebar_url: '',
        image_sidebar: [],
        image_content_url: '',
        image_content: [],
        extra_data: '',
      });
    });

    it('should return empty sponsor when learnMeta is null', () => {
      const sponsor = service.buildSponsor(null);

      expect(sponsor).toEqual({
        name: '',
        image_url: '',
        image: [],
        image_sidebar_url: '',
        image_sidebar: [],
        image_content_url: '',
        image_content: [],
        extra_data: '',
      });
    });
  });

  describe('buildLocationGeopoint', () => {
    it('should build geopoint from meta data', () => {
      const geopoint = service.buildLocationGeopoint(mockLocationMetas);

      expect(geopoint).toEqual({
        latitude: '14.6349',
        longitude: '-90.5069',
      });
    });

    it('should return null when latitude is missing', () => {
      const metas: PostMeta[] = [
        {
          metaId: BigInt(1),
          postId: BigInt(1),
          metaKey: META_KEYS.LONGITUDE,
          metaValue: '-90.5069',
        },
      ];

      const geopoint = service.buildLocationGeopoint(metas);
      expect(geopoint).toBeNull();
    });

    it('should return null when longitude is missing', () => {
      const metas: PostMeta[] = [
        {
          metaId: BigInt(1),
          postId: BigInt(1),
          metaKey: META_KEYS.LATITUDE,
          metaValue: '14.6349',
        },
      ];

      const geopoint = service.buildLocationGeopoint(metas);
      expect(geopoint).toBeNull();
    });

    it('should return null when both coordinates are missing', () => {
      const metas: PostMeta[] = [];

      const geopoint = service.buildLocationGeopoint(metas);
      expect(geopoint).toBeNull();
    });

    it('should return null when coordinates have empty values', () => {
      const geopoint = service.buildLocationGeopoint(mockEmptyLocationMetas);
      expect(geopoint).toBeNull();
    });
  });

  describe('buildSeo', () => {
    it('should build complete SEO data from meta', () => {
      const seo = service.buildSeo(
        mockCompleteSeoMetas,
        'Post Title',
        'Post Excerpt',
      );

      expect(seo).toEqual({
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
      });
    });

    it('should fall back to post data when SEO meta is missing', () => {
      const metas: PostMeta[] = [];

      const seo = service.buildSeo(metas, 'Post Title', 'Post Excerpt');

      expect(seo).toEqual({
        title: 'Post Title',
        description: 'Post Excerpt',
        canonical: '',
        focus_keyword: '',
        seo_score: 0,
        og_title: 'Post Title',
        og_description: 'Post Excerpt',
        og_image: '',
        twitter_title: 'Post Title',
        twitter_description: 'Post Excerpt',
        twitter_image: '',
      });
    });

    it('should handle partial SEO data with fallbacks', () => {
      const seo = service.buildSeo(
        mockPartialSeoMetas,
        'Post Title',
        'Post Excerpt',
      );

      expect(seo).toEqual({
        title: 'Custom SEO Title',
        description: 'Post Excerpt',
        canonical: '',
        focus_keyword: '',
        seo_score: 75,
        og_title: 'Custom OG Title',
        og_description: 'Post Excerpt',
        og_image: '',
        twitter_title: 'Custom OG Title',
        twitter_description: 'Post Excerpt',
        twitter_image: '',
      });
    });

    it('should handle invalid SEO score', () => {
      const seo = service.buildSeo(
        mockInvalidSeoMetas,
        'Post Title',
        'Post Excerpt',
      );

      expect(seo.seo_score).toBe(0);
    });
  });
});
