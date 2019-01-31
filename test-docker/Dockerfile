FROM node:11.6

COPY package.json /usr/proxy/
COPY tsconfig.json /usr/proxy/
COPY tslint.json /usr/proxy/

COPY ./src/ /usr/proxy/src/
COPY ./test/ /usr/proxy/test/
WORKDIR /usr/proxy/

RUN npm install --unsafe-perm
RUN npm run build --unsafe-perm

RUN npm run install-test --unsafe-perm
RUN npm run build-test --unsafe-perm

# For some reason Docker acts up an requires a re-install of mocha
WORKDIR /usr/proxy/bin/test
RUN npm uninstall -D mocha && npm i -D mocha

WORKDIR /usr/proxy/
CMD npm run test
