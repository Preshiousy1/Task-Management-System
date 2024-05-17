import { BadRequestException } from '@nestjs/common';

export function capitalizeWord(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function capitalizeWords(words: string, separator = ' ') {
  return words
    .split(separator)
    .map((word) => capitalizeWord(word))
    .join(' ');
}

export const buildQueryString = (
  params?: Record<string | number | symbol, string | string[] | null | number>,
  // eslint-disable-next-line sonarjs/cognitive-complexity
): string => {
  const paramsArray: string[] = [];

  if (params && typeof params === 'object') {
    for (const key of Object.keys(params)) {
      const param = params[key];

      if (param && Array.isArray(param)) {
        for (const paramArrItem of param) {
          paramsArray.push(`${key}[]=${paramArrItem}`);
        }
      }

      if (param && !Array.isArray(param)) {
        paramsArray.push(`${key}=${param}`);
      }
    }
  }

  return paramsArray.length > 0 ? `?${paramsArray.join('&')}` : '';
};

// export const formatPhoneNumber = (phoneNumber: string): string =>
//   phoneNumber.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');

export function formatPhoneNumber(
  phoneNumber: string,
  useLength: 11 | 13,
): string {
  if (![11, 13].includes(phoneNumber.length)) {
    throw new BadRequestException(
      `The phone number is invalid. It should be 11 or 13 digits`,
    );
  }

  if (phoneNumber.length === useLength) {
    return phoneNumber;
  }

  if (phoneNumber.length === 13 && useLength === 11) {
    if (!phoneNumber.startsWith('234')) {
      throw new BadRequestException(
        `The phone number is invalid. It should start with +234`,
      );
    }

    // replace 234 with 0
    phoneNumber = phoneNumber.replace('234', '0');
  }

  return phoneNumber;
}
