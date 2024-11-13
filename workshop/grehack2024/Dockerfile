FROM alpine:3.20.3

COPY ./app /usr/app
WORKDIR /usr/app
RUN apk add --update --no-cache nodejs npm && \
    npm install                            && \
    npm run build                          && \
    npm install -g serve

CMD ["serve", "-s", "dist", "-l", "3000"]
