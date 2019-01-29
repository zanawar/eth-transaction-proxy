FROM node:11.6

COPY package.json /usr/notary/
COPY tsconfig.json /usr/notary/
COPY tslint.json /usr/notary/

COPY ./src/ /usr/notary/src/
WORKDIR /usr/notary/src
RUN npm install --unseafe-perm
RUN npm run build

COPY ./test/ /usr/notary/test/
WORKDIR /usr/notary/test
RUN npm install --unsafe-perm
RUN npm run build

WORKDIR /usr/notary/bin/test
CMD npm run test-all
