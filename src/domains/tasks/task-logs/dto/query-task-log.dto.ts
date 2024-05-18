import { PartialType } from '@nestjs/swagger';

import { CreateTaskLogDto } from './create-task-log.dto';

export class QueryTaskLogDto extends PartialType(CreateTaskLogDto) {}
