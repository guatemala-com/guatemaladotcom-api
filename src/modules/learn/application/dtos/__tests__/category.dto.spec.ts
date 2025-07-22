import { CategoryResponseDto } from '../category.dto';

describe('CategoryResponseDto', () => {
  it('should create an instance with all properties assigned', () => {
    const childDto = new CategoryResponseDto();
    childDto.id = 2;
    childDto.name = 'Child Category';
    childDto.slug = 'child-category';
    childDto.description = 'A child category.';
    childDto.parent = 1;
    childDto.count = 5;
    childDto.children = [];

    const dto = new CategoryResponseDto();
    dto.id = 1;
    dto.name = 'Test Category';
    dto.slug = 'test-category';
    dto.description = 'A test category.';
    dto.parent = 0;
    dto.count = 10;
    dto.children = [childDto];

    expect(dto).toBeInstanceOf(CategoryResponseDto);
    expect(dto.id).toBe(1);
    expect(dto.name).toBe('Test Category');
    expect(dto.slug).toBe('test-category');
    expect(dto.description).toBe('A test category.');
    expect(dto.parent).toBe(0);
    expect(dto.count).toBe(10);
    expect(dto.children).toHaveLength(1);
    expect(dto.children[0]).toBe(childDto);
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
    expect(dto.parent).toBeUndefined();
    expect(dto.count).toBeUndefined();
    expect(dto.children).toBeUndefined();
  });
});
