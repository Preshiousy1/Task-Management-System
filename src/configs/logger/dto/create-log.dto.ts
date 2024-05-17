export class CreateLogDto {
  env: string;

  context?: string;

  level: string;

  message: string;

  stack?: string;

  data: string;
}
