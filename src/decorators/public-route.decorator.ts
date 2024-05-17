import type { CustomDecorator } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PublicRoute = (isPublic = true): CustomDecorator =>
  SetMetadata(IS_PUBLIC_KEY, isPublic);
