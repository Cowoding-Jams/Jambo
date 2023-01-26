FROM node:18-bullseye-slim

WORKDIR /app

RUN mkdir /app/data && \
    chown -R node:node /app

RUN apt update && \
    apt upgrade -y && \
    apt install -y \
    build-essential \
    python3 \
    dumb-init

USER node:node

COPY --chown=node:node package-lock.json package.json tsconfig.json ./

RUN sed -i 's/"prepare": "husky install"/"prepare": ""/' ./package.json

RUN npm install

COPY --chown=node:node src/ src/

RUN npm run build

ENTRYPOINT [ "/usr/bin/dumb-init", "--" ]
CMD [ "npm", "run", "run" ]
