FROM node:20.12.0-alpine3.19 AS builder

RUN apk add --no-cache curl bash openssl

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./



# Install dependencies
RUN npm install --no-audit

# Copy the rest of the application code
COPY . .

RUN ls

RUN npm run db:generate

RUN npm run build

# Remove development dependencies to keep the final image clean
RUN npm prune --production

# Use a smaller base image for the runtime environment
FROM node:20.12.0-alpine3.19 AS runner

# Set working directory in the final container
WORKDIR /usr/src/app

# Copy built application and necessary files from the builder stage
COPY --from=builder /usr/src/app/package.json /usr/src/app/package-lock.json*  ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Expose the port runs on
EXPOSE 8001

# Build args
ARG DATABASE_URL

# Set environment variables from build args
ENV DATABASE_URL=${DATABASE_URL}

# Run app
CMD ["npm", "run", "start"]
