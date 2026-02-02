import { test } from '../platform/fixtures/testcontainers';
import { FFService } from '../dsl/ff-service';
import { randomInt } from './helper';

test('the user should be able to see a list of environments', async ({ feURL }) => {
  const ffservice = new FFService(feURL);
  await ffservice.showEnvironments();
});

test('the user should be able to see a list of services associated with an environment', async ({ feURL }) => {
  const ffservice = new FFService(feURL);
  const envs: string[] = await ffservice.showEnvironments();
  const env: string = envs[randomInt(envs.length)];
  await ffservice.showServices(env)
});
