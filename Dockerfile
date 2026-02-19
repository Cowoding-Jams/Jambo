FROM node:22-bullseye-slim

WORKDIR /app

RUN mkdir /app/data && \
    chown -R node:node /app

RUN npm install -g corepack@latest
RUN corepack enable

RUN apt update && \
    apt upgrade -y && \
    apt install -y \
    build-essential \
    python3 \
    dumb-init

USER node:node

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./

RUN pnpm install

COPY --chown=node:node src/ src/

RUN pnpm build

ENTRYPOINT [ "/usr/bin/dumb-init", "--" ]
CMD [ "pnpm", "start" ]
