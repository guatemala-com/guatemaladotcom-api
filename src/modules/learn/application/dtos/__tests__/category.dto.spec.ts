import { CategoryResponseDto } from '../category.dto';

describe('CategoryResponseDto', () => {
  it('should create an instance with all properties assigned', () => {
    const now = new Date().toISOString();
    const dto = new CategoryResponseDto();
    dto.id = 1;
    dto.name = 'Test Category';
    dto.slug = 'test-category';
    dto.description = 'A test category.';
    dto.createdAt = now;
    dto.updatedAt = now;

    expect(dto).toBeInstanceOf(CategoryResponseDto);
    expect(dto.id).toBe(1);
    expect(dto.name).toBe('Test Category');
    expect(dto.slug).toBe('test-category');
    expect(dto.description).toBe('A test category.');
    expect(dto.createdAt).toBe(now);
    expect(dto.updatedAt).toBe(now);
  });

  it('should allow partial assignment', () => {
    const dto = new CategoryResponseDto();
    dto.id = 2;
    dto.name = 'Partial';
    // other fields remain undefined
    expect(dto.id).toBe(2);
    expect(dto.name).toBe('Partial');
    expect(dto.slug).toBeUndefined();
    expect(dto.description).toBeUndefined();
    expect(dto.createdAt).toBeUndefined();
    expect(dto.updatedAt).toBeUndefined();
  });
});
