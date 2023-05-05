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

## This Branch

This branch tests whether removing `--test` makes any difference.
It doesn't.

See the `main` branch for the root of the issue.

## Tickets

- Node: https://github.com/nodejs/node/issues/47880
- Fastify: https://github.com/fastify/fastify/issues/4734

I suspect this is a Node issue but I think it is in the realm of possibility
that this is a Fastify issue or even if not, that they might be able to develop
a workaround, so I've opened an issue with both Node and Fastify.

## Prerequisites

NVM

## Steps

### Node 20

1. `nvm install 20` to install Node 20
2. `node --version` to ensure Node version (I get 20.1.0)
3. `npm install` to install dependencies
4. `npm start` to run the `health.test.ts` script

Notice the test fails and Fastify's `autoload` is seemingly not aware of the
`--loader` option and attempts to load `routes/health.ts` without TypeScript to
JavaScript conversion via `ts-node/esm`.

```
npm start

> repro@0.0.0 start
> node --loader=ts-node/esm --experimental-specifier-resolution=node health.test.ts

(node:3919) ExperimentalWarning: Custom ESM Loaders is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
/node_modules/@fastify/autoload/index.js:224
        throw new Error(`@fastify/autoload cannot import plugin at '${file}'. To fix this error compile TypeScript to JavaScript or use 'ts-node' to run your app.`)
              ^

Error: @fastify/autoload cannot import plugin at '/routes/health.ts'. To fix this error compile TypeScript to JavaScript or use 'ts-node' to run your app.
    at findPlugins (/node_modules/@fastify/autoload/index.js:224:15)
    at async autoload (/node-esm-loader-repro/node_modules/@fastify/autoload/index.js:35:22)
```

### Node 19

1. `nvm install 19` to install Node 20
2. `node --version` to ensure Node version (I get 19.9.0)
3. `npm install` to install dependencies
4. `npm start` to run the `health.test.ts` script

Notice the test passes and Fastify's `autoload` is inherit the `--loader` option
and uses the `ts-node/esm` loader successfully to auto-load `routes/health.ts`.

```
npm start 

> repro@0.0.0 start
> node --loader=ts-node/esm --experimental-specifier-resolution=node health.test.ts

(node:4199) ExperimentalWarning: Custom ESM Loaders is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
200 200
true true
```
