import type { ValueTransformer } from 'typeorm';

import { isNullOrUndefined } from '../../../utils/helpers/general.helpers';

export class ColumnNumberTransformer implements ValueTransformer {
  to(data?: number | null): number | null {
    if (!isNullOrUndefined(data)) {
      return data;
    }

    return null;
  }

  from(data?: string | null): number | null {
    if (!isNullOrUndefined(data)) {
      const res = Number.parseFloat(data);

      if (Number.isNaN(res)) {
        return null;
      }

      return res;
    }

    return null;
  }
}
