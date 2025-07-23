import { Injectable, NotFoundException } from '@nestjs/common';
import { LearnRepositoryImpl } from '../../infrastructure/repositories/learn.repository';
import { LearnPostResponseDto } from '../dtos/learn-post.dto';

@Injectable()
export class GetLearnPostBySlugUseCase {
  constructor(private readonly learnRepository: LearnRepositoryImpl) {}

  async execute(
    categorySlug: string,
    articleSlug: string,
  ): Promise<LearnPostResponseDto> {
    const learnPost = await this.learnRepository.getLearnPostBySlug(
      categorySlug,
      articleSlug,
    );

    if (!learnPost) {
      throw new NotFoundException(
        `Article '${articleSlug}' not found in category '${categorySlug}'`,
      );
    }

    return learnPost.toResponse();
  }
}
