FROM node:20-alpine

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY package*.json yarn.lock .yarnrc.yml* ./
RUN corepack enable && yarn install --immutable

COPY --chown=nextjs:nodejs . .

RUN yarn build

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health/live || exit 1

CMD ["yarn", "start"]