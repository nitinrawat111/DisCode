import zod from 'zod';
import { titleDto, markdownKeyDto, testKeysDto, difficultyDto, tagsDto } from './problem.dto';

export const createProblemDto = zod.object({
  title: titleDto,
  markdownKey: markdownKeyDto,
  testKeys: testKeysDto,
  difficulty: difficultyDto,
  tags: tagsDto,
});