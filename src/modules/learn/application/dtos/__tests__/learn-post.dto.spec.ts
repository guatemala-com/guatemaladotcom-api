import {
  LearnPostImageDto,
  LearnPostLocationGeopointDto,
  LearnPostCategoryDto,
  LearnPostAuthorDto,
  LearnPostSeoDto,
  LearnPostResponseDto,
} from '../learn-post.dto';

describe('LearnPostDTOs', () => {
  describe('LearnPostImageDto', () => {
    it('should create an instance with all properties', () => {
      const imageDto = new LearnPostImageDto();

      imageDto.original = 'https://example.com/original.jpg';
      imageDto.thumbnail = 'https://example.com/thumbnail.jpg';
      imageDto.medium = 'https://example.com/medium.jpg';
      imageDto.web_gallery = 'https://example.com/web_gallery.jpg';
      imageDto.app_medium = 'https://example.com/app_medium.jpg';
      imageDto.events_calendar_thumb =
        'https://example.com/events_calendar_thumb.jpg';
      imageDto.events_square_100 = 'https://example.com/events_square_100.jpg';
      imageDto.events_related = 'https://example.com/events_related.jpg';
      imageDto.events_xl = 'https://example.com/events_xl.jpg';
      imageDto.image_meta = {
        title: 'Test Image',
        caption: 'Test Caption',
      };

      expect(imageDto.original).toBe('https://example.com/original.jpg');
      expect(imageDto.thumbnail).toBe('https://example.com/thumbnail.jpg');
      expect(imageDto.medium).toBe('https://example.com/medium.jpg');
      expect(imageDto.web_gallery).toBe('https://example.com/web_gallery.jpg');
      expect(imageDto.app_medium).toBe('https://example.com/app_medium.jpg');
      expect(imageDto.events_calendar_thumb).toBe(
        'https://example.com/events_calendar_thumb.jpg',
      );
      expect(imageDto.events_square_100).toBe(
        'https://example.com/events_square_100.jpg',
      );
      expect(imageDto.events_related).toBe(
        'https://example.com/events_related.jpg',
      );
      expect(imageDto.events_xl).toBe('https://example.com/events_xl.jpg');
      expect(imageDto.image_meta.title).toBe('Test Image');
      expect(imageDto.image_meta.caption).toBe('Test Caption');
    });

    it('should have all required properties defined', () => {
      const imageDto = new LearnPostImageDto();

      expect(imageDto).toHaveProperty('original');
      expect(imageDto).toHaveProperty('thumbnail');
      expect(imageDto).toHaveProperty('medium');
      expect(imageDto).toHaveProperty('web_gallery');
      expect(imageDto).toHaveProperty('app_medium');
      expect(imageDto).toHaveProperty('events_calendar_thumb');
      expect(imageDto).toHaveProperty('events_square_100');
      expect(imageDto).toHaveProperty('events_related');
      expect(imageDto).toHaveProperty('events_xl');
      expect(imageDto).toHaveProperty('image_meta');
    });
  });

  describe('LearnPostLocationGeopointDto', () => {
    it('should create an instance with latitude and longitude', () => {
      const locationDto = new LearnPostLocationGeopointDto();

      locationDto.latitude = '14.6349';
      locationDto.longitude = '-90.5069';

      expect(locationDto.latitude).toBe('14.6349');
      expect(locationDto.longitude).toBe('-90.5069');
    });

    it('should have required properties defined', () => {
      const locationDto = new LearnPostLocationGeopointDto();

      expect(locationDto).toHaveProperty('latitude');
      expect(locationDto).toHaveProperty('longitude');
    });
  });

  describe('LearnPostCategoryDto', () => {
    it('should create an instance with category data', () => {
      const categoryDto = new LearnPostCategoryDto();

      categoryDto.category_id = 1;
      categoryDto.category_name = 'Technology';
      categoryDto.category_slug = 'technology';

      expect(categoryDto.category_id).toBe(1);
      expect(categoryDto.category_name).toBe('Technology');
      expect(categoryDto.category_slug).toBe('technology');
    });

    it('should have required properties defined', () => {
      const categoryDto = new LearnPostCategoryDto();

      expect(categoryDto).toHaveProperty('category_id');
      expect(categoryDto).toHaveProperty('category_name');
      expect(categoryDto).toHaveProperty('category_slug');
    });
  });

  describe('LearnPostAuthorDto', () => {
    it('should create an instance with author data', () => {
      const authorDto = new LearnPostAuthorDto();

      authorDto.name = 'Ivon Kwei';
      authorDto.id = 123;

      expect(authorDto.name).toBe('Ivon Kwei');
      expect(authorDto.id).toBe(123);
    });

    it('should have required properties defined', () => {
      const authorDto = new LearnPostAuthorDto();

      expect(authorDto).toHaveProperty('name');
      expect(authorDto).toHaveProperty('id');
    });
  });

  describe('LearnPostSeoDto', () => {
    it('should create an instance with SEO data', () => {
      const seoDto = new LearnPostSeoDto();

      seoDto.title = 'SEO Title';
      seoDto.description = 'SEO Description';
      seoDto.canonical = 'https://example.com/canonical';
      seoDto.focus_keyword = 'test keyword';
      seoDto.seo_score = 85;
      seoDto.og_title = 'OG Title';
      seoDto.og_description = 'OG Description';
      seoDto.og_image = 'https://example.com/og-image.jpg';
      seoDto.twitter_title = 'Twitter Title';
      seoDto.twitter_description = 'Twitter Description';
      seoDto.twitter_image = 'https://example.com/twitter-image.jpg';

      expect(seoDto.title).toBe('SEO Title');
      expect(seoDto.description).toBe('SEO Description');
      expect(seoDto.canonical).toBe('https://example.com/canonical');
      expect(seoDto.focus_keyword).toBe('test keyword');
      expect(seoDto.seo_score).toBe(85);
      expect(seoDto.og_title).toBe('OG Title');
      expect(seoDto.og_description).toBe('OG Description');
      expect(seoDto.og_image).toBe('https://example.com/og-image.jpg');
      expect(seoDto.twitter_title).toBe('Twitter Title');
      expect(seoDto.twitter_description).toBe('Twitter Description');
      expect(seoDto.twitter_image).toBe(
        'https://example.com/twitter-image.jpg',
      );
    });

    it('should have all SEO properties defined', () => {
      const seoDto = new LearnPostSeoDto();

      expect(seoDto).toHaveProperty('title');
      expect(seoDto).toHaveProperty('description');
      expect(seoDto).toHaveProperty('canonical');
      expect(seoDto).toHaveProperty('focus_keyword');
      expect(seoDto).toHaveProperty('seo_score');
      expect(seoDto).toHaveProperty('og_title');
      expect(seoDto).toHaveProperty('og_description');
      expect(seoDto).toHaveProperty('og_image');
      expect(seoDto).toHaveProperty('twitter_title');
      expect(seoDto).toHaveProperty('twitter_description');
      expect(seoDto).toHaveProperty('twitter_image');
    });
  });

  describe('LearnPostResponseDto', () => {
    it('should create an instance with all main post data', () => {
      const responseDto = new LearnPostResponseDto();

      responseDto.id = 1;
      responseDto.url = 'https://example.com/post';
      responseDto.title = 'Test Post';
      responseDto.excerpt = 'Test excerpt';
      responseDto.date = '2025-07-22';
      responseDto.content = '<p>Test content</p>';
      responseDto.keywords = ['test', 'post'];
      responseDto.is_sponsored = 1;
      responseDto.sponsor_name = 'Test Sponsor';
      responseDto.sponsor_image_url = 'https://sponsor.com/image.jpg';
      responseDto.sponsor_image = [];
      responseDto.sponsor_image_sidebar_url = 'https://sponsor.com/sidebar.jpg';
      responseDto.sponsor_image_sidebar = [];
      responseDto.sponsor_image_content_url = 'https://sponsor.com/content.jpg';
      responseDto.sponsor_image_content = [];
      responseDto.sponsor_extra_data = 'Extra data';

      expect(responseDto.id).toBe(1);
      expect(responseDto.url).toBe('https://example.com/post');
      expect(responseDto.title).toBe('Test Post');
      expect(responseDto.excerpt).toBe('Test excerpt');
      expect(responseDto.date).toBe('2025-07-22');
      expect(responseDto.content).toBe('<p>Test content</p>');
      expect(responseDto.keywords).toEqual(['test', 'post']);
      expect(responseDto.is_sponsored).toBe(1);
      expect(responseDto.sponsor_name).toBe('Test Sponsor');
      expect(responseDto.sponsor_image_url).toBe(
        'https://sponsor.com/image.jpg',
      );
      expect(responseDto.sponsor_image).toEqual([]);
      expect(responseDto.sponsor_image_sidebar_url).toBe(
        'https://sponsor.com/sidebar.jpg',
      );
      expect(responseDto.sponsor_image_sidebar).toEqual([]);
      expect(responseDto.sponsor_image_content_url).toBe(
        'https://sponsor.com/content.jpg',
      );
      expect(responseDto.sponsor_image_content).toEqual([]);
      expect(responseDto.sponsor_extra_data).toBe('Extra data');
    });

    it('should have all main properties defined', () => {
      const responseDto = new LearnPostResponseDto();

      expect(responseDto).toHaveProperty('id');
      expect(responseDto).toHaveProperty('url');
      expect(responseDto).toHaveProperty('title');
      expect(responseDto).toHaveProperty('excerpt');
      expect(responseDto).toHaveProperty('date');
      expect(responseDto).toHaveProperty('images');
      expect(responseDto).toHaveProperty('location_geopoint');
      expect(responseDto).toHaveProperty('content');
      expect(responseDto).toHaveProperty('categories');
      expect(responseDto).toHaveProperty('author');
      expect(responseDto).toHaveProperty('keywords');
      expect(responseDto).toHaveProperty('is_sponsored');
      expect(responseDto).toHaveProperty('sponsor_name');
      expect(responseDto).toHaveProperty('sponsor_image_url');
      expect(responseDto).toHaveProperty('sponsor_image');
      expect(responseDto).toHaveProperty('sponsor_image_sidebar_url');
      expect(responseDto).toHaveProperty('sponsor_image_sidebar');
      expect(responseDto).toHaveProperty('sponsor_image_content_url');
      expect(responseDto).toHaveProperty('sponsor_image_content');
      expect(responseDto).toHaveProperty('sponsor_extra_data');
      expect(responseDto).toHaveProperty('seo');
    });

    it('should work with complex nested objects', () => {
      const responseDto = new LearnPostResponseDto();

      // Set up nested objects
      const imageDto = new LearnPostImageDto();
      imageDto.original = 'https://example.com/image.jpg';
      imageDto.thumbnail = 'https://example.com/thumb.jpg';
      imageDto.image_meta = { title: 'Test', caption: 'Caption' };

      const locationDto = new LearnPostLocationGeopointDto();
      locationDto.latitude = '14.6349';
      locationDto.longitude = '-90.5069';

      const categoryDto = new LearnPostCategoryDto();
      categoryDto.category_id = 1;
      categoryDto.category_name = 'Technology';
      categoryDto.category_slug = 'technology';

      const authorDto = new LearnPostAuthorDto();
      authorDto.name = 'Ivon Kwei';
      authorDto.id = 123;

      const seoDto = new LearnPostSeoDto();
      seoDto.title = 'SEO Title';
      seoDto.description = 'SEO Description';
      seoDto.seo_score = 85;

      // Assign to response DTO
      responseDto.images = [imageDto];
      responseDto.location_geopoint = locationDto;
      responseDto.categories = [categoryDto];
      responseDto.author = authorDto;
      responseDto.seo = seoDto;

      expect(responseDto.images).toHaveLength(1);
      expect(responseDto.images[0].original).toBe(
        'https://example.com/image.jpg',
      );
      expect(responseDto.location_geopoint?.latitude).toBe('14.6349');
      expect(responseDto.categories).toHaveLength(1);
      expect(responseDto.categories[0].category_name).toBe('Technology');
      expect(responseDto.author.name).toBe('Ivon Kwei');
      expect(responseDto.seo.title).toBe('SEO Title');
    });

    it('should handle null location_geopoint', () => {
      const responseDto = new LearnPostResponseDto();

      responseDto.location_geopoint = null;

      expect(responseDto.location_geopoint).toBeNull();
    });
  });
});
