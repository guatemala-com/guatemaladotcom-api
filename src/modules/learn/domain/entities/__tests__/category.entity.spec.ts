import { LearnCategory } from '../category.entity';

describe('LearnCategory', () => {
  describe('constructor', () => {
    it('should create an instance with all properties', () => {
      const children: LearnCategory[] = [];
      const category = new LearnCategory(
        1,
        'Technology',
        'technology',
        'Technology related articles',
        0,
        5,
        children,
      );

      expect(category.id).toBe(1);
      expect(category.name).toBe('Technology');
      expect(category.slug).toBe('technology');
      expect(category.description).toBe('Technology related articles');
      expect(category.parent).toBe(0);
      expect(category.count).toBe(5);
      expect(category.children).toBe(children);
    });
  });

  describe('hasChildren', () => {
    it('should return true when category has children', () => {
      const child = new LearnCategory(
        2,
        'Programming',
        'programming',
        'Programming articles',
        1,
        3,
        [],
      );
      const category = new LearnCategory(
        1,
        'Technology',
        'technology',
        'Technology related articles',
        0,
        5,
        [child],
      );

      expect(category.hasChildren()).toBe(true);
    });

    it('should return false when category has no children', () => {
      const category = new LearnCategory(
        1,
        'Technology',
        'technology',
        'Technology related articles',
        0,
        5,
        [],
      );

      expect(category.hasChildren()).toBe(false);
    });
  });

  describe('isRoot', () => {
    it('should return true when parent is 0', () => {
      const category = new LearnCategory(
        1,
        'Technology',
        'technology',
        'Technology related articles',
        0,
        5,
        [],
      );

      expect(category.isRoot()).toBe(true);
    });

    it('should return false when parent is not 0', () => {
      const category = new LearnCategory(
        2,
        'Programming',
        'programming',
        'Programming articles',
        1,
        3,
        [],
      );

      expect(category.isRoot()).toBe(false);
    });
  });

  describe('toResponse', () => {
    it('should return CategoryResponseDto with correct data', () => {
      const category = new LearnCategory(
        1,
        'Technology',
        'technology',
        'Technology related articles',
        0,
        5,
        [],
      );

      const response = category.toResponse();

      expect(response).toEqual({
        id: 1,
        name: 'Technology',
        slug: 'technology',
        description: 'Technology related articles',
        parent: 0,
        count: 5,
        children: [],
      });
    });

    it('should include children responses when category has children', () => {
      const child = new LearnCategory(
        2,
        'Programming',
        'programming',
        'Programming articles',
        1,
        3,
        [],
      );
      const category = new LearnCategory(
        1,
        'Technology',
        'technology',
        'Technology related articles',
        0,
        5,
        [child],
      );

      const response = category.toResponse();

      expect(response.children).toHaveLength(1);
      expect(response.children[0]).toEqual({
        id: 2,
        name: 'Programming',
        slug: 'programming',
        description: 'Programming articles',
        parent: 1,
        count: 3,
        children: [],
      });
    });

    it('should handle nested children correctly', () => {
      const grandChild = new LearnCategory(
        3,
        'JavaScript',
        'javascript',
        'JavaScript articles',
        2,
        1,
        [],
      );
      const child = new LearnCategory(
        2,
        'Programming',
        'programming',
        'Programming articles',
        1,
        3,
        [grandChild],
      );
      const category = new LearnCategory(
        1,
        'Technology',
        'technology',
        'Technology related articles',
        0,
        5,
        [child],
      );

      const response = category.toResponse();

      expect(response.children).toHaveLength(1);
      expect(response.children[0].children).toHaveLength(1);
      expect(response.children[0].children[0]).toEqual({
        id: 3,
        name: 'JavaScript',
        slug: 'javascript',
        description: 'JavaScript articles',
        parent: 2,
        count: 1,
        children: [],
      });
    });
  });

  describe('fromDatabase', () => {
    it('should create LearnCategory from database data without children', () => {
      const data = {
        id: 1,
        name: 'Technology',
        slug: 'technology',
        description: 'Technology related articles',
        parent: 0,
        count: 5,
      };

      const category = LearnCategory.fromDatabase(data);

      expect(category.id).toBe(1);
      expect(category.name).toBe('Technology');
      expect(category.slug).toBe('technology');
      expect(category.description).toBe('Technology related articles');
      expect(category.parent).toBe(0);
      expect(category.count).toBe(5);
      expect(category.children).toEqual([]);
    });

    it('should create LearnCategory from database data with children', () => {
      const childCategory = new LearnCategory(
        2,
        'Programming',
        'programming',
        'Programming articles',
        1,
        3,
        [],
      );
      const data = {
        id: 1,
        name: 'Technology',
        slug: 'technology',
        description: 'Technology related articles',
        parent: 0,
        count: 5,
        children: [childCategory],
      };

      const category = LearnCategory.fromDatabase(data);

      expect(category.id).toBe(1);
      expect(category.name).toBe('Technology');
      expect(category.slug).toBe('technology');
      expect(category.description).toBe('Technology related articles');
      expect(category.parent).toBe(0);
      expect(category.count).toBe(5);
      expect(category.children).toEqual([childCategory]);
    });

    it('should handle undefined children property', () => {
      const data = {
        id: 1,
        name: 'Technology',
        slug: 'technology',
        description: 'Technology related articles',
        parent: 0,
        count: 5,
        children: undefined,
      };

      const category = LearnCategory.fromDatabase(data);

      expect(category.children).toEqual([]);
    });
  });

  describe('integration scenarios', () => {
    it('should work correctly with complex category hierarchy', () => {
      const webDev = new LearnCategory(
        4,
        'Web Development',
        'web-development',
        'Web development articles',
        2,
        2,
        [],
      );
      const mobileDev = new LearnCategory(
        5,
        'Mobile Development',
        'mobile-development',
        'Mobile development articles',
        2,
        1,
        [],
      );
      const programming = new LearnCategory(
        2,
        'Programming',
        'programming',
        'Programming articles',
        1,
        3,
        [webDev, mobileDev],
      );
      const design = new LearnCategory(
        3,
        'Design',
        'design',
        'Design articles',
        1,
        2,
        [],
      );
      const technology = new LearnCategory(
        1,
        'Technology',
        'technology',
        'Technology related articles',
        0,
        5,
        [programming, design],
      );

      // Test root category
      expect(technology.isRoot()).toBe(true);
      expect(technology.hasChildren()).toBe(true);

      // Test child categories
      expect(programming.isRoot()).toBe(false);
      expect(programming.hasChildren()).toBe(true);
      expect(design.isRoot()).toBe(false);
      expect(design.hasChildren()).toBe(false);

      // Test grandchild categories
      expect(webDev.isRoot()).toBe(false);
      expect(webDev.hasChildren()).toBe(false);

      // Test response structure
      const response = technology.toResponse();
      expect(response.children).toHaveLength(2);
      expect(response.children[0].children).toHaveLength(2);
      expect(response.children[1].children).toHaveLength(0);
    });
  });
});
