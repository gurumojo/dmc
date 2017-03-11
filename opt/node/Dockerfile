FROM node:slim

RUN apt-get update && apt-get upgrade -y &&\
  apt-get install -y jq rsync &&\
  rm -rf /var/lib/apt/lists/* &&\
  env && date

WORKDIR /opt/dmc
