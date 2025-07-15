import { Injectable } from '@nestjs/common';
import { LearnRepository } from '../../domain/repositories/learn.repository.interface';
import { LearnCategory } from '../../domain/entities/category.entity';
import { PrismaService } from '../../../prisma/infrastructure/prisma.service';

@Injectable()
export class LearnRepositoryImpl implements LearnRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories(): Promise<LearnCategory[]> {
    const mockCategories = [
      {
        id: 1,
        name: 'Category 1',
        slug: 'category-1',
        description: 'Description 1',
      },
      {
        id: 2,
        name: 'Category 2',
        slug: 'category-2',
        description: 'Description 2',
      },
    ];

    return Promise.resolve(
      mockCategories.map((category) => {
        return new LearnCategory(
          category.id,
          category.name,
          category.slug,
          category.description,
          new Date(),
          new Date(),
        );
      }),
    );
  }

  getCategoryById(id: number): Promise<LearnCategory | null> {
    const mockCategories = [
      {
        id: 1,
        name: 'Category 1',
        slug: 'category-1',
        description: 'Description 1',
      },
      {
        id: 2,
        name: 'Category 2',
        slug: 'category-2',
        description: 'Description 2',
      },
    ];

    const category = mockCategories.find((cat) => cat.id === id);

    if (!category) {
      return Promise.resolve(null);
    }

    return Promise.resolve(
      new LearnCategory(
        category.id,
        category.name,
        category.slug,
        category.description,
        new Date(),
        new Date(),
      ),
    );
  }
}
