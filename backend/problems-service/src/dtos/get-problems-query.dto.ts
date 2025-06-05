import zod from 'zod';
import { difficultyDto, tagsDto } from './problem.dto';

export const getProblemsQueryDto = zod.object({
  searchQuery: zod.string().optional(),
  tags: tagsDto.optional(),
  difficulty: difficultyDto.optional(),
  limit: zod.preprocess(
    (value) => (typeof value === 'string' ? parseInt(value, 10) : value), // Convert string to number
    zod.number().positive().max(100).default(10) // Validate as a positive number
  ),
  sort: zod.enum(['createdAt', 'relevancy']).default('createdAt'),
  cursor: zod.string().optional(), // Cursor for pagination
});