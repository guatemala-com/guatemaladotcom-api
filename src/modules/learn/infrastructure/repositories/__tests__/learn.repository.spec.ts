import { Test, TestingModule } from '@nestjs/testing';
import { LearnRepositoryImpl } from '../learn.repository';
import { PrismaService } from '../../../../prisma/infrastructure/prisma.service';
import { LearnCategory } from '../../../domain/entities/category.entity';
import { LearnPostBuilderService } from '../../services/learn-post-builder.service';
import { ConfigService } from '@nestjs/config';
import { LearnPost } from '../../../domain/entities/learn-post.entity';
import {
  CategoryWithTerm,
  AttachmentPost,
  TermRelationship,
  LearnMeta,
  PostMeta,
} from '../../../domain/types/prisma-types';
import {
  LearnPostImage,
  LearnPostCategory,
  LearnPostAuthor,
  LearnPostSponsor,
  LearnPostSeo,
  LearnPostLocationGeopoint,
} from '../../../domain/types/learn-post.types';

// Import mock factories from __mocks__ folder
import {
  createMockCategoryWithTerm,
  createMockPostMeta,
  createMockTermRelationship,
  createMockPost,
  createMockLearnMeta,
  createMockAttachment,
} from './__mocks__/prisma-data.mocks';
import {
  mockPrismaService,
  mockLearnPostBuilderService,
  mockConfigService,
} from './__mocks__/services.mocks';

describe('LearnRepositoryImpl', () => {
  let repository: LearnRepositoryImpl;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearnRepositoryImpl,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: LearnPostBuilderService,
          useValue: mockLearnPostBuilderService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    repository = module.get<LearnRepositoryImpl>(LearnRepositoryImpl);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getCategories', () => {
    it('should return an array of learn categories with hierarchy', async () => {
      const mockCategories: CategoryWithTerm[] = [
        createMockCategoryWithTerm(
          1,
          'Technology',
          'technology',
          'Technology related articles',
          0,
          15,
        ),
        createMockCategoryWithTerm(
          2,
          'Programming',
          'programming',
          'Programming tutorials and guides',
          1,
          8,
        ),
      ];

      mockPrismaService.aprTermTaxonomy.findMany.mockResolvedValue(
        mockCategories,
      );

      const categories = await repository.getCategories();

      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBe(1); // Should have 1 root category
      expect(categories[0]).toBeInstanceOf(LearnCategory);
      expect(categories[0].name).toBe('Technology');
      expect(categories[0].children.length).toBe(1);
      expect(categories[0].children[0].name).toBe('Programming');
    });

    it('should correctly build multi-level hierarchy with all children', async () => {
      const mockCategories: CategoryWithTerm[] = [
        createMockCategoryWithTerm(
          1,
          'Technology',
          'technology',
          'Technology articles',
          0,
          20,
        ),
        createMockCategoryWithTerm(
          2,
          'Programming',
          'programming',
          'Programming tutorials',
          1,
          10,
        ),
        createMockCategoryWithTerm(
          3,
          'JavaScript',
          'javascript',
          'JavaScript tutorials',
          2,
          5,
        ),
        createMockCategoryWithTerm(
          4,
          'Design',
          'design',
          'Design articles',
          1,
          8,
        ),
      ];

      mockPrismaService.aprTermTaxonomy.findMany.mockResolvedValue(
        mockCategories,
      );

      const categories = await repository.getCategories();

      // Should have 1 root category
      expect(categories.length).toBe(1);

      const techCategory = categories[0];
      expect(techCategory.name).toBe('Technology');
      expect(techCategory.children.length).toBe(2); // Programming and Design

      // Find Programming category
      const programmingCategory = techCategory.children.find(
        (child) => child.name === 'Programming',
      );
      expect(programmingCategory).toBeDefined();
      expect(programmingCategory!.children.length).toBe(1); // JavaScript
      expect(programmingCategory!.children[0].name).toBe('JavaScript');

      // Find Design category
      const designCategory = techCategory.children.find(
        (child) => child.name === 'Design',
      );
      expect(designCategory).toBeDefined();
      expect(designCategory!.children.length).toBe(0); // No children
    });

    it('should handle empty categories list', async () => {
      mockPrismaService.aprTermTaxonomy.findMany.mockResolvedValue([]);

      const categories = await repository.getCategories();

      expect(categories).toEqual([]);
    });
  });

  describe('getCategoryById', () => {
    it('should return a learn category if found', async () => {
      const mockCategory: CategoryWithTerm = createMockCategoryWithTerm(
        1,
        'Technology',
        'technology',
        'Technology related articles',
        0,
        15,
      );

      mockPrismaService.aprTermTaxonomy.findFirst.mockResolvedValue(
        mockCategory,
      );

      // Mock Prisma findMany method for children lookup
      mockPrismaService.aprTermTaxonomy.findMany.mockResolvedValue([]);

      const id = 1;
      const category = await repository.getCategoryById(id);

      expect(category).toBeInstanceOf(LearnCategory);
      expect(category?.id).toBe(id);
      expect(category?.name).toBe('Technology');
      expect(category?.parent).toBe(0);
      expect(category?.count).toBe(15);
    });

    it('should return null if category is not found', async () => {
      mockPrismaService.aprTermTaxonomy.findFirst.mockResolvedValue(null);

      const id = 999;
      const category = await repository.getCategoryById(id);

      expect(category).toBeNull();
    });
  });

  describe('getLearnPostById', () => {
    const mockPostMetas: PostMeta[] = [
      createMockPostMeta(1, 123, '_thumbnail_id', '456'),
      createMockPostMeta(2, 123, 'latitude', '14.6349'),
      createMockPostMeta(3, 123, 'longitude', '-90.5069'),
    ];

    const mockTermRelationships: TermRelationship[] = [
      createMockTermRelationship(
        123,
        1,
        'category',
        1,
        'Technology',
        'technology',
      ),
    ];

    const mockPost = createMockPost(
      123,
      'Test Post',
      'test-post',
      'Test excerpt',
      '<p>Test content</p>',
      mockPostMetas,
      mockTermRelationships,
    );

    const mockLearnMeta: LearnMeta = createMockLearnMeta(
      123,
      true,
      'Test Sponsor',
      'https://sponsor.com/image.jpg',
    );

    const mockAttachment: AttachmentPost = createMockAttachment(
      456,
      'https://example.com/image.jpg',
      'Test Image',
      'Test image excerpt',
    );

    // Mock return values for builder service
    const mockBuilderReturns = {
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

    beforeEach(() => {
      // Setup mock implementations for builder service
      mockLearnPostBuilderService.buildImages.mockReturnValue(
        mockBuilderReturns.images,
      );
      mockLearnPostBuilderService.buildCategories.mockReturnValue(
        mockBuilderReturns.categories,
      );
      mockLearnPostBuilderService.buildAuthor.mockReturnValue(
        mockBuilderReturns.author,
      );
      mockLearnPostBuilderService.buildSponsor.mockReturnValue(
        mockBuilderReturns.sponsor,
      );
      mockLearnPostBuilderService.buildLocationGeopoint.mockReturnValue(
        mockBuilderReturns.geopoint,
      );
      mockLearnPostBuilderService.buildSeo.mockReturnValue(
        mockBuilderReturns.seo,
      );
    });

    it('should return a learn post when found', async () => {
      // Mock Prisma methods
      mockPrismaService.aprPosts.findUnique
        .mockResolvedValueOnce(mockPost) // First call for the main post
        .mockResolvedValueOnce(mockAttachment); // Second call for attachment

      mockPrismaService.aprLearnMeta.findUnique.mockResolvedValue(
        mockLearnMeta,
      );

      const post = await repository.getLearnPostById(123);

      expect(post).toBeDefined();
      expect(post!.id).toBe(123);
      expect(post!.title).toBe('Test Post');
      expect(post!.excerpt).toBe('Test excerpt');
      expect(post!.content).toBe('<p>Test content</p>');
      expect(post!.url).toBe('https://test.example.com/test-post');

      // Verify builder methods were called with correct arguments
      expect(mockLearnPostBuilderService.buildImages).toHaveBeenCalledWith(
        mockAttachment,
      );
      expect(mockLearnPostBuilderService.buildCategories).toHaveBeenCalledWith(
        mockPost.termRelationships,
      );
      expect(mockLearnPostBuilderService.buildAuthor).toHaveBeenCalledWith(
        BigInt(1),
      );
      expect(mockLearnPostBuilderService.buildSponsor).toHaveBeenCalledWith(
        mockLearnMeta,
      );
      expect(
        mockLearnPostBuilderService.buildLocationGeopoint,
      ).toHaveBeenCalledWith(mockPost.metas);
      expect(mockLearnPostBuilderService.buildSeo).toHaveBeenCalledWith(
        mockPost.metas,
        'Test Post',
        'Test excerpt',
      );
    });

    it('should return null when post is not found', async () => {
      mockPrismaService.aprPosts.findUnique.mockResolvedValue(null);

      const post = await repository.getLearnPostById(999);

      expect(post).toBeNull();
    });

    it('should return null when post status is not published', async () => {
      const unpublishedPost = {
        ...mockPost,
        postStatus: 'draft',
      };

      mockPrismaService.aprPosts.findUnique.mockResolvedValue(unpublishedPost);

      const post = await repository.getLearnPostById(123);

      expect(post).toBeNull();
    });

    it('should handle post without thumbnail', async () => {
      const postWithoutThumbnail = createMockPost(
        123,
        'Test Post',
        'test-post',
        'Test excerpt',
        '<p>Test content</p>',
        mockPostMetas.filter((meta) => meta.metaKey !== '_thumbnail_id'),
        mockTermRelationships,
      );

      mockPrismaService.aprPosts.findUnique.mockResolvedValue(
        postWithoutThumbnail,
      );
      mockPrismaService.aprLearnMeta.findUnique.mockResolvedValue(null);
      mockLearnPostBuilderService.buildImages.mockReturnValue([]);

      const post = await repository.getLearnPostById(123);

      expect(post).toBeInstanceOf(LearnPost);
      expect(mockLearnPostBuilderService.buildImages).toHaveBeenCalledWith(
        null,
      );
    });

    it('should handle post without learn meta', async () => {
      mockPrismaService.aprPosts.findUnique
        .mockResolvedValueOnce(mockPost)
        .mockResolvedValueOnce(mockAttachment);
      mockPrismaService.aprLearnMeta.findUnique.mockResolvedValue(null);

      const post = await repository.getLearnPostById(123);

      expect(post).toBeInstanceOf(LearnPost);
      expect(mockLearnPostBuilderService.buildSponsor).toHaveBeenCalledWith(
        null,
      );
    });

    it('should handle post with invalid thumbnail ID', async () => {
      const postWithInvalidThumbnail = createMockPost(
        123,
        'Test Post',
        'test-post',
        'Test excerpt',
        '<p>Test content</p>',
        [createMockPostMeta(1, 123, '_thumbnail_id', '999999')], // Valid number but non-existent attachment
        mockTermRelationships,
      );

      mockPrismaService.aprPosts.findUnique
        .mockResolvedValueOnce(postWithInvalidThumbnail)
        .mockResolvedValueOnce(null); // Attachment not found

      mockPrismaService.aprLearnMeta.findUnique.mockResolvedValue(null);
      mockLearnPostBuilderService.buildImages.mockReturnValue([]);

      const post = await repository.getLearnPostById(123);

      expect(post).toBeInstanceOf(LearnPost);
      expect(mockLearnPostBuilderService.buildImages).toHaveBeenCalledWith(
        null,
      );
    });
  });

  describe('getCategoryBySlug', () => {
    it('should return a learn category when found by slug', async () => {
      // Arrange
      const mockCategoryData = createMockCategoryWithTerm(
        1, // id
        'Test Category', // name
        'test-category', // slug
        'Test Description', // description
        0, // parent
        5, // count
      );

      mockPrismaService.aprTermTaxonomy.findFirst
        .mockResolvedValueOnce(mockCategoryData) // getCategoryBySlug call
        .mockResolvedValue([]); // getCategoryChildren call

      // Act
      const category = await repository.getCategoryBySlug('test-category');

      // Assert
      expect(category).toBeInstanceOf(LearnCategory);
      expect(category?.name).toBe('Test Category');
      expect(category?.slug).toBe('test-category');
      expect(mockPrismaService.aprTermTaxonomy.findFirst).toHaveBeenCalledWith({
        where: {
          term: {
            slug: 'test-category',
          },
          taxonomy: 'category',
        },
        include: {
          term: true,
        },
      });
    });

    it('should return null when category is not found by slug', async () => {
      // Arrange
      mockPrismaService.aprTermTaxonomy.findFirst.mockResolvedValue(null);

      // Act
      const category = await repository.getCategoryBySlug('nonexistent-slug');

      // Assert
      expect(category).toBeNull();
    });
  });

  describe('getArticlesByCategory', () => {
    it('should return empty result when category is not found', async () => {
      // Arrange
      mockPrismaService.aprTermTaxonomy.findFirst.mockResolvedValue(null);

      // Act
      const result = await repository.getArticlesByCategory('nonexistent', {
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('getLearnPostBySlug', () => {
    it('should return null when category is not found', async () => {
      // Arrange
      mockPrismaService.aprTermTaxonomy.findFirst.mockResolvedValue(null);

      // Act
      const result = await repository.getLearnPostBySlug('nonexistent-category', 'some-post');

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when no posts match the slug in category', async () => {
      // Arrange
      const mockCategoryData = createMockCategoryWithTerm(
        1, // id
        'Test Category', // name
        'test-category', // slug
        'Test Description', // description
        0, // parent
        5, // count
      );

      // Mock category lookup
      mockPrismaService.aprTermTaxonomy.findFirst.mockResolvedValueOnce(mockCategoryData);

      // Mock posts query returning empty array
      mockPrismaService.aprPosts.findMany.mockResolvedValue([]);

      // Act
      const result = await repository.getLearnPostBySlug('test-category', 'nonexistent-post');

      // Assert
      expect(result).toBeNull();
    });
  });
});
