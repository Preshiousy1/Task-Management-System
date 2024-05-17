export const convertToType = (
  value: string,
  dataType: 'string' | 'number' | 'boolean' | 'object',
): string | number | boolean | Record<string, unknown> => {
  switch (dataType) {
    case 'string': {
      return value;
    }

    case 'number': {
      return Number(value);
    }

    case 'boolean': {
      return Boolean(value);
    }

    case 'object': {
      return JSON.parse(value);
    }
  }
};

export function isNullOrUndefined<T>(
  obj: T | null | undefined,
): obj is null | undefined {
  return obj === undefined || obj === null;
}

export const toKebabCase = (stringChars) =>
  stringChars
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+\d*|\b)|[A-Z]?[a-z]+\d*|[A-Z]|\d+/g)
    .join('-')
    .toLowerCase();

export const clearAndUpper = (text: string) =>
  text.replace(/-/, '').toUpperCase();

export const toPascalCase = (text: string) =>
  text.replace(/(^\w|-\w)/g, clearAndUpper);
