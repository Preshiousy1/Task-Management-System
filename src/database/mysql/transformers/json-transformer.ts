import type { ValueTransformer } from 'typeorm';

import { isNullOrUndefined } from '../../../utils/helpers/general.helpers';

export class ColumnJsonTransformer implements ValueTransformer {
  to<K = unknown>(data?: K | null): string | null {
    if (!isNullOrUndefined(data)) {
      if (typeof data === 'string') {
        return data;
      }

      return JSON.stringify(data);
    }

    return null;
  }

  from<K = unknown>(data?: string | null): K | null {
    if (!isNullOrUndefined(data)) {
      if (typeof data === 'object') {
        return data;
      }

      try {
        return JSON.parse(data);
      } catch {
        return JSON.parse('');
      }
    }

    return null;
  }
}
