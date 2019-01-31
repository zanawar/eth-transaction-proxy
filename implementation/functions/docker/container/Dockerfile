FROM microsoft/azure-functions-node8:2.0

ENV AzureWebJobsScriptRoot=/home/site/wwwroot

# install git
RUN apt-get update -qq && \
    apt-get install -qqy --no-install-recommends\
      apt-transport-https \
      build-essential \
      ca-certificates \
      git 

COPY tsconfig.json /usr/proxy/
COPY tslint.json /usr/proxy/
COPY ./src/ /usr/proxy/src/

WORKDIR /usr/proxy/src/
RUN npm install --unsafe-perm
RUN npm run build --unsafe-perm

WORKDIR /usr/proxy/bin/eth-transaction-proxy/
RUN ls

COPY ./implementation/functions/src/ /home/site/wwwroot

WORKDIR /home/site/wwwroot/
RUN npm install /usr/proxy/bin/eth-transaction-proxy/
RUN npm install

