import zod from 'zod';
import { titleDto, markdownKeyDto, testKeysDto, difficultyDto, tagsDto } from './problem.dto';

export const updateProblemDto = zod.object({
  title: titleDto.optional(),
  markdownKey: markdownKeyDto.optional(),
  testKeys: testKeysDto.optional(),
  difficulty: difficultyDto.optional(),
  tags: tagsDto.optional(),
});