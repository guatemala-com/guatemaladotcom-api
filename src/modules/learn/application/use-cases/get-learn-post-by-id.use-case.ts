import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { LearnRepository } from '../../domain/repositories/learn.repository.interface';
import { LearnPostResponseDto } from '../dtos/learn-post.dto';

@Injectable()
export class GetLearnPostByIdUseCase {
  constructor(
    @Inject('LearnRepository')
    private readonly learnRepository: LearnRepository,
  ) {}

  async execute(id: number): Promise<LearnPostResponseDto> {
    const learnPost = await this.learnRepository.getLearnPostById(id);

    if (!learnPost) {
      throw new NotFoundException(`Learn post with ID ${id} not found`);
    }

    return learnPost.toResponse();
  }
}
