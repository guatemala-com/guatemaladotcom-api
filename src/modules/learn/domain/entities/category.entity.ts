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
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Get category information for API responses
   */
  toResponse() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
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
    createdAt: Date;
    updatedAt: Date;
  }): LearnCategory {
    return new LearnCategory(
      data.id,
      data.name,
      data.slug,
      data.description,
      data.createdAt,
      data.updatedAt,
    );
  }
}
