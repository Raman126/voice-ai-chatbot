# --- Voice AI Chatbot: React frontend image ---
# Stage 1: build the static assets with Vite
FROM node:20-slim AS build

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# Baked into the JS bundle at build time. In docker-compose this is set to
# "/api" so the browser calls the same origin, which nginx then proxies to
# the backend container — avoids CORS entirely in the containerized setup.
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Stage 2: serve the built assets with a small nginx image
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
