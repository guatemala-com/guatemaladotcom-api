import { Injectable, NotFoundException } from '@nestjs/common';
import { LearnRepositoryImpl } from '../../infrastructure/repositories/learn.repository';
import { LearnPostResponseDto } from '../dtos/learn-post.dto';

@Injectable()
export class GetLearnPostByIdUseCase {
  constructor(private readonly learnRepository: LearnRepositoryImpl) {}

  async execute(id: number): Promise<LearnPostResponseDto> {
    const learnPost = await this.learnRepository.getLearnPostById(id);

    if (!learnPost) {
      throw new NotFoundException(`Learn post with ID ${id} not found`);
    }

    return learnPost.toResponse();
  }
}
