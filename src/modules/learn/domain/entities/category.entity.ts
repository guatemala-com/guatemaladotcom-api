/**
 * Learn Category Entity
 *
 * Represents a learning category for read-only operations.
 * This is a domain entity that encapsulates the business logic for categories.
 */
export class LearnCategory {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string,
    public readonly parent: number,
    public readonly count: number,
    public readonly children: LearnCategory[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
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
  toResponse() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      parent: this.parent,
      count: this.count,
      children: this.children.map(child => child.toResponse()),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
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
    createdAt: Date;
    updatedAt: Date;
  }): LearnCategory {
    return new LearnCategory(
      data.id,
      data.name,
      data.slug,
      data.description,
      data.parent,
      data.count,
      data.children || [],
      data.createdAt,
      data.updatedAt,
    );
  }
}
