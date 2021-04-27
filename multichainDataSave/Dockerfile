# Eurecat-iCommunity besu-API Dockerfile
#
# Version 0.0.1

FROM ubuntu
LABEL Description="This image is used to start the api to notarize documents on the alastira network" Version="0.0.1"

RUN rm /bin/sh && ln -s /bin/bash /bin/sh
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections
RUN apt-get update && apt-get install -y -q --no-install-recommends \
	apt-transport-https \
	build-essential \
	ca-certificates \
	curl \
	git \
	libssl-dev \
	python \
	wget \
    && rm -rf /var/lib/apt/lists/*

ENV NVM_DIR /opt/.nvm
ENV NODE_VERSION 12.19.0
RUN mkdir -p $NVM_DIR

RUN curl --silent -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash \
	&& source $NVM_DIR/nvm.sh \
	&& nvm install $NODE_VERSION \
	&& nvm alias default $NODE_VERSION \
	&& nvm use default

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH


COPY ./api-swagger /opt/api-swagger
WORKDIR /opt/api-swagger
RUN npm install && npm audit fix

EXPOSE 10010
CMD ["npm","start"]
