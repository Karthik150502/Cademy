FROM node:20.12.0-alpine3.19 AS builder

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./



# Install dependencies
RUN npm install --no-audit

# Copy the rest of the application code
COPY . .

RUN ls

RUN npm run db:generate

# Build the Next.js app
RUN npm run build


# Remove development dependencies to keep the final image clean
RUN npm prune --production

# Use a smaller base image for the runtime environment
FROM node:20.12.0-alpine3.19 AS runner

# Set working directory in the final container
WORKDIR /usr/src/app

# Copy built application and necessary files from the builder stage
COPY --from=builder /usr/src/app/package.json /usr/src/app/package-lock.json*  ./
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Expose the port Next.js runs on
EXPOSE 3000

# Build args
ARG AUTH_SECRET
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG DATABASE_URL
ARG NEXT_PUBLIC_BACKEND_SERVER
ARG NEXT_PUBLIC_APP_SERVER
ARG NEXT_PUBLIC_WS_SERVER
ARG NEXT_PUBLIC_LIVEKIT_API_KEY
ARG NEXT_PUBLIC_LIVEKIT_API_SECRET
ARG NEXT_PUBLIC_LIVEKIT_WS_URL
ARG AUTH_TRUST_HOST
ARG NEXTAUTH_URL

# Set environment variables from build args
ENV AUTH_SECRET=${AUTH_SECRET}
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
ENV DATABASE_URL=${DATABASE_URL}
ENV NEXT_PUBLIC_BACKEND_SERVER=${NEXT_PUBLIC_BACKEND_SERVER}
ENV NEXT_PUBLIC_APP_SERVER=${NEXT_PUBLIC_APP_SERVER}
ENV NEXT_PUBLIC_WS_SERVER=${NEXT_PUBLIC_WS_SERVER}
ENV NEXT_PUBLIC_LIVEKIT_API_KEY=${NEXT_PUBLIC_LIVEKIT_API_KEY}
ENV NEXT_PUBLIC_LIVEKIT_API_SECRET=${NEXT_PUBLIC_LIVEKIT_API_SECRET}
ENV NEXT_PUBLIC_LIVEKIT_WS_URL=${NEXT_PUBLIC_LIVEKIT_WS_URL}
ENV AUTH_TRUST_HOST=${AUTH_TRUST_HOST}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}

# Run the Next.js app
CMD ["npm", "run", "start"]
