FROM node:10

COPY ./ /usr/src/app/

ENV NODE_ENV dev

WORKDIR /usr/src/app
RUN npm update
RUN npm install

WORKDIR /usr/src/app/api
RUN npm install
RUN npm run build

WORKDIR /usr/src/app/test
RUN npm install
CMD npm run ${TEST}
