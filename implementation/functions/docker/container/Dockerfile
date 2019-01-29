FROM microsoft/azure-functions-node8:2.0

ENV AzureWebJobsScriptRoot=/home/site/wwwroot

# install git
RUN apt-get update -qq && \
    apt-get install -qqy --no-install-recommends\
      apt-transport-https \
      build-essential \
      ca-certificates \
      git 

COPY ./bin/eth-transaction-proxy/ /home/lib/eth-transaction-proxy/

COPY ./examples/functions/src/ /home/site/wwwroot
WORKDIR /home/site/wwwroot

RUN npm install /home/lib/eth-transaction-proxy/

