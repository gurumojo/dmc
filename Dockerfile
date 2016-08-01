FROM ubuntu

MAINTAINER theguy@gurumojo.net

ENV TERM=linux GURUMOJO=development

RUN apt-get update && apt-get upgrade -y &&\
  apt-get install -y nodejs &&\
  rm -rf /var/lib/apt/lists/* &&\
  env && date

VOLUME /opt/gurumojo

WORKDIR /opt/gurumojo

CMD ["js", "."]
