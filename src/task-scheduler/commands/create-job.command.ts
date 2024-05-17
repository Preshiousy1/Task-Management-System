import { Logger } from '@nestjs/common';
import fs from 'fs';

import { toKebabCase, toPascalCase } from '../../utils/helpers/general.helpers';

const logger = new Logger('jobs:create');

const getJobName = (): string | false => {
  const args = process.argv;

  if (args.length > 3 || !Number.isNaN(Number(args[2]))) {
    logger.error(`A valid job name is required!`);

    return false;
  }

  if (args[2].length < 3) {
    logger.error(`A job name must be 3 or more characters!`);

    return false;
  }

  return toKebabCase(args[2]);
};

const createJob = (name: string) => {
  const jobsDir = 'src/task-scheduler/jobs';
  const content = fs.readFileSync('src/stubs/job.stub.txt');

  if (!fs.existsSync(jobsDir)) {
    fs.mkdirSync(jobsDir, {
      recursive: true,
    });
  }

  const fileDir = `${jobsDir}/${name}.job.ts`;

  if (fs.existsSync(fileDir)) {
    return logger.error(`The file ${jobsDir}/${name}.job.ts already exists!`);
  }

  const namePascal: string = toPascalCase(name);

  const result = content.toString().replace('StubJobName', namePascal);

  fs.writeFile(fileDir, result, (err) => {
    if (err) {
      return logger.error('There was an error creating the file', err);
    }

    return logger.log(`The job: ${fileDir} has been created!`);
  });
};

const name = getJobName();

if (name) {
  createJob(name);
}
