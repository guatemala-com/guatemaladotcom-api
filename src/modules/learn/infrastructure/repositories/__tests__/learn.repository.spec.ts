import { Test, TestingModule } from '@nestjs/testing';
import { LearnRepositoryImpl } from '../learn.repository';
import { PrismaService } from '../../../../prisma/infrastructure/prisma.service';
import { LearnCategory } from '../../../domain/entities/category.entity';

describe('LearnRepositoryImpl', () => {
  let repository: LearnRepositoryImpl;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearnRepositoryImpl,
        {
          provide: PrismaService,
          useValue: {
            aprTermTaxonomy: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<LearnRepositoryImpl>(LearnRepositoryImpl);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getCategories', () => {
    beforeEach(() => {
      // Mock Prisma findMany method
      (prismaService.aprTermTaxonomy.findMany as jest.Mock).mockResolvedValue([
        {
          termTaxonomyId: BigInt(1),
          termId: BigInt(1),
          taxonomy: 'category',
          description: 'Technology related articles',
          parent: BigInt(0),
          count: BigInt(15),
          term: {
            termId: BigInt(1),
            name: 'Technology',
            slug: 'technology',
            termGroup: BigInt(0),
          },
        },
        {
          termTaxonomyId: BigInt(2),
          termId: BigInt(2),
          taxonomy: 'category',
          description: 'Programming tutorials and guides',
          parent: BigInt(1),
          count: BigInt(8),
          term: {
            termId: BigInt(2),
            name: 'Programming',
            slug: 'programming',
            termGroup: BigInt(0),
          },
        },
      ]);
    });

    it('should return an array of learn categories with hierarchy', async () => {
      const categories = await repository.getCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBe(1); // Should have 1 root category
      expect(categories[0]).toBeInstanceOf(LearnCategory);
      expect(categories[0].name).toBe('Technology');
      expect(categories[0].children.length).toBe(1);
      expect(categories[0].children[0].name).toBe('Programming');
    });

    it('should correctly build multi-level hierarchy with all children', async () => {
      // Setup more complex hierarchy: Root -> Child -> Grandchild
      (prismaService.aprTermTaxonomy.findMany as jest.Mock).mockResolvedValue([
        {
          termTaxonomyId: BigInt(1),
          termId: BigInt(1),
          taxonomy: 'category',
          description: 'Technology articles',
          parent: BigInt(0),
          count: BigInt(20),
          term: {
            termId: BigInt(1),
            name: 'Technology',
            slug: 'technology',
            termGroup: BigInt(0),
          },
        },
        {
          termTaxonomyId: BigInt(2),
          termId: BigInt(2),
          taxonomy: 'category',
          description: 'Programming tutorials',
          parent: BigInt(1),
          count: BigInt(10),
          term: {
            termId: BigInt(2),
            name: 'Programming',
            slug: 'programming',
            termGroup: BigInt(0),
          },
        },
        {
          termTaxonomyId: BigInt(3),
          termId: BigInt(3),
          taxonomy: 'category',
          description: 'JavaScript tutorials',
          parent: BigInt(2),
          count: BigInt(5),
          term: {
            termId: BigInt(3),
            name: 'JavaScript',
            slug: 'javascript',
            termGroup: BigInt(0),
          },
        },
        {
          termTaxonomyId: BigInt(4),
          termId: BigInt(4),
          taxonomy: 'category',
          description: 'Design articles',
          parent: BigInt(1),
          count: BigInt(8),
          term: {
            termId: BigInt(4),
            name: 'Design',
            slug: 'design',
            termGroup: BigInt(0),
          },
        },
      ]);

      const categories = await repository.getCategories();
      
      // Should have 1 root category
      expect(categories.length).toBe(1);
      
      const techCategory = categories[0];
      expect(techCategory.name).toBe('Technology');
      expect(techCategory.children.length).toBe(2); // Programming and Design
      
      // Find Programming category
      const programmingCategory = techCategory.children.find(child => child.name === 'Programming');
      expect(programmingCategory).toBeDefined();
      expect(programmingCategory!.children.length).toBe(1); // JavaScript
      expect(programmingCategory!.children[0].name).toBe('JavaScript');
      
      // Find Design category
      const designCategory = techCategory.children.find(child => child.name === 'Design');
      expect(designCategory).toBeDefined();
      expect(designCategory!.children.length).toBe(0); // No children
    });
  });

  describe('getCategoryById', () => {
    it('should return a learn category if found', async () => {
      // Mock Prisma findFirst method
      (prismaService.aprTermTaxonomy.findFirst as jest.Mock).mockResolvedValue({
        termTaxonomyId: BigInt(1),
        termId: BigInt(1),
        taxonomy: 'category',
        description: 'Technology related articles',
        parent: BigInt(0),
        count: BigInt(15),
        term: {
          termId: BigInt(1),
          name: 'Technology',
          slug: 'technology',
          termGroup: BigInt(0),
        },
      });

      const id = 1;
      const category = await repository.getCategoryById(id);
      expect(category).toBeInstanceOf(LearnCategory);
      expect(category?.id).toBe(id);
      expect(category?.name).toBe('Technology');
      expect(category?.parent).toBe(0);
      expect(category?.count).toBe(15);
    });

    it('should return null if category is not found', async () => {
      // Mock Prisma findFirst method to return null
      (prismaService.aprTermTaxonomy.findFirst as jest.Mock).mockResolvedValue(
        null,
      );

      const id = 999;
      const category = await repository.getCategoryById(id);
      expect(category).toBeNull();
    });
  });
});
