# syntax=docker/dockerfile:1.5
FROM node:18 as compile

WORKDIR /usr/src/zirkel-kafka-adapter
COPY package.json pnpm-lock.yaml tsconfig.json .eslintrc.js .eslintignore ./
COPY src ./src

RUN --mount=type=secret,mode=0644,id=npmrc,target=/usr/src/zirkel-kafka-adapter/.npmrc npm i -g pnpm \
  && pnpm i \
  && pnpm build

FROM node:18 as build

ENV DUMB_INIT_VERSION 1.2.5
WORKDIR /usr/src/zirkel-kafka-adapter

COPY package.json pnpm-lock.yaml ./

RUN  --mount=type=secret,mode=0644,id=npmrc,target=/usr/src/zirkel-kafka-adapter/.npmrc npm i -g pnpm \
  && apt-get update && apt-get install -y --no-install-recommends \
  && wget --progress=dot:giga -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v${DUMB_INIT_VERSION}/dumb-init_${DUMB_INIT_VERSION}_x86_64 \
  && chmod +x /usr/local/bin/dumb-init \
  && pnpm i -P

FROM gcr.io/distroless/nodejs:18 as distroless
ENV NODE_ENV=production
USER 1000
WORKDIR /usr/src/zirkel-kafka-adapter
COPY --chown=1000:1000 --from=compile /usr/src/zirkel-kafka-adapter/dist ./dist
COPY --chown=1000:1000 --from=build /usr/src/zirkel-kafka-adapter/node_modules ./node_modules
COPY --chown=1000:1000 --from=build /usr/local/bin/dumb-init /usr/local/bin/dumb-init 

EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD [ "/nodejs/bin/node", "dist/main.js" ]


FROM gcr.io/distroless/nodejs18-debian11:debug as debug
ENV NODE_ENV=production
USER 1000
WORKDIR /usr/src/zirkel-kafka-adapter
COPY --chown=1000:1000 --from=compile /usr/src/zirkel-kafka-adapter/dist ./dist
COPY --chown=1000:1000 --from=build /usr/src/zirkel-kafka-adapter/node_modules ./node_modules
COPY --chown=1000:1000 --from=build /usr/local/bin/dumb-init /usr/local/bin/dumb-init 

EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD [ "/nodejs/bin/node", "dist/main.js" ]