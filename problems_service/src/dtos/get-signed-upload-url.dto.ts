import * as zod from 'zod';

export const contentTypeDto = zod.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp'], {
  errorMap: () => ({ message: 'Content type must be one of: image/jpeg, image/png, image/gif, image/webp' }),
});