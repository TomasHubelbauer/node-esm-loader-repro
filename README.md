# Node ESM Loader Repro

Node 20 seemingly breaks the way ESM loaders work and it is affecting my app.
I've extracted the relevant part of the code base to this standalone repro for
the Node maintainers to be able to review the changes in behavior that I observe
between Node 19 and Node 20.

This repro follows at the heels of another ESM loader issue that I was facing
before and is captured in https://github.com/nodejs/node/issues/47566.

This issue was fixed in Node 20.1.0 and after switching to that patch version,
I have started observing this new issue documented here.

The issue has to do with how Node applies ESM loaders to packages the app might
be using, here demonstrated using Fastify and its auto-loader which discovers
routes on the file system and loads them as Node modules.

In Node 19, the auto-loader is able to pick up on the fact that the routes are
in TypeScript and the `ts-node/esm` loader is used to transpile them on the fly.

In Node 20, this behavior is not happening.
The Fastify auto-loader attempts to load the files but the custom loader is not
kicking in in this case and the TypeScript files are treated as JavaScript files
and not auto-loaded.

That's my interpretation of things, anyway, I don't have Node the knowledge it
would require to fully understand what's happening in the Node internals to make
this work in Node 19 and not work in Node 20.

## Prerequisites

NVM

## Steps

### Node 20

1. `nvm install 20` to install Node 20
2. `node --version` to ensure Node version (I get 20.1.0)
3. `npm install` to install dependencies
4. `npm run test` to run the `health.test.ts` script

Notice the test fails and Fastify's `autoload` is seemingly not aware of the
`--loader` option and attempts to load `routes/health.ts` without TypeScript to
JavaScript conversion via `ts-node/esm`.

```
npm run test

> repro@0.0.0 test
> node --loader=ts-node/esm --experimental-specifier-resolution=node --test health.test.ts

ℹ (node:95105) ExperimentalWarning: Custom ESM Loaders is an experimental feature and might change at any time
ℹ (Use `node --trace-warnings ...` to show where the warning was created)
✖ should be alive (32.750836ms)
  Error: "@fastify/autoload cannot import plugin at '/routes/health.ts'. To fix this error compile TypeScript to JavaScript or use 'ts-node' to run your app."
      at findPlugins (/node_modules/@fastify/autoload/index.js:224:15)
      at async autoload (/node-esm-loader-repro/node_modules/@fastify/autoload/index.js:35:22)

ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2208.335483

✖ failing tests:

✖ should be alive (32.750836ms)
  Error: "@fastify/autoload cannot import plugin at 'routes/health.ts'. To fix this error compile TypeScript to JavaScript or use 'ts-node' to run your app."
      at findPlugins (/node_modules/@fastify/autoload/index.js:224:15)
      at async autoload (/node_modules/@fastify/autoload/index.js:35:22)
```

### Node 19

1. `nvm install 19` to install Node 20
2. `node --version` to ensure Node version (I get 19.9.0)
3. `npm install` to install dependencies
4. `npm run test` to run the `health.test.ts` script

Notice the test passes and Fastify's `autoload` is inherit the `--loader` option
and uses the `ts-node/esm` loader successfully to auto-load `routes/health.ts`.

```
npm run test

> repro@0.0.0 test
> node --loader=ts-node/esm --experimental-specifier-resolution=node --test health.test.ts

ℹ (node:95453) ExperimentalWarning: Custom ESM Loaders is an experimental feature and might change at any time
ℹ (Use `node --trace-warnings ...` to show where the warning was created)
✔ should be alive (472.711395ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2679.742161
```
