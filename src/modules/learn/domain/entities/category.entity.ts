/**
 * Learn Category Entity
 *
 * Represents a learning category for read-only operations.
 * This is a domain entity that encapsulates the business logic for categories.
 */
import { CategoryResponseDto } from '../../application/dtos/category.dto';

export class LearnCategory {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string,
    public readonly parent: number,
    public readonly count: number,
    public readonly children: LearnCategory[],
  ) {}

  /**
   * Check if this category has children
   */
  hasChildren(): boolean {
    return this.children.length > 0;
  }

  /**
   * Check if this category is a root category (no parent)
   */
  isRoot(): boolean {
    return this.parent === 0;
  }

  /**
   * Get category information for API responses
   */
  toResponse(): CategoryResponseDto {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      parent: this.parent,
      count: this.count,
      children: this.children.map((child) => child.toResponse()),
    };
  }

  /**
   * Create a LearnCategory from database data
   */
  static fromDatabase(data: {
    id: number;
    name: string;
    slug: string;
    description: string;
    parent: number;
    count: number;
    children?: LearnCategory[];
  }): LearnCategory {
    return new LearnCategory(
      data.id,
      data.name,
      data.slug,
      data.description,
      data.parent,
      data.count,
      data.children || [],
    );
  }
}
