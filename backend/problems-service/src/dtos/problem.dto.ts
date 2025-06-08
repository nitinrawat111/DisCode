import zod from "zod";

export const problemIdDto = zod.string().uuid();
export const difficultyDto = zod.enum(["easy", "medium", "hard"]);
export const tagsDto = zod.array(zod.string()).min(1);
export const markdownKeyDto = zod.string().min(1);
export const testKeysDto = zod.array(zod.string()).min(1);
export const titleDto = zod.string().min(2).max(100);
