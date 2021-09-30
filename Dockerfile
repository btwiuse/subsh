FROM node:buster

RUN apt update && apt install -y curl bash git tmux vim

COPY . /app

# RUN chmod +x /app/entrypoint.sh

WORKDIR /app/

RUN yarn && yarn build && npm link

CMD [ "bob"]
