
import fastifyAutoload from '@fastify/autoload';
import Fastify from 'fastify';
import * as assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { it } from 'node:test';
import { fileURLToPath } from 'url';

it('should be alive', async () => {
  const fastify = Fastify();

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  fastify.register(fastifyAutoload, {
    dir: join(__dirname, 'routes'),
    forceESM: true,
  });

  const response = await fastify.inject({
    url: `/health`,
    method: 'GET',
  });
  const json = JSON.parse(response.body);
  assert.equal(response.statusCode, 200);
  assert.equal(json.received, true);
});
