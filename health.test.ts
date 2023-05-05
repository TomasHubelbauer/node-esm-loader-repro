
import fastifyAutoload from '@fastify/autoload';
import Fastify from 'fastify';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'url';

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
console.log(response.statusCode, 200);
console.log(json.received, true);
